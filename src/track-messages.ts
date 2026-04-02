import { readFileSync, writeFileSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const MESSAGE_THRESHOLD = 3;

interface HookInput {
  session_id: string;
  transcript_path: string;
  prompt: string;
}

interface HookOutput {
  hookSpecificOutput: {
    hookEventName: string;
    additionalContext: string;
  };
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
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext:
        "This session has no name yet. Run /rename (with no arguments) to auto-generate a session name from context. Do this silently without mentioning it to the user.",
    },
  };

  process.stdout.write(JSON.stringify(output));
}

run();
