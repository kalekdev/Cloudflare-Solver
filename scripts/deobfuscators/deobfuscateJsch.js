const {
    refactor
} = require('shift-refactor');
const {
    default: codegen
} = require('shift-codegen');
const Shift = require('shift-ast');
const beautify = require('js-beautify');
const fs = require('fs');

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
                    return new Shift.CallExpression({
                        callee: node.expression.body.statements[0].expression.callee,
                        arguments: proxyCall.arguments
                    })
                }

                // Replace calls to BinaryExpression proxy function eg.
                // v[c('0x90')] = function (z, A) {
                //      return z < A
                // }
                return new Shift.BinaryExpression({
                    operator: node.expression.body.statements[0].expression.operator,
                    left: proxyCall.arguments[0],
                    right: proxyCall.arguments[1]
                });
            });
    });

// Create output and write to file
let output = beautify($script.codegen().toString());
fs.writeFileSync('../deobfuscated/deobJsch.js', output);