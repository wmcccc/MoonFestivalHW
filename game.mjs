export const CLUE_IDS = Object.freeze([
    "testimony",
    "moonrise",
    "joke",
    "attendance",
]);

export const ESCAPE_CODE = "628";

export function checkEscapeCode(value, inspectedClues) {
    const cluesFound = new Set(inspectedClues);
    if (!CLUE_IDS.every((clueId) => cluesFound.has(clueId))) {
        return { status: "need-clues" };
    }

    const code = String(value).trim();
    if (!/^\d{3}$/.test(code)) {
        return { status: "invalid" };
    }

    return code === ESCAPE_CODE
        ? { status: "escaped" }
        : { status: "wrong" };
}