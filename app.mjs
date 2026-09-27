import { checkEscapeCode, CLUE_IDS } from "./game.mjs";

const clues = [
    {
        id: "testimony",
        title: "玉兔的不在場證詞",
        category: "嫌疑人供詞",
        detail: "「20:08 我在天台餵月亮，完全沒進評審室。」署名是玉兔，旁邊還畫了一根胡蘿蔔。",
        summary: "玉兔聲稱 20:08 在天台餵月亮。",
    },
    {
        id: "moonrise",
        title: "天文台月出通報",
        category: "天文紀錄",
        detail: "今晚月亮在 20:10 才升起，早兩分鐘連月影都沒有。玉兔的證詞比月亮早了一點點。",
        summary: "月亮 20:10 才升起，玉兔的證詞有矛盾。",
    },
    {
        id: "joke",
        title: "現場冷笑話稿",
        category: "關鍵物證",
        detail: "稿上寫著：「五仁月餅怎麼認人？先核對身分證。」作者欄簽著玉兔，紙角留有一枚紅色兔爪印。法醫在旁批註：死者就是聽完這句後笑到月魄離體。",
        summary: "冷笑話稿署名玉兔，紙角有兔爪印。",
    },
    {
        id: "attendance",
        title: "宴會簽到簿與月餅券",
        category: "門鎖線索",
        detail: "嫦娥 20:08 入場，月餅券 A06；玉兔 20:14 入場，月餅券 B02；吳剛 20:21 入場，月餅券 C08。鎖旁刻著：依簽到先後排列，輸入月餅券末碼。",
        summary: "依簽到時間排序，月餅券末碼組成門鎖密碼。",
    },
];

const inspected = new Set();
const clueGrid = document.querySelector("#clue-grid");
const evidenceList = document.querySelector("#evidence-list");
const emptyNote = document.querySelector("#empty-note");
const feedback = document.querySelector("#feedback");
const codeInput = document.querySelector("#escape-code");
const hintButton = document.querySelector("#hint-button");
const hintText = document.querySelector("#hint-text");
const ending = document.querySelector("#ending");
let failedAttempts = 0;

function updateProgress() {
    document.querySelector("#progress-text").textContent = `線索 ${inspected.size} / ${CLUE_IDS.length}`;
}

function inspectClue(clue, button) {
    document.querySelector("#clue-category").textContent = clue.category;
    document.querySelector("#clue-detail-title").textContent = clue.title;
    document.querySelector("#clue-detail-text").textContent = clue.detail;

    button.setAttribute("aria-pressed", "true");
    button.querySelector(".clue-state").textContent = "已調查";

    if (!inspected.has(clue.id)) {
        inspected.add(clue.id);
        emptyNote?.remove();
        const entry = document.createElement("li");
        const title = document.createElement("span");
        const summary = document.createElement("span");
        title.className = "evidence-title";
        summary.className = "evidence-summary";
        title.textContent = clue.title;
        summary.textContent = clue.summary;
        entry.append(title, summary);
        evidenceList.append(entry);
        updateProgress();
    }

    feedback.textContent = `${clue.title}已記入調查筆記。`;
    feedback.className = "feedback";
}

clues.forEach((clue, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "clue-button";
    button.setAttribute("aria-pressed", "false");

    const number = document.createElement("span");
    number.className = "clue-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const name = document.createElement("span");
    name.className = "clue-name";
    name.textContent = clue.title;

    const state = document.createElement("span");
    state.className = "clue-state";
    state.textContent = "待調查";

    button.append(number, name, state);
    button.addEventListener("click", () => inspectClue(clue, button));
    clueGrid.append(button);
});

document.querySelector("#escape-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const result = checkEscapeCode(codeInput.value, inspected);

    if (result.status === "need-clues") {
        feedback.textContent = "門鎖沒有反應。還有物證尚未調查。";
    } else if (result.status === "invalid") {
        feedback.textContent = "密碼必須是三位數字。";
    } else if (result.status === "wrong") {
        failedAttempts += 1;
        feedback.textContent = "喀一聲，又鎖回去了。檢查簽到順序和月餅券末碼。";
        hintButton.hidden = failedAttempts < 2;
    } else {
        feedback.textContent = "密碼正確。門鎖發出一聲很像兔子打噴嚏的聲音。";
        feedback.className = "feedback is-success";
        ending.hidden = false;
        codeInput.disabled = true;
        document.querySelector(".submit-button").disabled = true;
        ending.focus();
    }

    if (result.status !== "escaped") {
        feedback.className = result.status === "invalid" || result.status === "wrong" || result.status === "need-clues"
            ? "feedback is-error"
            : "feedback";
        codeInput.select();
    }
});

hintButton.addEventListener("click", () => {
    hintText.hidden = !hintText.hidden;
    hintButton.textContent = hintText.hidden ? "看一點提示" : "收起提示";
});

document.querySelector("#restart-button").addEventListener("click", () => {
    window.location.reload();
});