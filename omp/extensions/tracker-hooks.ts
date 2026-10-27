// Wires omp's session lifecycle to the Tracker CLI (`trk hook <event> --channel omp`):
//   session_start    → `trk hook session-start` (its stdout, the bound context pack, is added before the first prompt)
//   input            → `trk hook prompt` (records the human's prompt verbatim as an Input)
//   session_stop     → `trk hook stop` (marks the bound work item active once work starts)
//   session_shutdown → `trk hook session-end` (reports the session file's SHA-256; Tracker records it as claimed)
// Every handler swallows its own errors and never blocks omp; without `trk` on PATH it does nothing.
// Subagent sessions are skipped: only the human-facing main session is recorded.
import { type ChildProcess, spawn } from "node:child_process";
import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

type HookEvent = "session-start" | "prompt" | "stop";

interface TrkPayload {
	session_id?: string;
	cwd: string;
	hook_event_name: string;
	prompt?: string;
	transcript_path?: string;
}

const TIMEOUT_MS: Record<HookEvent, number> = { "session-start": 10_000, prompt: 5_000, stop: 10_000 };

/** Runs `trk hook <event> --channel omp` with the payload on stdin; resolves to trimmed stdout, "" on any failure. */
function runTrk(event: HookEvent, payload: TrkPayload): Promise<string> {
	const { promise, resolve } = Promise.withResolvers<string>();
	let child: ChildProcess;
	try {
		child = spawn("trk", ["hook", event, "--channel", "omp"], {
			cwd: payload.cwd,
			stdio: ["pipe", "pipe", "ignore"],
			shell: process.platform === "win32",
			windowsHide: true,
		});
	} catch {
		return Promise.resolve("");
	}
	let stdout = "";
	const timer = setTimeout(() => {
		child.kill();
		resolve("");
	}, TIMEOUT_MS[event]);
	child.on("error", () => {
		clearTimeout(timer);
		resolve("");
	});
	child.on("close", code => {
		clearTimeout(timer);
		resolve(code === 0 ? stdout.trim() : "");
	});
	child.stdout?.on("data", chunk => {
		stdout += String(chunk);
	});
	child.stdin?.on("error", () => {});
	child.stdin?.end(JSON.stringify(payload));
	return promise;
}

/**
 * Runs `trk hook session-end` detached and forgets it: omp gives shutdown
 * handlers 2 s, hashing the transcript and posting may take longer, and the
 * child must outlive omp's exit.
 */
function reportTranscript(payload: TrkPayload): void {
	try {
		const child = spawn("trk", ["hook", "session-end", "--channel", "omp"], {
			cwd: payload.cwd,
			stdio: ["pipe", "ignore", "ignore"],
			detached: true,
			shell: process.platform === "win32",
			windowsHide: true,
		});
		child.on("error", () => {});
		child.stdin?.on("error", () => {});
		child.stdin?.end(JSON.stringify(payload));
		child.unref();
	} catch {
		// No trk: nothing to report.
	}
}

function sessionId(ctx: { sessionManager: unknown }): string | undefined {
	try {
		const manager = ctx.sessionManager as { getSessionId?: () => string | undefined };
		return manager.getSessionId?.();
	} catch {
		return undefined;
	}
}

/** The session's JSONL file; PI_SESSION_FILE (set in omp sessions) when the manager does not say. Empty means not persisted. */
function sessionFile(ctx: { sessionManager: unknown }): string | undefined {
	try {
		const manager = ctx.sessionManager as { getSessionFile?: () => string | undefined };
		return manager.getSessionFile?.() || process.env.PI_SESSION_FILE || undefined;
	} catch {
		return undefined;
	}
}

export default function trackerHooks(pi: ExtensionAPI): void {
	let contextPack: Promise<string> | undefined;

	pi.on("session_start", async (_event, ctx) => {
		if (ctx.agent?.kind === "sub") return;
		// Started here, awaited on the first prompt, so a slow network never delays startup.
		contextPack = runTrk("session-start", {
			session_id: sessionId(ctx),
			cwd: ctx.cwd,
			hook_event_name: "SessionStart",
		});
	});

	pi.on("input", async (event, ctx) => {
		if (ctx.agent?.kind === "sub" || !event.text?.trim()) return;
		// Not awaited: recording the prompt must not delay its submission. runTrk never rejects.
		void runTrk("prompt", {
			session_id: sessionId(ctx),
			cwd: ctx.cwd,
			hook_event_name: "UserPromptSubmit",
			prompt: event.text,
		});
	});

	pi.on("before_agent_start", async () => {
		if (!contextPack) return;
		const pending = contextPack;
		contextPack = undefined;
		const content = await pending;
		if (!content) return;
		return { message: { customType: "tracker-context", content, display: false, attribution: "agent" } };
	});

	pi.on("session_stop", async (_event, ctx) => {
		if (ctx.agent?.kind === "sub") return;
		await runTrk("stop", { session_id: sessionId(ctx), cwd: ctx.cwd, hook_event_name: "Stop" });
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		if (ctx.agent?.kind === "sub") return;
		const transcript = sessionFile(ctx);
		if (!transcript) return;
		reportTranscript({ session_id: sessionId(ctx), cwd: ctx.cwd, hook_event_name: "SessionEnd", transcript_path: transcript });
	});
}
