export const ROOM_IDS = Object.freeze(["office", "pantry", "hidden", "hallway"]);

export const ROOMS = Object.freeze({
    office: Object.freeze({ path: "index.html", next: "pantry", lockId: "office-door" }),
    pantry: Object.freeze({ path: "pantry.html", next: "hidden", lockId: "pantry-toolbox" }),
    hidden: Object.freeze({ path: "hidden.html", next: "hallway", lockId: "hidden-archive" }),
    hallway: Object.freeze({ path: "hallway.html", next: null, lockId: "hall-bomb" }),
});

export const ITEMS = Object.freeze({
    cakeFork: Object.freeze({ name: "月餅叉", icon: "🍴" }),
    screwdriver: Object.freeze({ name: "小螺絲起子", icon: "🪛" }),
    flashlight: Object.freeze({ name: "兔子鑰匙圈手電筒", icon: "🔦" }),
    magnet: Object.freeze({ name: "伸縮磁鐵棒", icon: "🧲" }),
    brassKey: Object.freeze({ name: "黃銅小鑰匙", icon: "🗝️" }),
    keycard: Object.freeze({ name: "月宮門卡", icon: "💳" }),
});

export const COLORS = Object.freeze([
    Object.freeze({ id: "blue", name: "月光藍", hex: "#4c86c6" }),
    Object.freeze({ id: "red", name: "兔耳紅", hex: "#c84f52" }),
    Object.freeze({ id: "gold", name: "月餅金", hex: "#d1a33d" }),
]);

export const MINEFIELD = Object.freeze([
    Object.freeze([
        Object.freeze({ id: "r0c0", mine: true, count: null }),
        Object.freeze({ id: "r0c1", mine: false, count: 1 }),
        Object.freeze({ id: "r0c2", mine: false, count: 0 }),
        Object.freeze({ id: "r0c3", mine: false, count: 0, moon: true, digit: "2" }),
    ]),
    Object.freeze([
        Object.freeze({ id: "r1c0", mine: false, count: 1 }),
        Object.freeze({ id: "r1c1", mine: false, count: 1 }),
        Object.freeze({ id: "r1c2", mine: false, count: 0 }),
        Object.freeze({ id: "r1c3", mine: false, count: 0 }),
    ]),
    Object.freeze([
        Object.freeze({ id: "r2c0", mine: false, count: 0, moon: true, digit: "7" }),
        Object.freeze({ id: "r2c1", mine: false, count: 0 }),
        Object.freeze({ id: "r2c2", mine: false, count: 0 }),
        Object.freeze({ id: "r2c3", mine: false, count: 0, moon: true, digit: "1" }),
    ]),
    Object.freeze([
        Object.freeze({ id: "r3c0", mine: false, count: 0 }),
        Object.freeze({ id: "r3c1", mine: false, count: 0 }),
        Object.freeze({ id: "r3c2", mine: false, count: 0, moon: true, digit: "5" }),
        Object.freeze({ id: "r3c3", mine: false, count: 0 }),
    ]),
]);

export const ROOM_OBJECTS = Object.freeze({
    office: Object.freeze([
        Object.freeze({ id: "office-signin", name: "打卡簿", icon: "🕒", detail: "嫦娥 20:08 到，玉兔 20:14 到，吳剛 20:21 到。今天沒有人代打卡，連保全都準時。" }),
        Object.freeze({ id: "office-tickets", name: "月餅券存根", icon: "🎟️", detail: "嫦娥拿 A06，玉兔拿 B02，吳剛拿 C08。票根背面有珍奶漬，胡仁大概又把飲料放到文件上。" }),
        Object.freeze({ id: "office-scores", name: "月餅評分表", icon: "📋", detail: "蓮蓉：嫦娥 14 分；玉兔 14 分；吳剛 9 分。胡仁在旁邊寫：「同分時看誰先打卡。」" }),
        Object.freeze({ id: "office-rule", name: "被撕一半的便條", icon: "📝", detail: "「分數高的排前面；同分照打卡時間早到晚。只記月餅券最後一位。」最後還畫了一個生氣的兔子。" }),
        Object.freeze({ id: "office-fork", name: "地上的月餅叉", icon: "🍴", detail: "金色小叉子插在「五仁月餅零分」的打分表上。握柄尖尖的，邊角也有點彎。", givesItem: "cakeFork" }),
        Object.freeze({ id: "office-drawer", name: "卡住的辦公桌抽屜", icon: "🗄️", detail: "抽屜拉把卡住，左下角倒是留了一道剛好能塞進薄片的縫。裡頭露出一截螺絲起子握把。", requiresItem: "cakeFork", givesItem: "screwdriver" }),
    ]),
    pantry: Object.freeze([
        Object.freeze({ id: "pantry-receipt", name: "超商收據", icon: "🧾", detail: "收據沒照時間排：20:18 五仁月餅、20:10 無糖奶茶、20:14 胡蘿蔔三明治。收據總額 $73，旁邊寫著「不要拿總額當密碼」。" }),
        Object.freeze({ id: "pantry-color-note", name: "冰箱磁鐵背面的色票", icon: "🎨", detail: "「奶茶貼藍標、胡蘿蔔貼紅標、月餅貼金標。」底下還註明：磁鐵不要貼在珍奶吸管上。" }),
        Object.freeze({ id: "pantry-flashlight", name: "兔子造型小手電筒", icon: "🔦", detail: "鑰匙圈手電筒按一下會亮，按兩下會閃，按三下還是會閃。拿走。", givesItem: "flashlight" }),
        Object.freeze({ id: "pantry-vent", name: "冰箱後面的通風板", icon: "🪛", detail: "通風板晃了一下，四顆螺絲上都有新刮痕。板子後面傳來一聲很小的兔子呼嚕聲。", requiresItem: "screwdriver", unlockRoom: "hidden" }),
    ]),
    hidden: Object.freeze([
        Object.freeze({ id: "hidden-calendar", name: "會發光的月曆", icon: "🌙", detail: "手電筒照過去，螢光字浮出來：「月牙標記的格子裡，有四個安全格藏著數字。從上到下、每列由左到右讀。」", requiresItem: "flashlight" }),
        Object.freeze({ id: "hidden-mine-note", name: "掃雷規則小抄", icon: "💣", detail: "「格子裡的數字，是周圍八格的地雷數。月牙不是地雷。踩到地雷會重來，這次不會扣薪水。」" }),
        Object.freeze({ id: "hidden-phase-chart", name: "月相值班表", icon: "🌗", detail: "新月值班：初一；半月值班：初八；滿月值班：十五；月亮請假：二十二。旁邊寫著：「月圓時倉庫才開。」" }),
        Object.freeze({ id: "hidden-calendar-note", name: "月相庫存記錄", icon: "📅", detail: "「滿月夜才會送出門卡。想知道哪幾格安全，先看格子周圍的數字，不要只看月亮畫得可不可愛。」" }),
        Object.freeze({ id: "hidden-keybox", name: "月曆旁的工具箱", icon: "🔢", detail: "工具箱上沒有數字鎖，只有一排被月亮圖案蓋住的小格子。" }),
        Object.freeze({ id: "hidden-grate", name: "地板縫裡的金屬鑰匙", icon: "🧲", detail: "一把小鑰匙掉進窄縫，手指伸不到，鑰匙上吸著幾片鐵屑。", requiresItem: "magnet", givesItem: "brassKey" }),
        Object.freeze({ id: "hidden-door", name: "掛著奇怪門牌的門", icon: "🚪", detail: "門牌寫著「不是衣櫃」。門把下面有個小鎖孔，裡面還塞了一小團棉絮。", requiresItem: "brassKey", unlockRoom: "hallway" }),
    ]),
    hallway: Object.freeze([
        Object.freeze({ id: "hall-phase-chart", name: "保全室的月相表", icon: "🌗", detail: "月相順序：新月、上弦、滿月。下方手寫：「警報演習也照這個順序，不要臨場自由發揮。」" }),
        Object.freeze({ id: "hall-wire-chart", name: "拆彈盒內側的色票", icon: "🎨", detail: "色票對照：新月是藍線，上弦是紅線，滿月是黃線。貼紙角落還畫著一杯珍奶。" }),
        Object.freeze({ id: "hall-keypad-cover", name: "警報盒的卡片蓋", icon: "💳", detail: "透明蓋板卡得很牢，側邊有一條窄槽，尺寸剛好能插入門卡。", requiresItem: "keycard", unlockLock: "hall-bomb" }),
        Object.freeze({ id: "hall-bomb-log", name: "保全巡檢紀錄", icon: "📒", detail: "演習紀錄：「先從上弦開始，再走到滿月，最後回新月。」保全在下面抱怨：每次都要重排電線很麻煩。" }),
        Object.freeze({ id: "hall-rabbit-chat", name: "兔子群組最後一則訊息", icon: "📱", detail: "玉兔：「胡仁再說五仁月餅不算月餅，我就把那個冷笑話講到底。」胡仁回了一個倒讚。這個案子的動機，比冷笑話還短。" }),
    ]),
});

export const LOCKS = Object.freeze({
    "office-door": Object.freeze({ roomId: "office", type: "keypad", answer: "628", requiredObjects: ["office-signin", "office-tickets", "office-scores", "office-rule"], unlockRoom: "pantry" }),
    "pantry-toolbox": Object.freeze({ roomId: "pantry", type: "colors", answer: ["blue", "red", "gold"], requiredObjects: ["pantry-receipt", "pantry-color-note"], rewardItem: "magnet" }),
    "hidden-archive": Object.freeze({ roomId: "hidden", type: "minefield", answer: ["r0c3", "r2c0", "r2c3", "r3c2"], requiredObjects: ["hidden-calendar", "hidden-mine-note", "hidden-phase-chart", "hidden-calendar-note"], rewardItem: "keycard" }),
    "hall-bomb": Object.freeze({ roomId: "hallway", type: "bomb", answer: ["red", "gold", "blue"], requiredObjects: ["hall-phase-chart", "hall-wire-chart", "hall-bomb-log"], requiredItems: ["keycard"], escaped: true }),
});

export const PROGRESS_KEY = "moonFestivalEscapeProgressV4";

export function createGameState() {
    return {
        unlockedRooms: ["office"],
        items: [],
        discoveredObjects: [],
        usedObjects: [],
        availableLocks: ["office-door"],
        openedLocks: [],
        escaped: false,
    };
}

export function canEnterRoom(state, roomId) {
    return Boolean(ROOMS[roomId]) && state.unlockedRooms.includes(roomId);
}

export function inspectObject(state, roomId, objectId, selectedItem = null) {
    if (!canEnterRoom(state, roomId)) {
        return { status: "room-locked", state };
    }

    const object = ROOM_OBJECTS[roomId].find((entry) => entry.id === objectId);
    if (!object) {
        return { status: "unknown-object", state };
    }
    if (object.requiresItem && !state.items.includes(object.requiresItem)) {
        return { status: "need-item", itemId: object.requiresItem, state };
    }
    if (object.requiresItem && selectedItem !== object.requiresItem) {
        return { status: "select-item", itemId: object.requiresItem, state };
    }
    if (object.givesItem && state.items.includes(object.givesItem)) {
        return { status: "already-have", itemId: object.givesItem, message: object.detail, state };
    }

    const unlockedRooms = object.unlockRoom
        ? [...new Set([...state.unlockedRooms, object.unlockRoom])]
        : state.unlockedRooms;
    const unlockRoomLock = object.unlockRoom ? ROOMS[object.unlockRoom].lockId : null;
    const availableLocks = object.unlockLock
        ? [...new Set([...state.availableLocks, object.unlockLock])]
        : unlockRoomLock
            ? [...new Set([...state.availableLocks, unlockRoomLock])]
            : state.availableLocks;
    const nextState = {
        ...state,
        items: object.givesItem ? [...new Set([...state.items, object.givesItem])] : state.items,
        discoveredObjects: [...new Set([...state.discoveredObjects, objectId])],
        usedObjects: object.requiresItem ? [...new Set([...state.usedObjects, objectId])] : state.usedObjects,
        unlockedRooms,
        availableLocks,
    };

    return {
        status: object.givesItem ? "item-found" : object.unlockRoom ? "room-opened" : object.unlockLock ? "lock-revealed" : "inspected",
        object,
        state: nextState,
    };
}

export function submitPuzzle(state, lockId, answer) {
    const lock = LOCKS[lockId];
    if (!lock) {
        return { status: "unknown-lock", state };
    }
    if (!canEnterRoom(state, lock.roomId) || !state.availableLocks.includes(lockId)) {
        return { status: "locked", state };
    }
    if (state.openedLocks.includes(lockId)) {
        return { status: "already-open", state };
    }
    if (!lock.requiredObjects.every((objectId) => state.discoveredObjects.includes(objectId))) {
        return { status: "need-clues", state };
    }
    if (lock.requiredItems && !lock.requiredItems.every((itemId) => state.items.includes(itemId))) {
        return { status: "need-item", state };
    }

    const validShape = lock.type === "keypad"
        ? typeof answer === "string" && new RegExp(`^\\d{${lock.answer.length}}$`).test(answer)
        : Array.isArray(answer) && answer.length === lock.answer.length && answer.every((part) => typeof part === "string");
    if (!validShape) {
        return { status: "invalid", state };
    }

    const matches = lock.type === "keypad"
        ? answer === lock.answer
        : answer.every((part, index) => part === lock.answer[index]);
    if (!matches) {
        return { status: "wrong", state };
    }

    const openedLocks = [...new Set([...state.openedLocks, lockId])];
    const unlockedRooms = lock.unlockRoom
        ? [...new Set([...state.unlockedRooms, lock.unlockRoom])]
        : state.unlockedRooms;
    const nextLock = lock.unlockRoom ? ROOMS[lock.unlockRoom].lockId : null;
    const nextState = {
        ...state,
        openedLocks,
        items: lock.rewardItem ? [...new Set([...state.items, lock.rewardItem])] : state.items,
        unlockedRooms,
        availableLocks: nextLock ? [...new Set([...state.availableLocks, nextLock])] : state.availableLocks,
        escaped: Boolean(lock.escaped),
    };

    return {
        status: lock.escaped ? "escaped" : "opened",
        nextRoom: lock.unlockRoom ?? null,
        rewardItem: lock.rewardItem ?? null,
        state: nextState,
    };
}

export function restoreGameState(savedState) {
    const initial = createGameState();
    if (!savedState || typeof savedState !== "object") {
        return initial;
    }

    const allObjectIds = Object.values(ROOM_OBJECTS).flat().map((object) => object.id);
    const validList = (value, allowed) => Array.isArray(value) ? [...new Set(value.filter((entry) => allowed.includes(entry)))] : [];
    return {
        unlockedRooms: [...new Set([...initial.unlockedRooms, ...validList(savedState.unlockedRooms, ROOM_IDS)])],
        items: validList(savedState.items, Object.keys(ITEMS)),
        discoveredObjects: validList(savedState.discoveredObjects, allObjectIds),
        usedObjects: validList(savedState.usedObjects, allObjectIds),
        availableLocks: [...new Set([...initial.availableLocks, ...validList(savedState.availableLocks, Object.keys(LOCKS))])],
        openedLocks: validList(savedState.openedLocks, Object.keys(LOCKS)),
        escaped: Boolean(savedState.escaped),
    };
}