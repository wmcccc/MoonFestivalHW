import {
    PROGRESS_KEY,
    ROOM_IDS,
    ROOMS,
    canEnterRoom,
    createGameState,
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
        objects: [
            { icon: "🧾", name: "簽到表和月餅券", detail: "嫦娥 20:08 到，餅券 A06；玉兔 20:14 到，餅券 B02；吳剛 20:21 到，餅券 C08。" },
            { icon: "🏷️", name: "門旁的密碼貼紙", detail: "貼紙寫著：「照簽到時間，由早到晚，把三張餅券最後一個數字排起來。」" },
        ],
        lockLabel: "評審室的門鎖",
        lockPrompt: "輸入三位數，打開茶水間的門。",
        hint: "先排 20:08、20:14、20:21，再取 A06、B02、C08 最後一碼。",
        wrong: "不對。門鎖嗶了兩聲，還順便嫌你數學不好。",
        nextText: "門鎖開了！門後就是茶水間，裡面傳來微波爐叮的一聲。",
    },
    pantry: {
        name: "員工茶水間",
        title: "冰箱裡有一盒沒人認領的五仁月餅",
        intro: "你走進茶水間，微波爐裡有一杯忘了拿的珍奶，吸管還插在門縫。冰箱貼著一張剛解鎖的便條，字跡很像死者，內容卻像超商店員寫的。",
        icon: "🧋",
        art: "共用冰箱・請勿偷喝",
        arrivalClue: "抽屜裡的便條：「下一道鎖看超商收據。照時間順序，抄每筆金額最後一個數字。」這裡連冰箱都要密碼，廣寒宮管理費真的沒白收。",
        objects: [
            { icon: "🧾", name: "皺掉的超商收據", detail: "20:10 無糖奶茶 $34；20:14 胡蘿蔔三明治 $12；20:18 五仁月餅 $27。收據底下還寫著「集點差一點」。" },
            { icon: "🧲", name: "冰箱磁鐵", detail: "磁鐵上寫：「食物請寫名字。沒寫就當公用，但不准寫『公用』。」旁邊畫了一隻正在瞪人的兔子。" },
        ],
        lockLabel: "冰箱旁的置物櫃",
        lockPrompt: "照收據時間，輸入三筆金額最後一個數字。",
        hint: "20:10 是第一筆、20:14 第二筆、20:18 第三筆；各取金額個位數。",
        wrong: "鎖沒開。冰箱裡的珍奶看起來也對你很失望。",
        nextText: "置物櫃開了！一張兔子群組截圖和走廊門卡掉了出來。",
    },
    hallway: {
        name: "逃生走廊",
        title: "出口就在前面，保全卻去買雞排了",
        intro: "走廊沒人，門上貼著「故障請勿重開」；旁邊還有一台投幣式月餅販賣機。置物櫃裡那張群組截圖，現在看起來很像有人自己把犯案原因傳給全公司。",
        icon: "🚪",
        art: "出口・請刷卡再輸入密碼",
        arrivalClue: "群組截圖：「胡仁再說五仁月餅不算月餅，我就把那個冷笑話講到底。」發訊息的是玉兔。旁邊的便條補一句：出口密碼是今晚月亮升起的時間，冒號不用打。",
        objects: [
            { icon: "🌕", name: "天文台公告", detail: "今晚月出時間：20:10。公告最下面還提醒：「請勿對月亮按讚，它不會回覆。」" },
            { icon: "📱", name: "兔子群組截圖", detail: "玉兔：「胡仁再說五仁月餅不算月餅，我就把那個冷笑話講到底。」胡仁回了一個倒讚，隔壁同事回「不要在上班時間吵」。" },
        ],
        lockLabel: "大樓出口",
        lockPrompt: "把月出時間輸入成四位數，不用打冒號。",
        hint: "公告上寫 20:10，把冒號拿掉就好。",
        wrong: "還是出不去。走廊的感應燈都替你尷尬地暗了一格。",
        nextText: "",
    },
};

const roomId = document.body.dataset.room;
const room = roomContent[roomId];
const root = document.querySelector("#room-root");

function readGameState() {
    try {
        const saved = JSON.parse(sessionStorage.getItem(PROGRESS_KEY));
        if (saved && Array.isArray(saved.unlockedRooms) && Array.isArray(saved.completedRooms)) {
            return {
                unlockedRooms: ROOM_IDS.filter((id) => saved.unlockedRooms.includes(id)),
                completedRooms: ROOM_IDS.filter((id) => saved.completedRooms.includes(id)),
                escaped: Boolean(saved.escaped),
            };
        }
    } catch {
        sessionStorage.removeItem(PROGRESS_KEY);
    }
    return createGameState();
}

let gameState = readGameState();

if (!room || !canEnterRoom(gameState, roomId)) {
    window.location.replace("index.html");
} else {
    document.title = `${room.name}｜月餅不在場證明`;
    renderRoom();
}

function renderRoom() {
    const roomNumber = ROOM_IDS.indexOf(roomId) + 1;
    const locationLinks = ROOM_IDS.map((id, index) => {
        const label = `${String(index + 1).padStart(2, "0")} ${roomContent[id].name}`;
        const current = id === roomId ? " is-current" : "";
        if (!canEnterRoom(gameState, id)) {
            return `<span class="room-step is-locked" aria-disabled="true">${label}・未開</span>`;
        }
        return `<a class="room-step${current}" href="${ROOMS[id].path}"${id === roomId ? ' aria-current="page"' : ""}>${label}</a>`;
    }).join("");

    const objects = room.objects.map((item, index) => `
        <button class="object-button" type="button" data-object="${index}" aria-pressed="false">
            <span class="object-icon" aria-hidden="true">${item.icon}</span>
            <span class="object-name">${item.name}</span>
            <span class="object-action">查看 →</span>
        </button>
    `).join("");

    root.innerHTML = `
        <section class="room-hero" aria-labelledby="room-title">
            <div class="room-hero-copy">
                <p class="eyebrow">廣寒宮命案・房間 ${roomNumber} / 3</p>
                <h1 id="room-title">${room.title}</h1>
                <p class="room-intro">${room.intro}</p>
                <nav class="room-map" aria-label="已開放房間">${locationLinks}</nav>
            </div>
            <div class="room-art" data-room-art="${roomId}" aria-label="${room.art}">
                <span class="art-serial">現場紀錄 0${roomNumber}</span>
                <span class="art-icon" aria-hidden="true">${room.icon}</span>
                <span class="art-label">${room.art}</span>
                <span class="art-mark" aria-hidden="true">中秋特別調查</span>
            </div>
        </section>

        <div class="room-layout">
            <section class="room-main" aria-label="房間調查與密碼鎖">
                ${room.arrivalClue ? `<aside class="arrival-clue"><span>剛解鎖的線索</span><p>${room.arrivalClue}</p></aside>` : ""}
                <section class="object-section" aria-labelledby="object-heading">
                    <div class="subheading"><p class="section-index">看看周圍</p><h2 id="object-heading">房間裡有這些東西</h2></div>
                    <div class="object-list">${objects}</div>
                    <div class="object-detail" id="object-detail" aria-live="polite" aria-atomic="true">
                        <span class="detail-label">調查筆記</span>
                        <p>點一件物品看看。沒有一件看起來像正經線索，這倒是很可疑。</p>
                    </div>
                </section>

                <form class="lock-panel" id="door-form" novalidate>
                    <div class="lock-heading">
                        <p class="section-index">下一道門・${roomNumber === 3 ? "最後一道鎖" : `第 ${roomNumber} 道鎖`}</p>
                        <h2>${room.lockLabel}</h2>
                        <p>${room.lockPrompt}</p>
                    </div>
                    <div class="lock-entry">
                        <label class="visually-hidden" for="door-code">輸入密碼</label>
                        <input id="door-code" name="code" type="text" inputmode="numeric" autocomplete="off" maxlength="${ROOMS[roomId].code.length}" placeholder="${"●".repeat(ROOMS[roomId].code.length)}" aria-describedby="door-feedback">
                        <button class="unlock-button" type="submit">${roomNumber === 3 ? "打開出口" : "開鎖進下一間"}<span aria-hidden="true">→</span></button>
                    </div>
                    <p class="door-feedback" id="door-feedback" role="status" aria-live="polite">門鎖旁貼著一張字條：「密碼不要寫在門上。」</p>
                    <button class="hint-button" id="hint-button" type="button" hidden>我卡住了，給個提示</button>
                    <p class="hint-text" id="hint-text" hidden>${room.hint}</p>
                </form>

                <section class="door-open" id="door-open" hidden>
                    <p class="section-index">門開了</p>
                    <p id="door-open-text"></p>
                    <a class="continue-button" id="continue-link" href="#">推門進去 <span aria-hidden="true">→</span></a>
                </section>

                <section class="ending-panel" id="ending-panel" tabindex="-1" hidden>
                    <p class="section-index">案子結了，你也出來了</p>
                    <h2>真兇：玉兔。動機：五仁月餅被打零分。</h2>
                    <p>玉兔受不了胡仁每年都嫌五仁月餅，於是把自己寫的冷笑話念給他聽。法醫說死者笑到喘不過氣；玉兔的辯解是：「我以為他只是笑得比較大聲。」這個案子結了，冷笑話還是沒有下架。</p>
                    <p class="ending-last-line">你終於走出去了。保全回來時，手上還拿著雞排和一杯珍奶。</p>
                    <button class="restart-inline" id="restart-inline" type="button">從頭再玩一次 ↻</button>
                </section>
            </section>

            <aside class="room-sidebar" aria-label="案件進度">
                <p class="section-index">今天的加班紀錄</p>
                <h2>${roomNumber} / 3<br><span>${room.name}</span></h2>
                <p class="sidebar-copy">你每打開一道鎖，就會進到新的房間，拿到下一條線索。別急著回家，走廊的門還沒開。</p>
                <div class="sidebar-note"><span aria-hidden="true">兔</span><p>胡仁的月餅評語：<br>「五仁？這是把冰箱清空了吧。」</p></div>
                <p class="playtime">預計 3–5 分鐘 ・ 不限時</p>
            </aside>
        </div>
    `;

    bindRoomControls();
    restoreCompletedRoom();
}

function bindRoomControls() {
    const detail = document.querySelector("#object-detail");
    document.querySelectorAll(".object-button").forEach((button) => {
        button.addEventListener("click", () => {
            const item = room.objects[Number(button.dataset.object)];
            document.querySelectorAll(".object-button").forEach((other) => other.setAttribute("aria-pressed", "false"));
            button.setAttribute("aria-pressed", "true");
            detail.innerHTML = `<span class="detail-label">${item.name}</span><p>${item.detail}</p>`;
        });
    });

    let wrongAttempts = 0;
    const form = document.querySelector("#door-form");
    const input = document.querySelector("#door-code");
    const feedback = document.querySelector("#door-feedback");
    const hintButton = document.querySelector("#hint-button");
    const hintText = document.querySelector("#hint-text");

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const result = submitDoorCode(gameState, roomId, input.value);
        if (result.status === "invalid") {
            feedback.textContent = `這道鎖要 ${ROOMS[roomId].code.length} 位數字，不能偷加井字號。`;
            feedback.classList.add("is-error");
            input.select();
            return;
        }
        if (result.status === "wrong") {
            wrongAttempts += 1;
            feedback.textContent = room.wrong;
            feedback.classList.add("is-error");
            hintButton.hidden = wrongAttempts < 2;
            input.select();
            return;
        }
        if (result.status === "locked" || result.status === "unknown-room") {
            window.location.replace("index.html");
            return;
        }

        gameState = result.state;
        sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(gameState));
        input.disabled = true;
        form.querySelector(".unlock-button").disabled = true;
        feedback.classList.remove("is-error");

        if (result.status === "escaped") {
            feedback.textContent = "門開了。外面的空氣聞起來像自由和雞排。";
            document.querySelector("#ending-panel").hidden = false;
            document.querySelector("#ending-panel").focus();
            return;
        }

        feedback.textContent = room.nextText;
        const nextRoom = roomContent[result.nextRoom];
        const doorOpen = document.querySelector("#door-open");
        document.querySelector("#door-open-text").textContent = room.nextText;
        const continueLink = document.querySelector("#continue-link");
        continueLink.href = ROOMS[result.nextRoom].path;
        continueLink.textContent = `進入${nextRoom.name} →`;
        doorOpen.hidden = false;
        continueLink.focus();
    });

    hintButton.addEventListener("click", () => {
        hintText.hidden = !hintText.hidden;
        hintButton.textContent = hintText.hidden ? "我卡住了，給個提示" : "收起提示";
    });

    document.querySelector("#restart-button").addEventListener("click", restartGame);
    document.querySelector("#restart-inline")?.addEventListener("click", restartGame);
}

function restoreCompletedRoom() {
    if (!gameState.completedRooms.includes(roomId)) {
        return;
    }

    const form = document.querySelector("#door-form");
    const feedback = document.querySelector("#door-feedback");
    form.hidden = true;

    if (roomId === "hallway" && gameState.escaped) {
        document.querySelector("#ending-panel").hidden = false;
        return;
    }

    if (ROOMS[roomId].next) {
        document.querySelector("#door-open").hidden = false;
        document.querySelector("#door-open-text").textContent = room.nextText;
        const continueLink = document.querySelector("#continue-link");
        continueLink.href = ROOMS[ROOMS[roomId].next].path;
        continueLink.textContent = `回到${roomContent[ROOMS[roomId].next].name} →`;
    }
    feedback.textContent = "這道門你已經打開過了。要繼續就推門進去。";
}

function restartGame() {
    sessionStorage.removeItem(PROGRESS_KEY);
    window.location.assign("index.html");
}