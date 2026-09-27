import {
    COLORS,
    ITEMS,
    LOCKS,
    MINEFIELD,
    PROGRESS_KEY,
    ROOM_IDS,
    ROOMS,
    ROOM_OBJECTS,
    canEnterRoom,
    createGameState,
    inspectObject,
    restoreGameState,
    submitPuzzle,
} from "./game.mjs";

const roomContent = {
    office: {
        name: "月餅評審室",
        title: "胡仁又把五仁月餅打零分了",
        intro: "你是臨時被叫來加班的見習調查員。評審長胡仁倒在桌邊，旁邊有半杯珍奶和一張月餅打分表。法醫說他聽完冷笑話後笑到喘不過氣。大家都說是命案，因為那個笑話實在太冷。",
        icon: "🥮",
        art: "月餅評審桌",
        arrivalClue: "",
        lockLabel: "評審室離場鎖",
        hint: "把打卡時間、分數和票券對照起來。同分時，胡仁另有規定。",
        wrong: "鎖沒開。旁邊的兔子塗鴉好像在偷笑。",
        success: "門鎖喀一聲彈開，茶水間傳來微波爐叮的一聲。",
    },
    pantry: {
        name: "員工茶水間",
        title: "冰箱裡有一盒沒人認領的五仁月餅",
        intro: "微波爐裡有一杯忘了拿的珍奶，吸管還卡在門縫。冰箱旁的置物櫃掛著鎖，後面傳出很像有人打呼的聲音。",
        icon: "🧋",
        art: "共用冰箱・請勿偷喝",
        arrivalClue: "你剛從評審室抽屜裡翻出一支小螺絲起子。冰箱後面有塊板子不太平，四周留著新刮痕。",
        lockLabel: "冰箱磁鐵拼盤",
        hint: "收據印出來的順序不等於購買順序；色票和品項要配在一起。",
        wrong: "磁鐵啪一聲彈回原位。冰箱裡的珍奶看起來也對你很失望。",
        success: "磁鐵拼對了，置物櫃打開，伸縮磁鐵棒掉了出來。",
    },
    hidden: {
        name: "冰箱後面的隱藏室",
        title: "這裡真的有人把月餅藏進牆裡",
        intro: "你爬過通風口，鑽進一間沒開燈的小房間。灰塵很多，月餅更多。牆上的東西只有被照亮時才看得清楚。",
        icon: "🌙",
        art: "廣寒宮・秘密儲藏室",
        arrivalClue: "手電筒照亮後，你看見員工藏起來的零食、地板縫裡的一把鑰匙，還有一扇掛著奇怪門牌的門。",
        lockLabel: "月相地雷格",
        hint: "數字說的是周圍，不是自己。月牙記號和格子上的 0 要一起看。",
        wrong: "這條路不對。地雷格閃了一下，數字又蓋回去了。",
        success: "安全格底下露出一張月宮門卡。",
    },
    hallway: {
        name: "逃生走廊",
        title: "出口就在前面，保全卻去買雞排了",
        intro: "走廊盡頭的警報盒開始滴答響。透明蓋板已經打開，裡面有幾條顏色不同的線，牆上貼著兩張保全留下的紀錄。",
        icon: "🚪",
        art: "出口警報盒・演習中",
        arrivalClue: "你用黃銅小鑰匙開了走廊門。警報盒的月宮門卡槽亮著，裡面的線還沒人碰過。",
        lockLabel: "警報盒演習",
        hint: "兩張紀錄分別說了月相順序和顏色對照，把它們接起來讀。",
        wrong: "警報盒嗶嗶叫了兩聲，計時器退回起點。先別緊張，它只是演習。",
        success: "最後一條線接對了。警報停下，出口燈變成綠色。",
    },
};

const roomId = document.body.dataset.room;
const room = roomContent[roomId];
const root = document.querySelector("#room-root");
const lock = room ? LOCKS[ROOMS[roomId].lockId] : null;
let gameState = readGameState();
let selectedItem = null;
let keypadValue = "";
let colorOrder = [];
let wireOrder = [];
let mineOrder = [];
let revealedMineCells = new Set();
let wrongAttempts = 0;

if (!room || !canEnterRoom(gameState, roomId)) {
    window.location.replace("index.html");
} else {
    document.title = `${room.name}｜月餅不在場證明`;
    renderRoom();
}

function readGameState() {
    try {
        return restoreGameState(JSON.parse(sessionStorage.getItem(PROGRESS_KEY)));
    } catch {
        sessionStorage.removeItem(PROGRESS_KEY);
        return createGameState();
    }
}

function saveGameState() {
    sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(gameState));
}

function renderRoom() {
    const roomNumber = ROOM_IDS.indexOf(roomId) + 1;
    const roomLinks = ROOM_IDS.map((id, index) => {
        const label = `${String(index + 1).padStart(2, "0")} ${roomContent[id].name}`;
        if (!canEnterRoom(gameState, id)) {
            return `<span class="room-step is-locked" aria-disabled="true">${label}・未開</span>`;
        }
        const current = id === roomId ? " is-current" : "";
        return `<a class="room-step${current}" href="${ROOMS[id].path}"${id === roomId ? ' aria-current="page"' : ""}>${label}</a>`;
    }).join("");
    const objectButtons = ROOM_OBJECTS[roomId].map((object) => `
        <button class="object-button${object.givesItem && gameState.items.includes(object.givesItem) ? " has-item" : ""}${object.unlockRoom && canEnterRoom(gameState, object.unlockRoom) ? " is-used" : ""}" type="button" data-object="${object.id}" aria-pressed="false">
            <span class="object-icon" aria-hidden="true">${object.icon}</span>
            <span class="object-name">${object.name}</span>
            <span class="object-action">查看 →</span>
        </button>
    `).join("");
    const items = renderInventoryMarkup();
    const puzzleAvailable = gameState.availableLocks.includes(ROOMS[roomId].lockId);
    const puzzleMarkup = puzzleAvailable ? renderPuzzleMarkup() : '<div class="puzzle-unavailable" id="puzzle-unavailable">警報盒的蓋子還沒打開。</div>';

    root.innerHTML = `
        <section class="room-hero" aria-labelledby="room-title">
            <div class="room-hero-copy">
                <p class="eyebrow">廣寒宮命案・房間 ${roomNumber} / ${ROOM_IDS.length}</p>
                <h1 id="room-title">${room.title}</h1>
                <p class="room-intro">${room.intro}</p>
                <nav class="room-map" aria-label="已開放房間">${roomLinks}</nav>
            </div>
            <div class="room-art" data-room-art="${roomId}" aria-label="${room.art}">
                <span class="art-serial">現場紀錄 0${roomNumber}</span>
                <span class="art-icon" aria-hidden="true">${room.icon}</span>
                <span class="art-label">${room.art}</span>
                <span class="art-mark" aria-hidden="true">月光調查中</span>
            </div>
        </section>

        <div class="room-layout">
            <section class="room-main" aria-label="房間調查與謎題">
                ${room.arrivalClue ? `<aside class="arrival-clue"><span>剛從上一間帶來的線索</span><p>${room.arrivalClue}</p></aside>` : ""}
                <section class="object-section" aria-labelledby="object-heading">
                    <div class="subheading"><p class="section-index">仔細找找</p><h2 id="object-heading">房間裡散落著東西</h2></div>
                    <div class="object-list">${objectButtons}</div>
                    <div class="object-detail" id="object-detail" aria-live="polite" aria-atomic="true">
                        <span class="detail-label">調查筆記</span>
                        <p>點物件查看。看起來沒用的東西，通常只是還沒輪到它。</p>
                    </div>
                </section>

                <section class="lock-panel" id="lock-panel" aria-labelledby="lock-title">
                    <div class="lock-heading">
                        <p class="section-index">${roomNumber === ROOM_IDS.length ? "最後一道機關" : "房間機關"}</p>
                        <h2 id="lock-title">${room.lockLabel}</h2>
                    </div>
                    ${puzzleMarkup}
                    <p class="door-feedback" id="door-feedback" role="status" aria-live="polite">${puzzleAvailable ? "面板亮著，附近的線索也許有用。" : "蓋板還關著。"}</p>
                </section>

                <section class="door-open" id="door-open" hidden>
                    <p class="section-index">機關有反應</p>
                    <p id="door-open-text"></p>
                    <a class="continue-button" id="continue-link" href="#" hidden>前往下一間 <span aria-hidden="true">→</span></a>
                </section>

                <section class="ending-panel" id="ending-panel" tabindex="-1" hidden>
                    <p class="section-index">終於下班了</p>
                    <h2>真兇：玉兔。動機：五仁月餅被打零分。</h2>
                    <p>玉兔受不了胡仁每年都嫌五仁月餅，於是把自己寫的冷笑話念給他聽。法醫說死者笑到喘不過氣；玉兔的辯解是：「我以為他只是笑得比較大聲。」這個案子結了，冷笑話還是沒有下架。</p>
                    <p class="ending-last-line">你終於走出去了。保全回來時，手上還拿著雞排和一杯珍奶。</p>
                    <button class="restart-inline" id="restart-inline" type="button">從頭再玩一次 ↻</button>
                </section>
            </section>

            <aside class="room-sidebar" aria-label="工具袋與調查提醒">
                <section class="inventory-panel" aria-labelledby="inventory-title">
                    <p class="section-index">隨身物品</p>
                    <h2 id="inventory-title">工具袋</h2>
                    <div class="inventory-list" id="inventory-list" aria-label="已取得的工具">${items}</div>
                    <p class="inventory-instruction">工具可以拖到房間物件上；也可以先點工具，再點物件。</p>
                </section>
                <section class="status-panel" aria-label="調查進度">
                    <p class="section-index">今天的加班紀錄</p>
                    <h2>${roomNumber} / ${ROOM_IDS.length}<br><span>${room.name}</span></h2>
                    <p class="sidebar-copy">四個房間、四種機關。胡仁把每件東西都寫進了值班紀錄。</p>
                    <div class="sidebar-note"><span aria-hidden="true">兔</span><p>胡仁的月餅評語：<br>「五仁？這是把冰箱清空了吧。」</p></div>
                    <p class="playtime">預計約 10 分鐘 ・ 不限時</p>
                </section>
            </aside>
        </div>
        <aside class="corner-hint-panel" id="corner-hint-panel" hidden aria-labelledby="corner-hint-title">
            <p class="section-index">調查提醒</p>
            <h2 id="corner-hint-title">往哪裡想？</h2>
            <p>${room.hint}</p>
            <button class="hint-close" id="hint-close" type="button">知道了</button>
        </aside>
    `;

    bindRoomControls();
    renderInventory();
    restoreRoomProgress();
}

function renderInventoryMarkup() {
    if (!gameState.items.length) {
        return '<span class="inventory-empty">口袋是空的</span>';
    }
    return gameState.items.map((itemId) => `
        <button class="inventory-item${selectedItem === itemId ? " is-selected" : ""}" type="button" draggable="true" data-item="${itemId}" aria-pressed="${selectedItem === itemId}">
            <span aria-hidden="true">${ITEMS[itemId].icon}</span><span>${ITEMS[itemId].name}</span>
        </button>
    `).join("");
}

function renderPuzzleMarkup() {
    if (lock.type === "keypad") {
        return `
            <div class="keypad-display" id="keypad-display" aria-label="目前按下的數字" aria-live="polite">○ ○ ○</div>
            <div class="keypad-grid" id="keypad-grid" aria-label="數字鍵盤">
                ${["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => `<button type="button" class="digit-button" data-digit="${digit}" aria-label="數字 ${digit}">${digit}</button>`).join("")}
                <button type="button" class="digit-button function-button" data-action="clear" aria-label="清除密碼">清除</button>
                <button type="button" class="digit-button" data-digit="0" aria-label="數字 0">0</button>
                <button type="button" class="digit-button function-button" data-action="delete" aria-label="刪除一位">⌫</button>
                <button type="button" class="digit-button enter-digit" data-action="submit">確認</button>
            </div>
        `;
    }
    if (lock.type === "colors") {
        const slots = Array.from({ length: lock.answer.length }, (_, index) => `<button class="sequence-slot" type="button" data-color-slot="${index}" aria-label="顏色位置 ${index + 1}"></button>`).join("");
        const chips = [...COLORS].reverse().map((color) => `<button class="color-chip" type="button" draggable="true" data-color="${color.id}" style="--chip-color:${color.hex}" aria-label="${color.name}"><span></span>${color.name}</button>`).join("");
        return `<div class="puzzle-caption">冷藏架・磁鐵片</div><div class="sequence-slots" id="color-slots">${slots}</div><div class="puzzle-tray" id="color-tray">${chips}</div><div class="puzzle-actions"><button class="puzzle-action" data-action="undo-color" type="button">退一格</button><button class="puzzle-action action-primary" data-action="submit-colors" type="button">試試看</button></div>`;
    }
    if (lock.type === "minefield") {
        const cells = MINEFIELD.flat().map((cell) => {
            const face = cell.mine ? "?" : cell.moon ? "☾" : String(cell.count);
            const className = cell.mine ? "mine-cell is-hidden-mine" : cell.moon ? "mine-cell is-moon" : "mine-cell";
            return `<button class="${className}" type="button" data-cell="${cell.id}" aria-label="格子 ${cell.id}">${face}</button>`;
        }).join("");
        return `<div class="puzzle-caption">月相倉庫・地板格</div><div class="minefield-grid" id="minefield-grid" role="group" aria-label="踩地雷式月相格子">${cells}</div><div class="puzzle-actions"><button class="puzzle-action" data-action="reset-mines" type="button">重新讀格</button></div>`;
    }

    const slots = Array.from({ length: lock.answer.length }, (_, index) => `<button class="wire-slot" type="button" data-wire-slot="${index}" aria-label="電線順序 ${index + 1}"><span>${index + 1}</span></button>`).join("");
    const wireColors = [COLORS[1], COLORS[0], COLORS[2], { id: "white", name: "白線・備用", hex: "#e7e7e1" }];
    const wires = wireColors.map((color) => `<button class="wire-chip" type="button" draggable="true" data-wire="${color.id}" style="--wire-color:${color.hex}" aria-label="${color.name}"><span class="wire-core"></span><span>${color.name}</span></button>`).join("");
    return `<div class="bomb-face"><span class="bomb-light"></span><span class="bomb-light"></span><span class="bomb-light"></span><span class="bomb-countdown">--:--</span></div><div class="wire-slots" id="wire-slots">${slots}</div><div class="wire-tray" id="wire-tray">${wires}</div><div class="puzzle-actions"><button class="puzzle-action" data-action="reset-wires" type="button">重排電線</button><button class="puzzle-action action-primary" data-action="submit-bomb" type="button">解除警報</button></div>`;
}

function bindRoomControls() {
    document.querySelectorAll(".object-button").forEach((button) => {
        button.addEventListener("click", () => useObject(button.dataset.object, selectedItem));
        button.addEventListener("dragover", (event) => event.preventDefault());
        button.addEventListener("drop", (event) => {
            event.preventDefault();
            const itemId = event.dataTransfer.getData("application/x-moon-item") || event.dataTransfer.getData("text/plain");
            if (itemId) {
                useObject(button.dataset.object, itemId);
            }
        });
    });

    document.querySelector("#room-root").addEventListener("click", handlePuzzleClick);
    document.querySelector("#room-root").addEventListener("dragstart", handlePuzzleDragStart);
    document.querySelector("#room-root").addEventListener("dragover", handlePuzzleDragOver);
    document.querySelector("#room-root").addEventListener("drop", handlePuzzleDrop);
    document.querySelector("#corner-hint").addEventListener("click", toggleCornerHint);
    document.querySelector("#hint-close").addEventListener("click", toggleCornerHint);
    document.querySelector("#restart-button").addEventListener("click", restartGame);
    document.querySelector("#restart-inline")?.addEventListener("click", restartGame);
    document.addEventListener("keydown", handleKeyboard);
}

function renderInventory() {
    const inventory = document.querySelector("#inventory-list");
    if (!inventory) {
        return;
    }
    inventory.innerHTML = renderInventoryMarkup();
    inventory.querySelectorAll(".inventory-item").forEach((button) => {
        button.addEventListener("click", () => {
            selectedItem = selectedItem === button.dataset.item ? null : button.dataset.item;
            renderInventory();
        });
        button.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("application/x-moon-item", button.dataset.item);
            event.dataTransfer.setData("text/plain", button.dataset.item);
            event.dataTransfer.effectAllowed = "copy";
        });
    });
}

function useObject(objectId, itemId) {
    const object = ROOM_OBJECTS[roomId].find((entry) => entry.id === objectId);
    const result = inspectObject(gameState, roomId, objectId, itemId);
    if (result.status === "need-item") {
        showObjectDetail(object.name, "這個東西卡得很緊。先在附近找找，有沒有能派上用場的小物件。");
        return;
    }
    if (result.status === "select-item") {
        showObjectDetail(object.name, "手上的工具好像不太合。試試工具袋裡別的東西。");
        return;
    }
    if (result.status === "already-have") {
        showObjectDetail(object.name, "這個已經收好了。口袋快裝不下了。");
        return;
    }

    gameState = result.state;
    saveGameState();
    if (result.object?.requiresItem) {
        selectedItem = null;
    }
    renderInventory();
    const detail = result.object?.detail ?? "這東西看起來還是很可疑。";
    const itemMessage = result.status === "item-found" ? `（放進工具袋：${ITEMS[result.object.givesItem].name}）` : "";
    showObjectDetail(object.name, `${detail} ${itemMessage}`);

    if (result.status === "room-opened") {
        revealDoor(result.object.unlockRoom, "門後有新的腳步聲。" );
    } else if (result.status === "lock-revealed") {
        renderRoom();
    }
}

function showObjectDetail(title, text) {
    const panel = document.querySelector("#object-detail");
    panel.replaceChildren();
    const label = document.createElement("span");
    const detail = document.createElement("p");
    label.className = "detail-label";
    label.textContent = title;
    detail.textContent = text;
    panel.append(label, detail);
}

function handlePuzzleClick(event) {
    const digitButton = event.target.closest("[data-digit]");
    if (digitButton) {
        appendKeypadDigit(digitButton.dataset.digit);
        return;
    }

    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action === "clear") keypadValue = "";
    if (action === "delete") keypadValue = keypadValue.slice(0, -1);
    if (action === "submit") submitCurrentPuzzle(keypadValue);
    if (action === "undo-color") colorOrder.pop();
    if (action === "submit-colors") submitCurrentPuzzle(readSlotOrder("[data-color-slot]", "colorValue"));
    if (action === "reset-mines") resetMineProgress();
    if (action === "reset-wires") wireOrder = [];
    if (action === "submit-bomb") submitCurrentPuzzle(readSlotOrder("[data-wire-slot]", "wireValue"));

    const colorChip = event.target.closest("[data-color]");
    if (colorChip) {
        placeColor(colorChip.dataset.color);
        return;
    }
    const colorSlot = event.target.closest("[data-color-slot]");
    if (colorSlot) {
        colorOrder.splice(Number(colorSlot.dataset.colorSlot), 1);
        colorOrder = colorOrder.filter(Boolean);
        renderPuzzlePieces();
        return;
    }

    const mineCell = event.target.closest("[data-cell]");
    if (mineCell) {
        handleMineCell(mineCell.dataset.cell);
        return;
    }

    const wireChip = event.target.closest("[data-wire]");
    if (wireChip) {
        placeWire(wireChip.dataset.wire);
        return;
    }
    const wireSlot = event.target.closest("[data-wire-slot]");
    if (wireSlot) {
        wireOrder.splice(Number(wireSlot.dataset.wireSlot), 1);
        wireOrder = wireOrder.filter(Boolean);
        renderPuzzlePieces();
        return;
    }

    if (action === "clear" || action === "delete") renderKeypadDisplay();
    if (action === "undo-color" || action === "reset-wires") renderPuzzlePieces();
}

function handlePuzzleDragStart(event) {
    const colorChip = event.target.closest("[data-color]");
    const wireChip = event.target.closest("[data-wire]");
    if (colorChip) {
        event.dataTransfer.setData("application/x-moon-color", colorChip.dataset.color);
        event.dataTransfer.setData("text/plain", colorChip.dataset.color);
    } else if (wireChip) {
        event.dataTransfer.setData("application/x-moon-wire", wireChip.dataset.wire);
        event.dataTransfer.setData("text/plain", wireChip.dataset.wire);
    }
    event.dataTransfer.effectAllowed = "move";
}

function handlePuzzleDragOver(event) {
    if (event.target.closest("[data-color-slot], [data-wire-slot], .object-button")) {
        event.preventDefault();
    }
}

function handlePuzzleDrop(event) {
    const colorSlot = event.target.closest("[data-color-slot]");
    const wireSlot = event.target.closest("[data-wire-slot]");
    if (colorSlot) {
        event.preventDefault();
        const color = event.dataTransfer.getData("application/x-moon-color");
        if (color) {
            colorOrder[Number(colorSlot.dataset.colorSlot)] = color;
            renderPuzzlePieces();
        }
    } else if (wireSlot) {
        event.preventDefault();
        const wire = event.dataTransfer.getData("application/x-moon-wire");
        if (wire) {
            wireOrder[Number(wireSlot.dataset.wireSlot)] = wire;
            renderPuzzlePieces();
        }
    }
}

function placeColor(colorId) {
    if (colorOrder.length < lock.answer.length) {
        colorOrder.push(colorId);
        renderPuzzlePieces();
    }
}

function placeWire(colorId) {
    if (wireOrder.length < lock.answer.length) {
        wireOrder.push(colorId);
        renderPuzzlePieces();
    }
}

function renderPuzzlePieces() {
    const colorSlots = document.querySelector("#color-slots");
    if (colorSlots) {
        colorSlots.querySelectorAll("[data-color-slot]").forEach((slot, index) => {
            const color = COLORS.find((entry) => entry.id === colorOrder[index]);
            slot.dataset.colorValue = color?.id ?? "";
            slot.innerHTML = color ? `<span class="slot-color" style="--chip-color:${color.hex}"></span>` : "";
            slot.classList.toggle("is-filled", Boolean(color));
        });
    }
    const wireSlots = document.querySelector("#wire-slots");
    if (wireSlots) {
        wireSlots.querySelectorAll("[data-wire-slot]").forEach((slot, index) => {
            const wire = [...COLORS, { id: "white", hex: "#e7e7e1" }].find((entry) => entry.id === wireOrder[index]);
            slot.dataset.wireValue = wire?.id ?? "";
            slot.innerHTML = wire ? `<span class="wire-slot-color" style="--wire-color:${wire.hex}"></span>` : `<span>${index + 1}</span>`;
            slot.classList.toggle("is-filled", Boolean(wire));
        });
    }
}

function readSlotOrder(selector, property) {
    return [...document.querySelectorAll(selector)].map((slot) => slot.dataset[property] ?? "");
}

function handleMineCell(cellId) {
    const cell = MINEFIELD.flat().find((entry) => entry.id === cellId);
    const button = document.querySelector(`[data-cell="${cellId}"]`);
    const feedback = document.querySelector("#door-feedback");
    if (revealedMineCells.has(cellId)) {
        return;
    }
    if (cell.mine) {
        button.textContent = "✹";
        button.classList.add("is-mine-hit");
        mineOrder = [];
        revealedMineCells.clear();
        feedback.textContent = "碰到地雷了。它是紙做的，但數字還是得重看。";
        feedback.classList.add("is-error");
        window.setTimeout(renderMinefield, 650);
        return;
    }
    if (cell.moon) {
        const expected = lock.answer[mineOrder.length];
        if (cell.id !== expected) {
            mineOrder = [];
            revealedMineCells.clear();
            feedback.textContent = "這個月牙格的順序不對，從第一格再讀一次。";
            feedback.classList.add("is-error");
            renderMinefield();
            return;
        }
        mineOrder.push(cell.id);
        revealedMineCells.add(cell.id);
        button.textContent = cell.digit;
        button.classList.add("is-digit-revealed");
        feedback.classList.remove("is-error");
        if (mineOrder.length === lock.answer.length) {
            submitCurrentPuzzle(mineOrder);
        } else {
            feedback.textContent = `撿到一個數字，還有 ${lock.answer.length - mineOrder.length} 格。`;
        }
        return;
    }

    revealedMineCells.add(cellId);
    button.textContent = String(cell.count);
    button.classList.add("is-revealed");
    feedback.textContent = cell.count === 0 ? "這格周圍沒有地雷。" : `周圍有 ${cell.count} 顆地雷。`;
    feedback.classList.remove("is-error");
}

function renderMinefield() {
    const grid = document.querySelector("#minefield-grid");
    if (!grid) return;
    grid.querySelectorAll("[data-cell]").forEach((button) => {
        const cell = MINEFIELD.flat().find((entry) => entry.id === button.dataset.cell);
        if (revealedMineCells.has(cell.id)) {
            button.textContent = cell.moon ? cell.digit : String(cell.count);
            button.classList.toggle("is-digit-revealed", Boolean(cell.moon));
            button.classList.toggle("is-revealed", !cell.moon);
        } else {
            button.textContent = cell.mine ? "?" : cell.moon ? "☾" : "▧";
            button.classList.remove("is-digit-revealed", "is-revealed", "is-mine-hit");
        }
    });
}

function resetMineProgress() {
    mineOrder = [];
    revealedMineCells.clear();
    renderMinefield();
    document.querySelector("#door-feedback").textContent = "格子重設好了。慢慢看周圍的數字。";
    document.querySelector("#door-feedback").classList.remove("is-error");
}

function appendKeypadDigit(digit) {
    if (keypadValue.length < lock.answer.length) {
        keypadValue += digit;
        renderKeypadDisplay();
    }
}

function renderKeypadDisplay() {
    const display = document.querySelector("#keypad-display");
    if (display) {
        display.textContent = keypadValue.padEnd(lock.answer.length, "○").split("").join(" ");
    }
}

function handleKeyboard(event) {
    if (lock?.type !== "keypad" || event.ctrlKey || event.metaKey || event.altKey) {
        return;
    }
    if (/^\d$/.test(event.key)) {
        event.preventDefault();
        appendKeypadDigit(event.key);
    } else if (event.key === "Backspace") {
        event.preventDefault();
        keypadValue = keypadValue.slice(0, -1);
        renderKeypadDisplay();
    } else if (event.key === "Escape") {
        keypadValue = "";
        renderKeypadDisplay();
    } else if (event.key === "Enter") {
        event.preventDefault();
        submitCurrentPuzzle(keypadValue);
    }
}

function submitCurrentPuzzle(answer) {
    const result = submitPuzzle(gameState, ROOMS[roomId].lockId, answer);
    const feedback = document.querySelector("#door-feedback");
    if (result.status === "need-clues") {
        feedback.textContent = "面板沒有反應。附近好像還有沒看過的東西。";
    } else if (result.status === "need-item") {
        feedback.textContent = "這個機關還缺一樣東西。檢查一下工具袋和房間角落。";
    } else if (result.status === "locked") {
        feedback.textContent = "面板被蓋住了。先處理外層的卡榫。";
    } else if (result.status === "unknown-lock") {
        feedback.textContent = "這個面板沒有接上電源。先檢查房間裡的機關。";
        feedback.classList.add("is-error");
        return result;
    } else if (result.status === "wrong" || result.status === "invalid") {
        wrongAttempts += 1;
        feedback.textContent = room.wrong;
        feedback.classList.add("is-error");
        if (lock.type === "colors") colorOrder = [];
        if (lock.type === "bomb") wireOrder = [];
        if (lock.type === "keypad") keypadValue = "";
        renderPuzzlePieces();
        renderKeypadDisplay();
        return result;
    } else if (result.status === "already-open") {
        feedback.textContent = "這個機關已經打開了。";
        return result;
    } else {
        gameState = result.state;
        saveGameState();
        feedback.classList.remove("is-error");
        if (lock.type === "keypad") renderKeypadDisplay();
        if (result.status === "escaped") {
            feedback.textContent = room.success;
            document.querySelector("#lock-panel").hidden = true;
            document.querySelector("#ending-panel").hidden = false;
            document.querySelector("#ending-panel").focus();
            return result;
        }

        document.querySelector("#lock-panel").hidden = true;
        renderInventory();
        const rewardText = result.rewardItem ? ` 找到${ITEMS[result.rewardItem].name}。` : "";
        const message = `${room.success}${rewardText}`;
        if (result.nextRoom) {
            revealDoor(result.nextRoom, message);
        } else {
            revealDoor(null, message);
        }
        return result;
    }

    feedback.classList.toggle("is-error", ["need-clues", "need-item", "locked"].includes(result.status));
    return result;
}

function revealDoor(nextRoomId, message) {
    const doorOpen = document.querySelector("#door-open");
    if (!doorOpen) return;
    document.querySelector("#door-open-text").textContent = message;
    const continueLink = document.querySelector("#continue-link");
    if (nextRoomId) {
        continueLink.href = ROOMS[nextRoomId].path;
        continueLink.textContent = `進入${roomContent[nextRoomId].name} →`;
        continueLink.hidden = false;
    } else {
        continueLink.hidden = true;
    }
    doorOpen.hidden = false;
    continueLink.focus();
}

function restoreRoomProgress() {
    if (gameState.escaped && roomId === "hallway") {
        document.querySelector("#lock-panel").hidden = true;
        document.querySelector("#ending-panel").hidden = false;
        return;
    }
    if (gameState.openedLocks.includes(ROOMS[roomId].lockId)) {
        document.querySelector("#lock-panel").hidden = true;
        if (ROOMS[roomId].next && canEnterRoom(gameState, ROOMS[roomId].next)) {
            revealDoor(ROOMS[roomId].next, "這道機關已經打開了。通道還在那裡。" );
        } else {
            revealDoor(null, "這個機關已經打開了。" );
        }
    }
    renderMinefield();
}

function toggleCornerHint() {
    const panel = document.querySelector("#corner-hint-panel");
    panel.hidden = !panel.hidden;
    document.querySelector("#corner-hint").setAttribute("aria-expanded", String(!panel.hidden));
}

function restartGame() {
    sessionStorage.removeItem(PROGRESS_KEY);
    window.location.assign("index.html");
}