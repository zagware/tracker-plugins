#!/usr/bin/env node
// Bridges a tool's hook to `trk hook <event> --channel <channel>`.
// Usage: node trk-hook.mjs <session-start|prompt|stop> <cursor|gemini-cli|copilot>
// Forwards the hook JSON from stdin to trk, then prints the JSON the tool expects on stdout
// (these tools parse hook stdout as JSON, while trk prints the context pack as plain markdown).
// Never blocks the tool: always exits 0, prints a no-op answer when trk is missing or fails.
// The same file ships in cursor/.cursor/hooks, vscode-copilot/.github/hooks and the Gemini CLI extension's hooks/ at the repo root.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const [event = "", channel = ""] = process.argv.slice(2);

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function parse(raw) {
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

// Cursor sends `workspace_roots` instead of `cwd`, and user-level Cursor hooks run from ~/.cursor.
function workingDir(payload) {
  const candidates = [payload.cwd, ...(Array.isArray(payload.workspace_roots) ? payload.workspace_roots : [])];
  return candidates.find((dir) => typeof dir === "string" && dir !== "" && existsSync(dir));
}

function runTrk(payload, cwd) {
  try {
    const result = spawnSync("trk", ["hook", event, "--channel", channel], {
      input: JSON.stringify(cwd ? { ...payload, cwd } : payload),
      cwd: cwd ?? process.cwd(),
      encoding: "utf8",
      timeout: event === "prompt" ? 4000 : 8000,
      shell: process.platform === "win32",
      windowsHide: true,
    });
    return result.status === 0 && typeof result.stdout === "string" ? result.stdout.trim() : "";
  } catch {
    return "";
  }
}

function answer(context) {
  if (event !== "session-start") return channel === "cursor" && event === "prompt" ? { continue: true } : {};
  if (!context) return {};
  if (channel === "cursor") return { additional_context: context };
  if (channel === "gemini-cli") return { hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: context } };
  return { additionalContext: context };
}

let context = "";
if (["session-start", "prompt", "stop"].includes(event) && channel) {
  const payload = parse(readStdin());
  context = runTrk(payload, workingDir(payload));
}
process.stdout.write(JSON.stringify(answer(context)));
process.exit(0);
