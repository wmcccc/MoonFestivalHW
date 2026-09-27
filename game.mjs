export const ROOM_IDS = Object.freeze(["office", "pantry", "hallway"]);

export const ROOMS = Object.freeze({
    office: Object.freeze({ path: "index.html", code: "628", next: "pantry" }),
    pantry: Object.freeze({ path: "pantry.html", code: "427", next: "hallway" }),
    hallway: Object.freeze({ path: "hallway.html", code: "2010", next: null }),
});

export const PROGRESS_KEY = "moonFestivalEscapeProgress";

export function createGameState() {
    return {
        unlockedRooms: ["office"],
        completedRooms: [],
        escaped: false,
    };
}

export function canEnterRoom(state, roomId) {
    return Boolean(ROOMS[roomId]) && state.unlockedRooms.includes(roomId);
}

export function submitDoorCode(state, roomId, value) {
    const room = ROOMS[roomId];
    if (!room) {
        return { status: "unknown-room", state };
    }
    if (!canEnterRoom(state, roomId)) {
        return { status: "locked", state };
    }

    const code = String(value).trim();
    if (!new RegExp(`^\\d{${room.code.length}}$`).test(code)) {
        return { status: "invalid", state };
    }
    if (code !== room.code) {
        return { status: "wrong", state };
    }

    const completedRooms = [...new Set([...state.completedRooms, roomId])];
    const unlockedRooms = room.next
        ? [...new Set([...state.unlockedRooms, room.next])]
        : state.unlockedRooms;
    const nextState = {
        unlockedRooms,
        completedRooms,
        escaped: room.next === null,
    };

    return {
        status: room.next ? "opened" : "escaped",
        nextRoom: room.next,
        state: nextState,
    };
}