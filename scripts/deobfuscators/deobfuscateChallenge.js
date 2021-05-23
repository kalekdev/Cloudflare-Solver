const {
    refactor
} = require('shift-refactor');
const {
    default: codegen
} = require('shift-codegen');
const Shift = require('shift-ast');
const beautify = require('js-beautify');
const fs = require('fs');

const CRAY = process.argv.slice(2)[0] || '63d343898f11bbb2';
const FILE_NAME = 'finalChallengeEx';

// Read file and create refactor session
let source = fs.readFileSync('../obfuscated/' + FILE_NAME, 'utf-8');
function decodeChallenge(data, cRay) {
    var v, w, x, y, y, u, z, A;
    v = {};
    v["dLYaj"] = function(B, C) {
        return B % C;
    };
    v["utvqb"] = function(B, C) {
        return B - C;
    };
    w = v;
    x = 32;
    y = cRay + "_" + 0;
    y = y["replace"](/./g, function(B, C) {
        x ^= y["charCodeAt"](C);
    });
    u = Buffer.from(data, 'base64').toString('binary');
    z = [];
    for (A = v = -1; !isNaN(v = u["charCodeAt"](++A)); z["push"](String["fromCharCode"](w["dLYaj"](w["utvqb"](v & 255, x) - A + 65535, 255))));
    return z["join"]("");
}
let challengeSrc = decodeChallenge(source, CRAY);
const $script = refactor(challengeSrc);

let literalArray = eval(codegen($script('ComputedMemberExpression[expression.operator="++"]').nodes[0].object));
let functionString = codegen($script('FunctionExpression').nodes[0])
    .replace('window._cf_atob(a)', 'Buffer.from(a, \'base64\').toString(\'binary\')')
    .replace('window._cf_chl_opt.cRay', `'${CRAY}'`);
let decodeFunction = eval('(' + functionString + ')');

for (let i = 0; i < literalArray.length; i++) {
    literalArray[i] = decodeFunction(literalArray[i]);
}

$script('BinaryExpression[left.type="LiteralNumericExpression"][right.type="LiteralNumericExpression"]')
    .replace(node => {
        let value = eval(`${node.left.value} ${node.operator} ${node.right.value}`);

        return new Shift.LiteralNumericExpression({
            value: value
        });
    });

let isTransformed = false;

do {
    isTransformed = false;
    $script('ComputedMemberExpression[object.name="_"]')
        .filter(node => {
            return node.expression.type == 'LiteralNumericExpression' || node.expression.type == 'LiteralStringExpression'
        }).replace(node => {
        let value = literalArray[parseInt(node.expression.value)];
        if (value === undefined) return node;

        isTransformed = true;

        return new Shift.LiteralStringExpression({
            value: value
        })
    });
} while (isTransformed)

// Create output and write to file
let output = beautify($script.codegen().toString());
fs.writeFileSync('../deobfuscated/' + FILE_NAME + '.js', output);