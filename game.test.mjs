import assert from "node:assert/strict";
import test from "node:test";
import {
    canEnterRoom,
    createGameState,
    submitDoorCode,
} from "./game.mjs";

test("only the office is accessible at the start", () => {
    const state = createGameState();
    assert.equal(canEnterRoom(state, "office"), true);
    assert.equal(canEnterRoom(state, "pantry"), false);
});

test("a room requires a correctly sized numeric code", () => {
    const state = createGameState();
    assert.equal(submitDoorCode(state, "office", "62x").status, "invalid");
    assert.equal(submitDoorCode(state, "office", "111").status, "wrong");
});

test("opening the office unlocks the pantry, but not the hallway", () => {
    const result = submitDoorCode(createGameState(), "office", "628");
    assert.equal(result.status, "opened");
    assert.equal(result.nextRoom, "pantry");
    assert.equal(canEnterRoom(result.state, "pantry"), true);
    assert.equal(canEnterRoom(result.state, "hallway"), false);
});

test("each later lock reveals access to exactly the next room", () => {
    const pantry = submitDoorCode(createGameState(), "office", "628");
    const hallway = submitDoorCode(pantry.state, "pantry", "427");
    assert.equal(hallway.status, "opened");
    assert.equal(hallway.nextRoom, "hallway");
    assert.equal(canEnterRoom(hallway.state, "hallway"), true);
});

test("the final code completes the escape", () => {
    const office = submitDoorCode(createGameState(), "office", "628");
    const pantry = submitDoorCode(office.state, "pantry", "427");
    const escape = submitDoorCode(pantry.state, "hallway", "2010");
    assert.equal(escape.status, "escaped");
    assert.equal(escape.state.escaped, true);
});
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