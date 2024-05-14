import { parseRegExpLiteral } from "@eslint-community/regexpp"
import { RegExpMapper } from "./build/index.js"
import test from "node:test"
import { strict as assert } from "node:assert"

function sum_plus_length_min_one(a) { return a.reduce((acc, v) => acc + v) + a.length - 1; }
const regex_size_mapper = new RegExpMapper({
    onRegExpLiteral: (_, pattern) => pattern,
    onPattern: (_, alternatives) => sum_plus_length_min_one(alternatives),
    onAlternative: (_, elements) => sum_plus_length_min_one(elements),
    onCharacter: (_) => 1,
});
function regex_size (r) { return regex_size_mapper.visit(r); }


test('Char literal size visitor', (t) => {
    const r = parseRegExpLiteral("/a/");
    assert.strictEqual(regex_size(r), 1);
})

test('Char literal size map', (t) => {
    const r = parseRegExpLiteral("/a/");
    const result = RegExpMapper.map(
        r,
        (_, elements) => sum_plus_length_min_one(elements), // onAlternative
        undefined, // onBoundaryAssertion
        undefined, // onLookaroundAssertion
        undefined, // onBackreference
        undefined, // onCapturingGroup
        (_) => 1, // onCharacter
        undefined, // onCharacterClass
        undefined, // onCharacterClassRange
        undefined, // onCharacterSet
        undefined, // onClassIntersection
        undefined, // onClassStringDisjunction
        undefined, // onClassSubtraction
        undefined, // onExpressionCharacterClass
        undefined, // onFlags
        undefined, // onGroup
        (_, alternatives) => sum_plus_length_min_one(alternatives), // onPattern
        undefined, // onQuantifier
        (_, pattern) => pattern, // onRegExpLiteral
        undefined, // onStringAlternative
    );
    assert.strictEqual(result, 1);
})
