import { readFileSync, writeFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const MESSAGE_THRESHOLD = 3;

interface HookInput {
  session_id: string;
  transcript_path: string;
  user_prompt: string;
}

interface HookOutput {
  systemMessage: string;
}

function getStatePath(sessionId: string, suffix: string): string {
  return join(tmpdir(), `sesh-${sessionId}.${suffix}`);
}

function readCount(counterPath: string): number {
  if (!existsSync(counterPath)) return 0;
  return parseInt(readFileSync(counterPath, "utf-8"), 10) || 0;
}

function run(): void {
  const input: HookInput = JSON.parse(readFileSync("/dev/stdin", "utf-8"));
  const { session_id: sessionId } = input;

  const namedPath = getStatePath(sessionId, "named");
  if (existsSync(namedPath)) return;

  const counterPath = getStatePath(sessionId, "count");
  const count = readCount(counterPath) + 1;
  writeFileSync(counterPath, String(count));

  if (count < MESSAGE_THRESHOLD) return;

  writeFileSync(namedPath, "1");

  const output: HookOutput = {
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
