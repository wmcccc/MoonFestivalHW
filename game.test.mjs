import assert from "node:assert/strict";
import test from "node:test";
import {
    canEnterRoom,
    createGameState,
    inspectObject,
    submitPuzzle,
} from "./game.mjs";

function inspect(state, roomId, objectId, selectedItem = null) {
    const result = inspectObject(state, roomId, objectId, selectedItem);
    assert.ok(["inspected", "item-found", "room-opened", "lock-revealed"].includes(result.status));
    return result.state;
}

function inspectMany(state, roomId, objectIds) {
    for (const objectId of objectIds) {
        state = inspect(state, roomId, objectId);
    }
    return state;
}

function openOffice(state = createGameState()) {
    state = inspectMany(state, "office", ["office-signin", "office-tickets", "office-scores", "office-rule"]);
    const result = submitPuzzle(state, "office-door", "628");
    assert.equal(result.status, "opened");
    return result.state;
}

function openPantryLock(state = openOffice()) {
    state = inspectMany(state, "pantry", ["pantry-receipt", "pantry-color-note"]);
    const result = submitPuzzle(state, "pantry-toolbox", ["blue", "red", "gold"]);
    assert.equal(result.status, "opened");
    return result.state;
}

function enterHiddenRoom(state = openPantryLock()) {
    state = inspect(state, "office", "office-fork");
    state = inspect(state, "office", "office-drawer", "cakeFork");
    state = inspect(state, "pantry", "pantry-flashlight");
    const result = inspectObject(state, "pantry", "pantry-vent", "screwdriver");
    assert.equal(result.status, "room-opened");
    return result.state;
}

function openHiddenArchive(state = enterHiddenRoom()) {
    state = inspect(state, "hidden", "hidden-calendar", "flashlight");
    state = inspectMany(state, "hidden", ["hidden-mine-note", "hidden-phase-chart", "hidden-calendar-note"]);
    const result = submitPuzzle(state, "hidden-archive", ["r0c3", "r2c0", "r2c3", "r3c2"]);
    assert.equal(result.status, "opened");
    return result.state;
}

function enterHallway(state = openHiddenArchive()) {
    state = inspect(state, "hidden", "hidden-grate", "magnet");
    const result = inspectObject(state, "hidden", "hidden-door", "brassKey");
    assert.equal(result.status, "room-opened");
    return result.state;
}

test("a new game starts in the office and blocks later rooms", () => {
    const state = createGameState();
    assert.equal(canEnterRoom(state, "office"), true);
    assert.equal(canEnterRoom(state, "pantry"), false);
    assert.equal(canEnterRoom(state, "hidden"), false);
});

test("the numeric lock requires all evidence and rejects an incorrect order", () => {
    let state = createGameState();
    assert.equal(submitPuzzle(state, "office-door", "628").status, "need-clues");
    state = inspectMany(state, "office", ["office-signin", "office-tickets", "office-scores", "office-rule"]);
    assert.equal(submitPuzzle(state, "office-door", "268").status, "wrong");
    const opened = submitPuzzle(state, "office-door", "628");
    assert.equal(opened.status, "opened");
    assert.equal(canEnterRoom(opened.state, "pantry"), true);
});

test("the keypad rejects malformed input and unknown locks never open", () => {
    const state = inspectMany(createGameState(), "office", ["office-signin", "office-tickets", "office-scores", "office-rule"]);
    assert.equal(submitPuzzle(state, "office-door", "62x").status, "invalid");
    assert.equal(submitPuzzle(state, "not-a-lock", "628").status, "unknown-lock");
});

test("the cake fork is required to get the screwdriver from the drawer", () => {
    let state = openOffice(createGameState());
    assert.equal(inspectObject(state, "office", "office-drawer").status, "need-item");
    state = inspect(state, "office", "office-fork");
    assert.equal(inspectObject(state, "office", "office-drawer").status, "select-item");
    const result = inspectObject(state, "office", "office-drawer", "cakeFork");
    assert.equal(result.status, "item-found");
    assert.ok(result.state.items.includes("screwdriver"));
});

test("the color-order lock rejects the wrong sequence and rewards the magnet", () => {
    let state = openOffice(createGameState());
    state = inspectMany(state, "pantry", ["pantry-receipt", "pantry-color-note"]);
    assert.equal(submitPuzzle(state, "pantry-toolbox", ["red", "blue", "gold"]).status, "wrong");
    const result = submitPuzzle(state, "pantry-toolbox", ["blue", "red", "gold"]);
    assert.equal(result.status, "opened");
    assert.ok(result.state.items.includes("magnet"));
});

test("the screwdriver opens the hidden room and the flashlight reveals its calendar", () => {
    let state = openPantryLock(openOffice(createGameState()));
    state = inspect(state, "office", "office-fork");
    state = inspect(state, "office", "office-drawer", "cakeFork");
    state = inspect(state, "pantry", "pantry-flashlight");
    assert.equal(canEnterRoom(state, "hidden"), false);
    state = inspect(state, "pantry", "pantry-vent", "screwdriver");
    assert.equal(canEnterRoom(state, "hidden"), true);
    assert.equal(inspectObject(state, "hidden", "hidden-calendar").status, "select-item");
    assert.equal(inspectObject(state, "hidden", "hidden-calendar", "flashlight").status, "inspected");
});

test("the minesweeper lock requires safe moon tiles in reading order", () => {
    let state = enterHiddenRoom();
    state = inspect(state, "hidden", "hidden-calendar", "flashlight");
    state = inspectMany(state, "hidden", ["hidden-mine-note", "hidden-phase-chart", "hidden-calendar-note"]);
    assert.equal(submitPuzzle(state, "hidden-archive", ["r2c0", "r0c3", "r2c3", "r3c2"]).status, "wrong");
    const result = submitPuzzle(state, "hidden-archive", ["r0c3", "r2c0", "r2c3", "r3c2"]);
    assert.equal(result.status, "opened");
    assert.ok(result.state.items.includes("keycard"));
});

test("the magnet retrieves a brass key that opens the hallway", () => {
    let state = enterHiddenRoom();
    const result = inspectObject(state, "hidden", "hidden-grate", "magnet");
    assert.equal(result.status, "item-found");
    assert.ok(result.state.items.includes("brassKey"));
    const opened = inspectObject(result.state, "hidden", "hidden-door", "brassKey");
    assert.equal(opened.status, "room-opened");
    assert.equal(canEnterRoom(opened.state, "hallway"), true);
});

test("the bomb puzzle requires all clues, the keycard, and the correct wire order", () => {
    let state = enterHallway();
    state = inspectMany(state, "hallway", ["hall-phase-chart", "hall-wire-chart", "hall-bomb-log"]);
    state = inspect(state, "hallway", "hall-keypad-cover", "keycard");
    assert.equal(submitPuzzle(state, "hall-bomb", ["red", "blue", "gold"]).status, "wrong");
    const result = submitPuzzle(state, "hall-bomb", ["red", "gold", "blue"]);
    assert.equal(result.status, "escaped");
    assert.equal(result.state.escaped, true);
});