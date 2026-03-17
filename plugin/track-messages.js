"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const MESSAGE_THRESHOLD = 3;
function getStatePath(sessionId, suffix) {
    return (0, path_1.join)((0, os_1.tmpdir)(), `sesh-${sessionId}.${suffix}`);
}
function readCount(counterPath) {
    if (!(0, fs_1.existsSync)(counterPath))
        return 0;
    return parseInt((0, fs_1.readFileSync)(counterPath, "utf-8"), 10) || 0;
}
function run() {
    const input = JSON.parse((0, fs_1.readFileSync)("/dev/stdin", "utf-8"));
    const { session_id: sessionId } = input;
    const namedPath = getStatePath(sessionId, "named");
    if ((0, fs_1.existsSync)(namedPath))
        return;
    const counterPath = getStatePath(sessionId, "count");
    const count = readCount(counterPath) + 1;
    (0, fs_1.writeFileSync)(counterPath, String(count));
    if (count < MESSAGE_THRESHOLD)
        return;
    (0, fs_1.writeFileSync)(namedPath, "1");
    const output = {
        systemMessage: [
            "AUTO-NAME SESSION: This session has no name yet.",
            "Based on the conversation so far, generate a concise session name (3-5 words, lowercase with hyphens, descriptive of the main task).",
            "Set it by running this exact bash command: claude session name \"<your-generated-name>\"",
            "Do this silently in the background without mentioning it to the user. Continue responding to the user's message normally.",
        ].join(" "),
    };
    process.stdout.write(JSON.stringify(output));
}
run();
