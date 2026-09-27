import assert from "node:assert/strict";
import test from "node:test";
import {
    canEnterRoom,
    createGameState,
    inspectObject,
    submitDoorCode,
} from "./game.mjs";

function inspect(state, roomId, objectId, selectedItem = null) {
    const result = inspectObject(state, roomId, objectId, selectedItem);
    assert.ok(["inspected", "item-found", "room-opened"].includes(result.status));
    return result.state;
}

function unlockOffice(state = createGameState()) {
    state = inspect(state, "office", "office-signin");
    state = inspect(state, "office", "office-tickets");
    state = inspect(state, "office", "office-rule");
    return submitDoorCode(state, "office-door", "628").state;
}

function unlockPantryTools(state = unlockOffice()) {
    state = inspect(state, "pantry", "pantry-receipt");
    state = inspect(state, "pantry", "pantry-note");
    return submitDoorCode(state, "pantry-toolbox", "427").state;
}

function unlockHiddenRoom(state = unlockPantryTools()) {
    state = inspect(state, "office", "office-fork");
    state = inspect(state, "office", "office-drawer", "cakeFork");
    state = inspect(state, "pantry", "pantry-flashlight");
    return inspect(state, "pantry", "pantry-vent", "screwdriver").state;
}

test("a new game starts in the office and blocks later rooms", () => {
    const state = createGameState();
    assert.equal(canEnterRoom(state, "office"), true);
    assert.equal(canEnterRoom(state, "pantry"), false);
    assert.equal(canEnterRoom(state, "hidden"), false);
});

test("the office door needs all three cross-referenced clues", () => {
    let state = createGameState();
    assert.equal(submitDoorCode(state, "office-door", "628").status, "need-clues");
    state = inspect(state, "office", "office-signin");
    state = inspect(state, "office", "office-tickets");
    state = inspect(state, "office", "office-rule");
    assert.ok(state.discoveredObjects.includes("office-tickets"));
    const result = submitDoorCode(state, "office-door", "628");
    assert.equal(result.status, "opened");
    assert.equal(canEnterRoom(result.state, "pantry"), true);
});

test("the keypad rejects malformed and incorrect codes", () => {
    let state = unlockOffice(createGameState());
    state = inspect(state, "pantry", "pantry-receipt");
    state = inspect(state, "pantry", "pantry-note");
    assert.equal(submitDoorCode(state, "pantry-toolbox", "42x").status, "invalid");
    assert.equal(submitDoorCode(state, "pantry-toolbox", "111").status, "wrong");
});

test("the cake fork is required to get the screwdriver from the drawer", () => {
    let state = unlockOffice(createGameState());
    assert.equal(inspectObject(state, "office", "office-drawer").status, "need-item");
    state = inspect(state, "office", "office-fork");
    assert.equal(inspectObject(state, "office", "office-drawer").status, "select-item");
    const result = inspectObject(state, "office", "office-drawer", "cakeFork");
    assert.equal(result.status, "item-found");
    assert.ok(result.state.items.includes("screwdriver"));
});

test("the pantry code requires both the receipt and its instruction note", () => {
    let state = unlockOffice(createGameState());
    state = inspect(state, "pantry", "pantry-receipt");
    assert.equal(submitDoorCode(state, "pantry-toolbox", "427").status, "need-clues");
    state = inspect(state, "pantry", "pantry-note");
    const result = submitDoorCode(state, "pantry-toolbox", "427");
    assert.equal(result.status, "opened");
    assert.ok(result.state.items.includes("magnet"));
});

test("the screwdriver opens the hidden room, while the flashlight is picked up", () => {
    let state = unlockPantryTools(unlockOffice(createGameState()));
    state = inspect(state, "office", "office-fork");
    state = inspect(state, "office", "office-drawer", "cakeFork");
    state = inspect(state, "pantry", "pantry-flashlight");
    assert.ok(state.items.includes("flashlight"));
    assert.equal(canEnterRoom(state, "hidden"), false);
    const result = inspectObject(state, "pantry", "pantry-vent", "screwdriver");
    assert.equal(result.status, "room-opened");
    assert.equal(canEnterRoom(result.state, "hidden"), true);
});

test("the hidden calendar can only be read with the selected flashlight", () => {
    let state = unlockPantryTools(unlockOffice(createGameState()));
    state = inspect(state, "office", "office-fork");
    state = inspect(state, "office", "office-drawer", "cakeFork");
    state = inspect(state, "pantry", "pantry-vent", "screwdriver");
    assert.equal(inspectObject(state, "hidden", "hidden-calendar").status, "need-item");
    const withLight = inspect(state, "pantry", "pantry-flashlight");
    assert.equal(inspectObject(withLight, "hidden", "hidden-calendar").status, "select-item");
    assert.equal(inspectObject(withLight, "hidden", "hidden-calendar", "flashlight").status, "inspected");
});

test("the archive lock requires month, moon-phase, and format clues", () => {
    let state = unlockHiddenRoom();
    state = inspect(state, "hidden", "hidden-calendar", "flashlight");
    state = inspect(state, "hidden", "hidden-phase-chart");
    assert.equal(submitDoorCode(state, "hidden-archive", "0815").status, "need-clues");
    state = inspect(state, "hidden", "hidden-calendar-note");
    const result = submitDoorCode(state, "hidden-archive", "0815");
    assert.equal(result.status, "opened");
    assert.ok(result.state.items.includes("keycard"));
});

test("the magnet retrieves a brass key that opens the hallway", () => {
    let state = unlockHiddenRoom();
    const result = inspectObject(state, "hidden", "hidden-grate", "magnet");
    assert.equal(result.status, "item-found");
    assert.ok(result.state.items.includes("brassKey"));
    const opened = inspectObject(result.state, "hidden", "hidden-door", "brassKey");
    assert.equal(opened.status, "room-opened");
    assert.equal(canEnterRoom(opened.state, "hallway"), true);
});

test("the exit needs the moonrise clues and a keycard before the final code", () => {
    let state = unlockHiddenRoom();
    state = inspect(state, "hidden", "hidden-calendar", "flashlight");
    state = inspect(state, "hidden", "hidden-phase-chart");
    state = inspect(state, "hidden", "hidden-calendar-note");
    state = submitDoorCode(state, "hidden-archive", "0815").state;
    state = inspect(state, "hidden", "hidden-grate", "magnet");
    state = inspect(state, "hidden", "hidden-door", "brassKey");
    state = inspect(state, "hallway", "hall-moonrise");
    assert.equal(submitDoorCode(state, "hall-exit", "2010").status, "need-clues");
    state = inspect(state, "hallway", "hall-exit-note");
    state = inspect(state, "hallway", "hall-keypad-cover", "keycard");
    const exit = submitDoorCode(state, "hall-exit", "2010");
    assert.equal(exit.status, "escaped");
    assert.equal(exit.state.escaped, true);
});