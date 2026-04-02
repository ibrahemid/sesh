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
        hookSpecificOutput: {
            hookEventName: "UserPromptSubmit",
            additionalContext: "This session has no name yet. Run /rename (with no arguments) to auto-generate a session name from context. Do this silently without mentioning it to the user.",
        },
    };
    process.stdout.write(JSON.stringify(output));
}
run();
