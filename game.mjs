export const ROOM_IDS = Object.freeze(["office", "pantry", "hidden", "hallway"]);

export const ROOMS = Object.freeze({
    office: Object.freeze({ path: "index.html", next: "pantry", lockId: "office-door" }),
    pantry: Object.freeze({ path: "pantry.html", next: "hidden", lockId: "pantry-toolbox" }),
    hidden: Object.freeze({ path: "hidden.html", next: "hallway", lockId: "hidden-archive" }),
    hallway: Object.freeze({ path: "hallway.html", next: null, lockId: "hall-exit" }),
});

export const ITEMS = Object.freeze({
    cakeFork: Object.freeze({ name: "月餅叉", icon: "🍴" }),
    screwdriver: Object.freeze({ name: "小螺絲起子", icon: "🪛" }),
    flashlight: Object.freeze({ name: "兔子鑰匙圈手電筒", icon: "🔦" }),
    magnet: Object.freeze({ name: "伸縮磁鐵棒", icon: "🧲" }),
    brassKey: Object.freeze({ name: "黃銅小鑰匙", icon: "🗝️" }),
    keycard: Object.freeze({ name: "月宮門卡", icon: "💳" }),
});

export const ROOM_OBJECTS = Object.freeze({
    office: Object.freeze([
        Object.freeze({ id: "office-signin", name: "打卡簿", icon: "🕒", detail: "嫦娥 20:08 到，玉兔 20:14 到，吳剛 20:21 到。打卡簿特別註明：今天沒有人代打卡，連保全都準時。" }),
        Object.freeze({ id: "office-tickets", name: "月餅券存根", icon: "🎟️", detail: "嫦娥拿 A06，玉兔拿 B02，吳剛拿 C08。背面有胡仁的字：「券不要弄丟，去年有人拿收據來換月餅。」" }),
        Object.freeze({ id: "office-rule", name: "密碼便條", icon: "📝", detail: "便條寫著：「照打卡先後排隊，輸入三張月餅券最後一個數字。」下面還有一行：「午餐不要再拿我的珍奶。」" }),
        Object.freeze({ id: "office-fork", name: "地上的月餅叉", icon: "🍴", detail: "一把金色小叉子，插在一張寫著『五仁月餅零分』的打分表上。拿起來，可能會派上用場。", givesItem: "cakeFork" }),
        Object.freeze({ id: "office-drawer", name: "卡住的辦公桌抽屜", icon: "🗄️", detail: "抽屜縫裡露出一截螺絲起子握把。用月餅叉把它撬開。", requiresItem: "cakeFork", givesItem: "screwdriver" }),
    ]),
    pantry: Object.freeze([
        Object.freeze({ id: "pantry-receipt", name: "皺掉的超商收據", icon: "🧾", detail: "20:10 無糖奶茶 $34；20:14 胡蘿蔔三明治 $12；20:18 五仁月餅 $27。收據上還印著總額 $73，旁邊被人畫了三個問號。" }),
        Object.freeze({ id: "pantry-note", name: "收據背面的筆記", icon: "✍️", detail: "「工具櫃密碼：照購買時間由早到晚，把每筆金額的個位數排起來。不要用總額，總額只是拿來嚇會計的。」" }),
        Object.freeze({ id: "pantry-flashlight", name: "冰箱旁的小手電筒", icon: "🔦", detail: "兔子造型鑰匙圈，按一下會亮，按兩下會閃，按三下還是會閃。拿走。", givesItem: "flashlight" }),
        Object.freeze({ id: "pantry-vent", name: "冰箱後面的通風板", icon: "🪛", detail: "通風板被四顆螺絲鎖住，後面傳出很小聲的兔子打呼聲。需要小螺絲起子才能拆開。", requiresItem: "screwdriver", unlockRoom: "hidden" }),
    ]),
    hidden: Object.freeze([
        Object.freeze({ id: "hidden-calendar", name: "會發光的月曆", icon: "🌙", detail: "手電筒照過去，螢光字浮出來：「密碼第一半是中秋所在的月份。」月曆在八月那格畫了一個超大的月餅。", requiresItem: "flashlight" }),
        Object.freeze({ id: "hidden-phase-chart", name: "月相值班表", icon: "🌗", detail: "新月值班：初一；半月值班：初八；滿月值班：十五；月亮請假：二十二。胡仁連月亮請假都要排班。" }),
        Object.freeze({ id: "hidden-calendar-note", name: "工具箱密碼便條", icon: "📅", detail: "「把中秋月份放前面，再接滿月那天。輸入四位數，月份不足兩位要補 0，不用打斜線。」" }),
        Object.freeze({ id: "hidden-keybox", name: "月曆旁的工具箱", icon: "🔢", detail: "要輸入月份和日期，打開後可以拿到月宮門卡。", lockReward: "hidden-archive" }),
        Object.freeze({ id: "hidden-grate", name: "地板縫裡的金屬鑰匙", icon: "🧲", detail: "鑰匙掉進很窄的地板縫，手伸不進去。用伸縮磁鐵棒把它吸上來。", requiresItem: "magnet", givesItem: "brassKey" }),
        Object.freeze({ id: "hidden-door", name: "貼著『不是衣櫃』的門", icon: "🚪", detail: "門把上掛著一張「不是衣櫃」的牌子。門其實就是門，鎖孔看起來需要一把小鑰匙。", requiresItem: "brassKey", unlockRoom: "hallway" }),
    ]),
    hallway: Object.freeze([
        Object.freeze({ id: "hall-moonrise", name: "天文台公告", icon: "🌕", detail: "今晚月亮 20:10 升起。公告還提醒：「請勿對月亮按讚，它不會回覆。」旁邊手寫：把時間的冒號拿掉就是出口密碼。" }),
        Object.freeze({ id: "hall-exit-note", name: "出口旁的貼紙", icon: "🏷️", detail: "貼紙寫著：「鎖碼照公告原樣打；別加日期、樓層或你今天的工號。」下面還有一個月亮形狀的貼紙。" }),
        Object.freeze({ id: "hall-keypad-cover", name: "出口密碼鎖的塑膠蓋", icon: "💳", detail: "蓋子鎖得很緊，側邊有月宮門卡的插槽。刷卡後，才會露出真正的數字按鈕。", requiresItem: "keycard", unlockLock: "hall-exit" }),
        Object.freeze({ id: "hall-rabbit-chat", name: "兔子群組最後一則訊息", icon: "📱", detail: "玉兔：「胡仁再說五仁月餅不算月餅，我就把那個冷笑話講到底。」胡仁回了一個倒讚。這個案子的動機，比冷笑話還短。" }),
    ]),
});

export const LOCKS = Object.freeze({
    "office-door": Object.freeze({ roomId: "office", code: "628", requiredObjects: ["office-signin", "office-tickets", "office-rule"], unlockRoom: "pantry" }),
    "pantry-toolbox": Object.freeze({ roomId: "pantry", code: "427", requiredObjects: ["pantry-receipt", "pantry-note"], rewardItem: "magnet" }),
    "hidden-archive": Object.freeze({ roomId: "hidden", code: "0815", requiredObjects: ["hidden-calendar", "hidden-phase-chart", "hidden-calendar-note"], rewardItem: "keycard" }),
    "hall-exit": Object.freeze({ roomId: "hallway", code: "2010", requiredObjects: ["hall-moonrise", "hall-exit-note", "hall-keypad-cover"], requiredItems: ["keycard"], escaped: true }),
});

export const PROGRESS_KEY = "moonFestivalEscapeProgressV2";

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

    const nextState = {
        ...state,
        items: object.givesItem ? [...new Set([...state.items, object.givesItem])] : state.items,
        discoveredObjects: [...new Set([...state.discoveredObjects, objectId])],
        usedObjects: object.requiresItem ? [...new Set([...state.usedObjects, objectId])] : state.usedObjects,
        unlockedRooms: object.unlockRoom ? [...new Set([...state.unlockedRooms, object.unlockRoom])] : state.unlockedRooms,
        availableLocks: object.unlockRoom && ROOMS[object.unlockRoom].lockId
            ? [...new Set([...state.availableLocks, ROOMS[object.unlockRoom].lockId])]
            : object.unlockLock
                ? [...new Set([...state.availableLocks, object.unlockLock])]
                : state.availableLocks,
    };

    return {
        status: object.givesItem ? "item-found" : object.unlockRoom ? "room-opened" : "inspected",
        object,
        state: nextState,
    };
}

export function submitDoorCode(state, lockId, value) {
    const lock = LOCKS[lockId];
    if (!lock) {
        return { status: "unknown-lock", state };
    }
    if (!canEnterRoom(state, lock.roomId) || !state.availableLocks.includes(lockId)) {
        return { status: "locked", state };
    }
    if (state.openedLocks.includes(lockId)) {
        return { status: "already-open", state, nextRoom: lock.unlockRoom ?? null };
    }
    if (!lock.requiredObjects.every((objectId) => state.discoveredObjects.includes(objectId))) {
        return { status: "need-clues", state };
    }
    if (lock.requiredItems && !lock.requiredItems.every((itemId) => state.items.includes(itemId))) {
        return { status: "need-item", state };
    }

    const code = String(value).trim();
    if (!new RegExp(`^\\d{${lock.code.length}}$`).test(code)) {
        return { status: "invalid", state };
    }
    if (code !== lock.code) {
        return { status: "wrong", state };
    }

    const nextState = {
        ...state,
        openedLocks: [...new Set([...state.openedLocks, lockId])],
        items: lock.rewardItem ? [...new Set([...state.items, lock.rewardItem])] : state.items,
        unlockedRooms: lock.unlockRoom ? [...new Set([...state.unlockedRooms, lock.unlockRoom])] : state.unlockedRooms,
        availableLocks: lock.unlockRoom && ROOMS[lock.unlockRoom].lockId
            ? [...new Set([...state.availableLocks, ROOMS[lock.unlockRoom].lockId])]
            : state.availableLocks,
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