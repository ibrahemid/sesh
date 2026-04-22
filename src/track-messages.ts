import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { tmpdir, homedir } from "os";
import { join } from "path";

const SESSIONS_DIR = join(homedir(), ".claude", "sessions");

interface HookInput {
  session_id: string;
  transcript_path: string;
  user_prompt: string;
}

interface HookOutput {
  systemMessage: string;
}

function getNamedMarkerPath(sessionId: string): string {
  return join(tmpdir(), `sesh-${sessionId}.named`);
}

function findSessionFile(sessionId: string): string | null {
  if (!existsSync(SESSIONS_DIR)) return null;
  try {
    const files = readdirSync(SESSIONS_DIR).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const data = JSON.parse(
          readFileSync(join(SESSIONS_DIR, file), "utf-8")
        );
        if (data.sessionId === sessionId) return join(SESSIONS_DIR, file);
      } catch {}
    }
  } catch {}
  return null;
}

function run(): void {
  const input: HookInput = JSON.parse(readFileSync("/dev/stdin", "utf-8"));
  const { session_id: sessionId } = input;

  const namedMarker = getNamedMarkerPath(sessionId);
  if (existsSync(namedMarker)) return;

  const sessionFile = findSessionFile(sessionId);
  if (!sessionFile) return;

  try {
    const sessionData = JSON.parse(readFileSync(sessionFile, "utf-8"));
    if (sessionData.name) {
      writeFileSync(namedMarker, "1");
      return;
    }
  } catch {
    return;
  }

  writeFileSync(namedMarker, "1");

  const escapedPath = sessionFile.replace(/'/g, "'\\''");

  const output: HookOutput = {
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
