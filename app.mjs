import {
    ITEMS,
    LOCKS,
    PROGRESS_KEY,
    ROOM_IDS,
    ROOMS,
    ROOM_OBJECTS,
    canEnterRoom,
    createGameState,
    inspectObject,
    restoreGameState,
    submitDoorCode,
} from "./game.mjs";

const roomContent = {
    office: {
        name: "月餅評審室",
        title: "胡仁又把五仁月餅打零分了",
        intro: "你是臨時被叫來加班的見習調查員。評審長胡仁倒在桌邊，桌上有半杯珍奶和一張月餅打分表。法醫說他聽完冷笑話後笑到喘不過氣。大家都說是命案，因為那個笑話實在太冷。",
        icon: "🥮",
        art: "月餅評審桌",
        arrivalClue: "",
        lockId: "office-door",
        lockLabel: "評審室的門鎖",
        lockPrompt: "先看打卡簿和密碼便條，再按三位數密碼。",
        hint: "按打卡時間排 A06、B02、C08，拿每張月餅券的最後一碼。",
        wrong: "不對。門鎖嗶兩聲，還順便嫌你數學不好。",
        success: "門鎖開了！門後傳來微波爐叮的一聲。",
    },
    pantry: {
        name: "員工茶水間",
        title: "冰箱裡有一盒沒人認領的五仁月餅",
        intro: "微波爐裡有一杯忘了拿的珍奶，吸管還插在門縫。冰箱旁的置物櫃掛著密碼鎖，後面傳出很像有人在打呼的聲音。",
        icon: "🧋",
        art: "共用冰箱・請勿偷喝",
        arrivalClue: "你剛從評審室的抽屜裡找到小螺絲起子。冰箱後面有一塊不太平的通風板，說不定拆開會有東西。",
        lockId: "pantry-toolbox",
        lockLabel: "冰箱旁的工具櫃",
        lockPrompt: "照收據時間，按三筆金額的個位數。櫃子裡放著怪工具。",
        hint: "收據 20:10、20:14、20:18 的金額依序是 $34、$12、$27。",
        wrong: "鎖沒開。冰箱裡的珍奶看起來也對你很失望。",
        success: "工具櫃開了，裡面有一支伸縮磁鐵棒。",
    },
    hidden: {
        name: "冰箱後面的隱藏室",
        title: "這裡真的有人把月餅藏進牆裡",
        intro: "你爬過通風口，鑽進一間沒開燈的小房間。灰塵很多，月餅更多。牆上有張看不清楚的月曆，角落傳來金屬碰撞聲。",
        icon: "🌙",
        art: "廣寒宮・秘密儲藏室",
        arrivalClue: "手電筒照亮後，你看到一排員工偷藏的零食，還有一張寫著「不是衣櫃」的門牌。這裡的標示方式很值得調查。",
        lockId: "hidden-archive",
        lockLabel: "月曆旁的工具箱",
        lockPrompt: "先用手電筒照月曆，再看冰箱上撕下來的行事曆。",
        hint: "農曆八月十五，密碼要把月份放前面，不用輸入斜線。",
        wrong: "工具箱發出一聲不屑的喀。它比胡仁還難伺候。",
        success: "工具箱打開了，裡面有一張月宮門卡。",
    },
    hallway: {
        name: "逃生走廊",
        title: "出口就在前面，保全卻去買雞排了",
        intro: "走廊沒人，出口的密碼鎖蓋著塑膠板。牆上貼著一張天文台公告，還有兔子群組的列印截圖，最後一則訊息看起來有點可疑。",
        icon: "🚪",
        art: "出口・請刷卡再輸入密碼",
        arrivalClue: "你用黃銅小鑰匙打開了走廊門。門後有個刷卡槽，旁邊貼著「進入前請確認自己已經下班」。",
        lockId: "hall-exit",
        lockLabel: "大樓出口",
        lockPrompt: "用月宮門卡打開密碼鎖蓋子，再輸入月出時間。",
        hint: "天文台公告寫著 20:10。拿掉冒號就好。",
        wrong: "還是出不去。感應燈替你尷尬地暗了一格。",
        success: "出口開了。外面的空氣聞起來像自由和雞排。",
    },
};

const roomId = document.body.dataset.room;
const room = roomContent[roomId];
const root = document.querySelector("#room-root");
const lock = room ? LOCKS[room.lockId] : null;
let gameState = readGameState();
let selectedItem = null;
let keypadValue = "";
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
        <button class="object-button" type="button" data-object="${object.id}" aria-pressed="false">
            <span class="object-icon" aria-hidden="true">${object.icon}</span>
            <span class="object-name">${object.name}</span>
            <span class="object-action">查看 →</span>
        </button>
    `).join("");

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
            <section class="room-main" aria-label="房間調查與密碼鎖">
                ${room.arrivalClue ? `<aside class="arrival-clue"><span>剛從上一間帶來的線索</span><p>${room.arrivalClue}</p></aside>` : ""}
                <section class="inventory-panel" aria-labelledby="inventory-title">
                    <div class="subheading"><p class="section-index">隨身工具</p><h2 id="inventory-title">工具袋</h2></div>
                    <p class="inventory-instruction" id="inventory-instruction">撿到工具後，點工具袋裡的工具，再點想使用的物件。</p>
                    <div class="inventory-list" id="inventory-list" aria-label="已取得的工具"></div>
                </section>
                <section class="object-section" aria-labelledby="object-heading">
                    <div class="subheading"><p class="section-index">仔細找找</p><h2 id="object-heading">房間裡散落著東西</h2></div>
                    <div class="object-list">${objectButtons}</div>
                    <div class="object-detail" id="object-detail" aria-live="polite" aria-atomic="true">
                        <span class="detail-label">調查筆記</span>
                        <p>先四處看看。地上那個月餅叉應該不是裝飾。</p>
                    </div>
                </section>

                <section class="lock-panel" id="lock-panel" aria-labelledby="lock-title">
                    <div class="lock-heading">
                        <p class="section-index">${roomNumber === ROOM_IDS.length ? "最後一道鎖" : "房間密碼鎖"}</p>
                        <h2 id="lock-title">${room.lockLabel}</h2>
                        <p>${room.lockPrompt}</p>
                    </div>
                    <div class="keypad-display" id="keypad-display" aria-label="目前輸入的密碼" aria-live="polite"><span class="display-placeholder">${"● ".repeat(lock.code.length)}</span></div>
                    <div class="keypad-grid" id="keypad-grid" aria-label="密碼按鈕">
                        ${["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => `<button type="button" class="digit-button" data-digit="${digit}" aria-label="數字 ${digit}">${digit}</button>`).join("")}
                        <button type="button" class="digit-button function-button" data-action="clear" aria-label="清除密碼">清除</button>
                        <button type="button" class="digit-button" data-digit="0" aria-label="數字 0">0</button>
                        <button type="button" class="digit-button function-button" data-action="delete" aria-label="刪除一位">⌫</button>
                        <button type="button" class="digit-button enter-digit" data-action="submit" aria-label="確認密碼">開鎖</button>
                    </div>
                    <p class="door-feedback" id="door-feedback" role="status" aria-live="polite">先找線索；密碼鎖不吃珍奶發票。</p>
                    <button class="hint-button" id="hint-button" type="button" hidden>我卡住了，給個提示</button>
                    <p class="hint-text" id="hint-text" hidden>${room.hint}</p>
                </section>

                <section class="door-open" id="door-open" hidden>
                    <p class="section-index">通道打開了</p>
                    <p id="door-open-text"></p>
                    <a class="continue-button" id="continue-link" href="#">進去看看 <span aria-hidden="true">→</span></a>
                </section>

                <section class="ending-panel" id="ending-panel" tabindex="-1" hidden>
                    <p class="section-index">終於下班了</p>
                    <h2>真兇：玉兔。動機：五仁月餅被打零分。</h2>
                    <p>玉兔受不了胡仁每年都嫌五仁月餅，於是把自己寫的冷笑話念給他聽。法醫說死者笑到喘不過氣；玉兔的辯解是：「我以為他只是笑得比較大聲。」這個案子結了，冷笑話還是沒有下架。</p>
                    <p class="ending-last-line">你終於走出去了。保全回來時，手上還拿著雞排和一杯珍奶。</p>
                    <button class="restart-inline" id="restart-inline" type="button">從頭再玩一次 ↻</button>
                </section>
            </section>

            <aside class="room-sidebar" aria-label="案件進度">
                <p class="section-index">今天的加班紀錄</p>
                <h2>${roomNumber} / ${ROOM_IDS.length}<br><span>${room.name}</span></h2>
                <p class="sidebar-copy">四個房間、四道密碼鎖。工具要自己撿、自己用，線索不會主動跑來幫你加班。</p>
                <div class="sidebar-note"><span aria-hidden="true">兔</span><p>胡仁的月餅評語：<br>「五仁？這是把冰箱清空了吧。」</p></div>
                <p class="playtime">預計約 10 分鐘 ・ 不限時</p>
            </aside>
        </div>
    `;

    renderInventory();
    bindObjects();
    bindKeypad();
    document.querySelector("#restart-button").addEventListener("click", restartGame);
    document.querySelector("#restart-inline")?.addEventListener("click", restartGame);
    restoreRoomProgress();
}

function renderInventory() {
    const inventory = document.querySelector("#inventory-list");
    const items = gameState.items;
    if (items.length === 0) {
        inventory.innerHTML = '<span class="inventory-empty">還沒撿到工具</span>';
        return;
    }

    inventory.innerHTML = items.map((itemId) => `
        <button class="inventory-item${selectedItem === itemId ? " is-selected" : ""}" type="button" data-item="${itemId}" aria-pressed="${selectedItem === itemId}">
            <span aria-hidden="true">${ITEMS[itemId].icon}</span>${ITEMS[itemId].name}
        </button>
    `).join("");
    inventory.querySelectorAll(".inventory-item").forEach((button) => {
        button.addEventListener("click", () => {
            selectedItem = selectedItem === button.dataset.item ? null : button.dataset.item;
            document.querySelector("#inventory-instruction").textContent = selectedItem
                ? `已選「${ITEMS[selectedItem].name}」，再點要使用它的物件。`
                : "撿到工具後，點工具袋裡的工具，再點想使用的物件。";
            renderInventory();
        });
    });
}

function bindObjects() {
    document.querySelectorAll(".object-button").forEach((button) => {
        button.addEventListener("click", () => {
            const result = inspectObject(gameState, roomId, button.dataset.object, selectedItem);
            const object = ROOM_OBJECTS[roomId].find((entry) => entry.id === button.dataset.object);
            if (result.status === "need-item") {
                showObjectDetail(object.name, `還沒有${ITEMS[result.itemId].name}。先找找房間裡有沒有能拿走的工具。`);
                return;
            }
            if (result.status === "select-item") {
                showObjectDetail(object.name, `你有${ITEMS[result.itemId].name}。先在工具袋點它，再回來使用。`);
                return;
            }

            gameState = result.state;
            saveGameState();
            if (result.object?.requiresItem) {
                selectedItem = null;
                document.querySelector("#inventory-instruction").textContent = "工具用上了。繼續查看其他東西或解密碼鎖。";
            }
            renderInventory();
            button.setAttribute("aria-pressed", "true");

            let detail = result.object?.detail ?? "這東西看起來還是很可疑。";
            if (result.status === "item-found") {
                detail += ` 拿到工具：${ITEMS[result.object.givesItem].name}。`;
            }
            showObjectDetail(object.name, detail);

            if (result.status === "room-opened") {
                revealNextRoom(result.object.unlockRoom, `你用${ITEMS[result.object.requiresItem].name}打開了通道。`);
            }
        });
    });
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

function bindKeypad() {
    const grid = document.querySelector("#keypad-grid");
    grid.querySelectorAll("[data-digit]").forEach((button) => {
        button.addEventListener("click", () => {
            if (keypadValue.length >= lock.code.length) {
                return;
            }
            keypadValue += button.dataset.digit;
            renderKeypadDisplay();
        });
    });
    grid.querySelector('[data-action="clear"]').addEventListener("click", () => {
        keypadValue = "";
        renderKeypadDisplay();
    });
    grid.querySelector('[data-action="delete"]').addEventListener("click", () => {
        keypadValue = keypadValue.slice(0, -1);
        renderKeypadDisplay();
    });
    grid.querySelector('[data-action="submit"]').addEventListener("click", submitCode);
    document.querySelector("#hint-button").addEventListener("click", toggleHint);
}

function renderKeypadDisplay() {
    const display = document.querySelector("#keypad-display");
    display.textContent = keypadValue.padEnd(lock.code.length, "○").split("").join(" ");
}

function submitCode() {
    const feedback = document.querySelector("#door-feedback");
    if (keypadValue.length !== lock.code.length) {
        feedback.textContent = `還沒按滿 ${lock.code.length} 個數字。慢慢來，門不會跑掉。`;
        feedback.classList.add("is-error");
        return;
    }

    const result = submitDoorCode(gameState, room.lockId, keypadValue);
    if (result.status === "need-clues") {
        feedback.textContent = "鎖不動。先把房間裡能看的線索都看一遍。";
    } else if (result.status === "need-item") {
        feedback.textContent = `還缺${ITEMS[LOCKS[room.lockId].requiredItems.find((itemId) => !gameState.items.includes(itemId))].name}。`;
    } else if (result.status === "locked") {
        feedback.textContent = "鎖的面板還沒打開。先找找有沒有能用的卡或鑰匙。";
    } else if (result.status === "wrong" || result.status === "invalid") {
        wrongAttempts += 1;
        feedback.textContent = room.wrong;
        document.querySelector("#hint-button").hidden = wrongAttempts < 2;
    } else if (result.status === "already-open") {
        feedback.textContent = "這道鎖已經開過了。";
    } else {
        gameState = result.state;
        saveGameState();
        if (result.status === "escaped") {
            feedback.textContent = room.success;
            document.querySelector("#keypad-grid").hidden = true;
            document.querySelector("#ending-panel").hidden = false;
            document.querySelector("#ending-panel").focus();
        } else {
            renderInventory();
            feedback.textContent = result.rewardItem
                ? `${room.success}拿到${ITEMS[result.rewardItem].name}。`
                : room.success;
            document.querySelector("#keypad-grid").hidden = true;
            if (result.nextRoom) {
                revealNextRoom(result.nextRoom, room.success);
            }
        }
    }

    feedback.classList.toggle("is-error", ["need-clues", "need-item", "locked", "wrong", "invalid", "already-open"].includes(result.status));
    if (result.status !== "wrong" && result.status !== "invalid") {
        keypadValue = "";
        renderKeypadDisplay();
    }
}

function revealNextRoom(nextRoomId, message) {
    const doorOpen = document.querySelector("#door-open");
    const continueLink = document.querySelector("#continue-link");
    document.querySelector("#door-open-text").textContent = message;
    continueLink.href = ROOMS[nextRoomId].path;
    continueLink.textContent = `進入${roomContent[nextRoomId].name} →`;
    doorOpen.hidden = false;
    continueLink.focus();
}

function restoreRoomProgress() {
    if (gameState.escaped && roomId === "hallway") {
        document.querySelector("#keypad-grid").hidden = true;
        document.querySelector("#door-feedback").textContent = room.success;
        document.querySelector("#ending-panel").hidden = false;
        return;
    }
    if (gameState.openedLocks.includes(room.lockId)) {
        document.querySelector("#keypad-grid").hidden = true;
        document.querySelector("#door-feedback").textContent = room.success;
        if (ROOMS[roomId].next && canEnterRoom(gameState, ROOMS[roomId].next)) {
            revealNextRoom(ROOMS[roomId].next, room.success);
        }
    }
}

function toggleHint() {
    const hintText = document.querySelector("#hint-text");
    const hintButton = document.querySelector("#hint-button");
    hintText.hidden = !hintText.hidden;
    hintButton.textContent = hintText.hidden ? "我卡住了，給個提示" : "收起提示";
}

function restartGame() {
    sessionStorage.removeItem(PROGRESS_KEY);
    window.location.assign("index.html");
}