import { parseRegExpLiteral } from "@eslint-community/regexpp"
import { RegExpMapper } from "./build/index.js"
import test from "node:test"
import { strict as assert } from "node:assert"

const regex_size_mapper = new RegExpMapper({
    onRegExpLiteral(_, pattern) {
        return pattern;
    },

    onPattern(_, alternatives) {
        let branching = alternatives.length - 1;
        return alternatives.reduce((acc, v) => acc + v) + branching;
    },

    onAlternative(_, elements) {
        let branching = elements.length - 1;
        return elements.reduce((acc, v) => acc + v) + branching;
    },

    onCharacter(_) {
        return 1;
    }
});
function regex_size (r) { return regex_size_mapper.visit(r); }


test('Char literal size', (t) => {
    const r = parseRegExpLiteral("/a/");
    assert.strictEqual(regex_size(r), 1);
})
