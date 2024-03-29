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

// Read file and create refactor
let challengeSrc = fs.readFileSync('../obfuscated/' + FILE_NAME, 'utf-8');
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

$script('IdentifierExpression[name="Error"]').replace(node => {
    return new Shift.IdentifierExpression({
        name: 'Err0r'
    });
});

// Create output and write to file
let output = beautify($script.codegen().toString());
fs.writeFileSync('../deobfuscated/' + FILE_NAME + '.js', output);