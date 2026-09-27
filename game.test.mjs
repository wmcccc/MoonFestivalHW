import assert from "node:assert/strict";
import test from "node:test";
import { checkEscapeCode, CLUE_IDS } from "./game.mjs";

test("the exit stays locked until every clue has been inspected", () => {
    assert.deepEqual(checkEscapeCode("628", CLUE_IDS.slice(0, -1)), {
        status: "need-clues",
    });
});

test("the keypad accepts only a three-digit code", () => {
    assert.deepEqual(checkEscapeCode("62x", CLUE_IDS), {
        status: "invalid",
    });
});

test("the correct evidence-derived code opens the exit", () => {
    assert.deepEqual(checkEscapeCode(" 628 ", CLUE_IDS), {
        status: "escaped",
    });
});

test("a valid but incorrect code does not open the exit", () => {
    assert.deepEqual(checkEscapeCode("111", CLUE_IDS), {
        status: "wrong",
    });
});