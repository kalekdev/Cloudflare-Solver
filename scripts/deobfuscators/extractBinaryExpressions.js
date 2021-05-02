const {
    refactor
} = require('shift-refactor');
const {
    default: codegen
} = require('shift-codegen');
const Shift = require('shift-ast');
const beautify = require('js-beautify');
const fs = require('fs');

const OUTPUT_STEPS = false;

// Read file and create refactor session
let source = fs.readFileSync('../obfuscated/jsch.js', 'utf-8');
const $script = refactor(source);

// Find string literal array
let arrayName = $script('AssignmentExpression[expression.callee.type = "StaticMemberExpression"]').nodes[0].binding.name;
let arrayString = $script('StaticMemberExpression[object.type = "LiteralStringExpression"]').nodes[0].object.value;
let literalArray = arrayString.split(',');


// Extract array shift function and array shift index
let arrayShiftCall = $script('CallExpression[arguments.length = 2]')
    .filter(node => node.arguments[1].type == 'LiteralNumericExpression')
    .nodes[0];

let arrayShiftIndex = arrayShiftCall.arguments[1].value;
let arrayShiftFunctionString = codegen(
    new Shift.FunctionExpression({
        params: arrayShiftCall.callee.params,
        body: arrayShiftCall.callee.body
    }));

let arrayShiftFunction = eval('(' + arrayShiftFunctionString + ')');
arrayShiftFunction(literalArray, arrayShiftIndex);


// Replace literal array name with the extracted literal array
$script(`ComputedMemberExpression[object.name = '${arrayName}']`).replace(node => {
    return new Shift.ComputedMemberExpression({
        object: {
            type: "IdentifierExpression",
            name: "literalArray"
        },
        expression: node.expression
    })
});


// Extract literal array indexing function
let arrayIndexingFunctionNode = $script('FunctionExpression[params.items.length = 2]');
let arrayIndexingFunctionName = arrayIndexingFunctionNode.parents().nodes[0].binding.name;
let arrayIndexingFunctionString = codegen(arrayIndexingFunctionNode.nodes[0]);
let arrayValueExtractionFunction = eval('(' + arrayIndexingFunctionString + ')');

// Find and replace usages of array indexing function
$script(`CallExpression[callee.name = "${arrayIndexingFunctionName}"]`).replace(node => {
    return new Shift.LiteralStringExpression({
        value: arrayValueExtractionFunction(...(node.arguments.map(a => a.value)))
    });
});


function isCommaBinaryExpression(node) {
    return node && (node.type == "BinaryExpression") && (node.operator == ",")
}

let statementsToExpandAsBlock = ["IfStatement",  "ForStatement", "WhileStatement", "DoWhileStatement"]
let comparisonOperators = ["<", ">", "==", "===", "!=", "!===", ">=", "<="];
let compOpsLtr         = [">", ">=", "==", "===", "!=", "!==="];
let compOpsLtrOpposite = ["<", "<=", "==", "===", "!=", "!==="];
let equalityOps = ["==", "===", "!=", "!==="];
let compOpsRtl         = [">", ">="];
let compOpsRtlOpposite = ["<", "<="];
let wellKnownLiterals = ["prototype", "hasOwnProperty", "call", "push", "length", "timeout", 
                         "charCodeAt", "charAt", "pow", "shift", "JSON", "Date", "setTime", "getTime",
                         "test", "toUTCString", "valueOf", "replace", "toJSON", "toString", "join",
                         "getUTCFullYear", "getUTCMonth", "getUTCDate", "getUTCHours", "getUTCMinutes",
                         "getUTCSeconds", "stringify", "document", "slice", "fromCharCode", "createElement",
                         "getElementById", "console", "log", "indexOf", "cookie", "style", "setTimeout",
                         "compressToEncodedURIComponent"]

let isTransformed = false;
let transformationCounter = 0;

do
{
    isTransformed = false;
    // ######  STEP 1, Transforming ','

    //a=(b>c)?(d,e):(f,g) ->
    // if(b > c)
    //  a = (d,e);
    // else
    //  b = (f,g);

    // ConditionalExpression
    $script("ExpressionStatement").filter(node =>
        {
            let children = $script(node).query("ExpressionStatement > AssignmentExpression > ConditionalExpression > BinaryExpression[operator = ',']").nodes;
            return (children.length === 1) && ($script($script(children[0]).parents().nodes[0]).parents().nodes[0] == node);
        }).replace(node => 
        {
            let assignment = node.expression;
            let condExpr = assignment.expression;

            isTransformed = true;

            return new IfStatement({
                type: "IfStatement",
                test: condExpr.test,
                consequent: new ExpressionStatement({
                    expression: new AssignmentExpression({
                        binding: assignment.binding,
                        expression: condExpr.consequent
                    })
                }),
                alternate: new ExpressionStatement({
                    expression: new AssignmentExpression({
                        binding: assignment.binding,
                        expression: condExpr.alternate
                    })
                })
            });
    });

    //(b>c)?(d,e):(f,g) ->
    // if(b > c)
    //  (d,e);
    // else
    //  (f,g);

    $script("ExpressionStatement").filter(node =>
        {
            let childs = $script(node).query("ExpressionStatement > ConditionalExpression > BinaryExpression[operator = ',']").nodes;
            return (childs.length == 1) && ($script($script(childs[0]).parents().nodes[0]).parents().nodes[0] == node);        
        }).replace(node => 
        {
            let condExpr = node.expression;
            isTransformed = true;

            return new Shift.IfStatement({
                test: condExpr.test,
                consequent: new Shift.BlockStatement({
                    block: new Shift.Block({
                        statements:[
                            new Shift.ExpressionStatement({
                                    expression: condExpr.consequent
                                })
                            ]
                        })
                    }),
                alternate: new Shift.BlockStatement({
                    block: new Shift.Block({
                        statements:[
                            new Shift.ExpressionStatement({
                                    expression: condExpr.alternate
                                })
                            ]
                        })
                    })
                
                
            });
    });


    // fast if
    $script("IfStatement[test.type = 'BinaryExpression'][test.operator = ',']").replace(node => {
        // Skipped these scenarios: if ((A,B)>C)
        // requires a deep lookup as test will always contain a non "," BinaryExpression at the top layer.

        let parent = $script(node).parents().nodes[0];
        let innerExpression = node.test;
        node.test = innerExpression.right;

        let initObj = {
            statements: [
                new Shift.ExpressionStatement({
                    expression: innerExpression.left
                }),
                node
            ]
        };

        let resultNode;

        if(statementsToExpandAsBlock.indexOf(parent.type) < 0)
            resultNode = new Shift.SimpleBlockStatement(initObj);
        else
            resultNode = new Shift.BlockStatement({
                block: new Shift.Block(initObj)
            });

        isTransformed = true;
        return resultNode;
    });

    //deep if
    /*$script("IfStatement[node.test.type = 'BinaryExpression']").replace(node => {
        // Skipped these scenarios: if ((A,B)>C)
        // requires a deep lookup as test will always contain a non "," BinaryExpression at the top layer.

        let innerExpression = node.test;
        node.test = innerExpression.right;

        return new Shift.Block({
            statements: [new Shift.ExpressionStatement({
                expression: innerExpression.left
            }), node]
        });
    });*/

    $script("SwitchStatementWithDefault[discriminant.type = 'BinaryExpression'][discriminant.operator = ','], SwitchStatement[discriminant.type = 'BinaryExpression'][discriminant.operator = ',']").replace(node => {
        let innerExpression = node.discriminant;
        node.discriminant = innerExpression.right;

        isTransformed = true;
        return new Shift.SimpleBlockStatement({
            statements: [new Shift.ExpressionStatement({
                expression: innerExpression.left
            }),
            node]
        });
    });


    $script("ForStatement[test.type = 'BinaryExpression'][test.operator = ','], WhileStatement[test.type = 'BinaryExpression'][test.operator = ',']").replace(node => {
        let testExpression = node.test;
        const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let resultName = 'result_';
        for (let i = 0; i < 5; i++) {
            resultName += alphabet[Math.trunc(Math.random() * alphabet.length)];
        }

        let leftTestStatement = new Shift.ExpressionStatement({
            expression: testExpression.left
        })

        let ifTestAssignExpr = new Shift.AssignmentExpression({
            binding: new Shift.AssignmentTargetIdentifier({
                name: resultName
            }),
            expression: testExpression.right
        })

        let ifBodyStatements = [node.body];
        if (node.type == "ForStatement" && node.update)
            ifBodyStatements.push(new Shift.ExpressionStatement({
                expression: node.update
            }))

        let ifStatement = new Shift.IfStatement({
            test: ifTestAssignExpr,
            consequent: new Shift.BlockStatement({
                block: new Shift.Block({
                    statements: ifBodyStatements
                })
            })
        })

        statementsArray = [];
        if (node.type == "ForStatement")
            statementsArray.push(new Shift.ExpressionStatement({
                expression: node.init
            }));

        statementsArray.push(new Shift.VariableDeclarationStatement({
            declaration: new Shift.VariableDeclaration({
                kind: "let",
                declarators: new Shift.VariableDeclarator({
                    binding: new Shift.BindingIdentifier({
                        name: resultName
                    })
                })
            })
        }));

        statementsArray.push(new Shift.DoWhileStatement({
            body: new Shift.BlockStatement({
                statements: [leftTestStatement, ifStatement]
            }),
            test: new Shift.IdentifierExpression({
                name: resultName
            })
        }));

        isTransformed = true;
        return new Shift.Block({
            statements: statementsArray
        });
    });

    $script("ForStatement[init.type = 'BinaryExpression'][init.operator = ',']").replace(node => {
        let parent = $script(node).parents().nodes[0];
        let initExpression = node.init;

        node.init = initExpression.right;

        let initObj = {
            statements: [
                new Shift.ExpressionStatement({
                    expression: initExpression.left
                }),
                node
            ]
        };

        let resultNode;

        if(statementsToExpandAsBlock.indexOf(parent.type) < 0)
            resultNode = new Shift.SimpleBlockStatement(initObj);
        else
            resultNode = new Shift.BlockStatement({
                block: new Shift.Block(initObj)
            });

        isTransformed = true;
        return resultNode;
    });

    $script("ForStatement[update.type = 'BinaryExpression'][update.operator = ',']").replace(node => {
        let updateExpression = node.update;

        node.update = null;
        node.body = new Shift.Block({
            statements: [
                node.body,
                new Shift.ExpressionStatement({
                    expression: updateExpression
                }),
            ]
        });

        isTransformed = true;
        return node;
    });

    
    // bounds transforms checking:
    // LTR - Left to right
    // from:
    //      if (255 > A)
    // to:
    //      if (A < 255)
    $script("BinaryExpression").filter(node=>{
        return (compOpsLtr.indexOf(node.operator) > -1) && (node.left.type.indexOf("Literal") == 0) && !((equalityOps.indexOf(node.operator) > -1) && (node.right.type.indexOf("Literal") == 0));
    }).replace(node => {
        let prevRight = node.right;
        node.right = node.left;
        node.left = prevRight;
        node.operator = compOpsLtrOpposite[compOpsLtr.indexOf(node.operator)];

        isTransformed = true;
        return node;
    });
    
    // bounds transforms checking:
    // RTL - Right to left
    // from:
    //      if (A > 255)
    // to:
    //      if (255 < A)
    $script("BinaryExpression").filter(node=>{
        return (compOpsRtl.indexOf(node.operator) > -1) && (node.right.type.indexOf("Literal") == 0);
    }).replace(node => {
        let prevRight = node.right;
        node.right = node.left;
        node.left = prevRight;
        node.operator = compOpsRtlOpposite[compOpsRtl.indexOf(node.operator)];

        isTransformed = true;
        return node;
    });


    /*$script("CallExpression").filter(node => {
        let result = false;
        node.arguments.forEach(argument => {
            if (argument.type == 'BinaryExpression' && argument.operator == ",") result = true;
        });

        return result;
    }).forEach(node => console.log(node));*/

    $script("ReturnStatement[expression.type = 'BinaryExpression'][expression.operator = ',']").replace(node => {
        isTransformed = true;
        return new Shift.SimpleBlockStatement({
            statements: [
                new Shift.ExpressionStatement({
                    expression: node.expression.left
                }),
                new Shift.ReturnStatement({
                    expression: node.expression.right
                })
            ]
        });
    });

    // fix var a = 2, b = (c =3, 2)
    $script("VariableDeclarationStatement").filter(node => {
        let result = false;
        node.declaration.declarators.forEach(declarator => {
            if (declarator.init && declarator.init.type == 'BinaryExpression' && declarator.init.operator == ",") result = true;
        });

        return result;
    }).replace(node => {
        let statementsArray = [];
        node.declaration.declarators.forEach(declarator => {
            if (declarator.init && declarator.init.type == 'BinaryExpression' && declarator.init.operator == ",") {
                statementsArray.push(declarator.init.left);
                declarator.init = declarator.init.right;
            }
        });
        statementsArray.push(node);

        isTransformed = true;
        return new Shift.SimpleBlockStatement({
            statements: statementsArray
        });
    })



    if (OUTPUT_STEPS) {
        let outputSt1 = beautify($script.codegen().toString());
        fs.writeFileSync('../deobfuscated/step1.i' + transformationCounter.toString() + '.deobf.js', outputSt1);
    }

    let types =[];

    let keepLooping = true;
    let i=0;
    //[left.type = 'AssignmentExpression'][right.type = 'AssignmentExpression']
    while (keepLooping) {
        let nonSkipped = false;

        keepLooping = $script("BinaryExpression[operator = ',']").replace(expression => {
            let parent = $script(expression).parents().nodes[0];
            
            switch(parent.type)
            {
                case 'ConditionalExpression':
                    return expression;
            }

            if(!types.some((v, ind, arr)=> v == parent.type))
            {
                console.log(parent.type);
                types.push(parent.type);
            }

            if((parent.type.indexOf("Statement") < 0) && (parent.type != "Block"))
                return expression;
            
            
            nonSkipped = true;
            isTransformed = true;

            return new Shift.SimpleBlockStatement({
                __cf_ID: i++,
                statements: [
                    new Shift.ExpressionStatement({
                        expression: expression.left
                    }),
                    new Shift.ExpressionStatement({
                        expression: expression.right
                    })
                ]
            });
        }).nodes.length > 0;

        keepLooping = keepLooping && nonSkipped;
    }


    // Replace dictionary proxy functions
    function isProxyFunc(node) {
        if (node.expression.type == "FunctionExpression" && node.expression.params.items.length === 2) return true;
        return false;
    }

    $script("AssignmentExpression[binding.expression.value.length = 5]")
        .filter(node => isProxyFunc(node))
        .forEach(node => {
            $script(`CallExpression[callee.expression.value = "${node.binding.expression.value}"]`)
                .replace(proxyCall => {
                    if (node.expression.body.statements[0].expression.operator === undefined) {
                        // Replace calls to CallExpression proxy function eg.
                        // v[c('0x191')] = function (x, y) {
                        //      return x(y)
                        // }
                        // v[c('0x191')](A,B) to:
                        // A(B)
                        
                        isTransformed = true;
                        return new Shift.CallExpression({
                            callee: proxyCall.arguments[0],
                            arguments: [
                                proxyCall.arguments[1]
                            ]
                        })
                    }

                    // Replace calls to BinaryExpression proxy function eg.
                    // v[c('0x90')] = function (z, A) {
                    //      return z < A
                    // }
                    isTransformed = true;
                    return new Shift.BinaryExpression({
                        operator: node.expression.body.statements[0].expression.operator,
                        left: proxyCall.arguments[0],
                        right: proxyCall.arguments[1]
                    });
                });
        });

    $script("ExpressionStatement[expression.type='BinaryExpression'][expression.operator='&&']").replace(node => {
        isTransformed = true;
        return new Shift.IfStatement({
            test: node.expression.left,
            consequent: new Shift.BlockStatement({
                block: new Shift.Block({
                    statements:[
                        new Shift.ExpressionStatement({
                                expression: node.expression.right
                            })
                        ]
                    })
                }),
            alternate: null
        });
    });

    $script("ExpressionStatement[expression.type='BinaryExpression'][expression.operator='||']").replace(node => {
        isTransformed = true;
        return new Shift.IfStatement({
            test: new Shift.UnaryExpression({
                operator: "!",
                operand: node.expression.left
            }),
            consequent: new Shift.BlockStatement({
                block: new Shift.Block({
                    statements:[
                        new Shift.ExpressionStatement({
                                expression: node.expression.right
                            })
                        ]
                    })
                }),
            alternate: null
        });
    });

    $script("ComputedMemberExpression[expression.type='LiteralStringExpression']").filter(node=>{
        return wellKnownLiterals.indexOf(node.expression.value) > -1;
    })
    .replace(node => {
        isTransformed = true;
        return new Shift.StaticMemberExpression({
            property: node.expression.value,
            object: node.object
        });
    })

    if (OUTPUT_STEPS) {
        let output = beautify($script.codegen().toString());
        fs.writeFileSync('../deobfuscated/deobJsch.i' + transformationCounter.toString() + '.js', output);
    }

    transformationCounter++;
} while (isTransformed);


let preFinishedOutput = beautify($script.codegen().toString());
fs.writeFileSync('../deobfuscated/deobJsch.preFinal.js', preFinishedOutput);
const $scriptPreFinal = refactor(preFinishedOutput);


$scriptPreFinal("Block > EmptyStatement").delete();

// Create output and write to file
let output = beautify($scriptPreFinal.codegen().toString());
fs.writeFileSync('../deobfuscated/deobJsch.js', output);
