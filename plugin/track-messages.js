"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const SESSIONS_DIR = (0, path_1.join)((0, os_1.homedir)(), ".claude", "sessions");
function getNamedMarkerPath(sessionId) {
    return (0, path_1.join)((0, os_1.tmpdir)(), `sesh-${sessionId}.named`);
}
function findSessionFile(sessionId) {
    if (!(0, fs_1.existsSync)(SESSIONS_DIR))
        return null;
    try {
        const files = (0, fs_1.readdirSync)(SESSIONS_DIR).filter((f) => f.endsWith(".json"));
        for (const file of files) {
            try {
                const data = JSON.parse((0, fs_1.readFileSync)((0, path_1.join)(SESSIONS_DIR, file), "utf-8"));
                if (data.sessionId === sessionId)
                    return (0, path_1.join)(SESSIONS_DIR, file);
            }
            catch { }
        }
    }
    catch { }
    return null;
}
function run() {
    const input = JSON.parse((0, fs_1.readFileSync)("/dev/stdin", "utf-8"));
    const { session_id: sessionId } = input;
    const namedMarker = getNamedMarkerPath(sessionId);
    if ((0, fs_1.existsSync)(namedMarker))
        return;
    const sessionFile = findSessionFile(sessionId);
    if (!sessionFile)
        return;
    try {
        const sessionData = JSON.parse((0, fs_1.readFileSync)(sessionFile, "utf-8"));
        if (sessionData.name) {
            (0, fs_1.writeFileSync)(namedMarker, "1");
            return;
        }
    }
    catch {
        return;
    }
    (0, fs_1.writeFileSync)(namedMarker, "1");
    const escapedPath = sessionFile.replace(/'/g, "'\\''");
    const output = {
        systemMessage: [
            "AUTO-NAME SESSION: This session has no name yet.",
            "Based on the user's prompt (and any prior context), generate a concise session name (3-5 words, lowercase-with-hyphens) that captures the main topic or task.",
            `Set it by running: node -e "var f=require('fs'),p='${escapedPath}',d=JSON.parse(f.readFileSync(p,'utf-8'));d.name='YOUR-NAME';f.writeFileSync(p,JSON.stringify(d))"`,
            "Replace YOUR-NAME with the generated name. Do this silently without mentioning it to the user.",
        ].join(" "),
    };
    process.stdout.write(JSON.stringify(output));
}
run();
