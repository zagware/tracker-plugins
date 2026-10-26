# Tracker plugins

Connect your coding agent to [Tracker](https://tracker.zagware.io), the record
of what humans asked for, what agents asked back, what agents decided on their
own, and what got built and shipped.

With a plugin installed, your agent:

- **starts every session with context:** the work item, your original words, the decisions that bind it, and any open questions;
- **asks instead of guessing:** gaps it won't fill alone become questions in your Tracker inbox;
- **records what it decided on its own**, so you can review, accept or override it;
- **captures your prompts word for word**, so later decisions can point at what you actually said.

## Quickstart

1. **Sign in** at <https://tracker.zagware.io> with GitHub. To track your own repos, install the Tracker GitHub App from **Settings → GitHub**.
2. **Install the CLI** that the hooks use (Node 24.22.1 or later):
   ```sh
   npm i -g https://tracker.zagware.io/downloads/trk.tgz
   trk login            # continue in the browser only if the code matches your terminal
   ```
3. **Install the plugin for your tool** (table below).
4. **Bind the repo** you're working in to a project, and optionally to a work item:
   ```sh
   trk use <project> [WRK-n]
   ```
5. **Start a session.** The agent receives the context pack, and your prompts appear as human input on the work item in Tracker.

## Install

| Tool | Install | Hooks |
|---|---|---|
| [Claude Code](claude-code/) | `claude plugin marketplace add zagware/tracker-plugins && claude plugin install tracker@zagware-tracker` | SessionStart, UserPromptSubmit, Stop |
| [omp](omp/) | `omp plugin marketplace add zagware/tracker-plugins && omp plugin install tracker@zagware-tracker` | Extension: `session_start`, `input`, `session_stop` |
| [Gemini CLI](gemini-cli/) | `gemini extensions install https://github.com/zagware/tracker-plugins` | SessionStart, BeforeAgent, AfterAgent |
| [Cursor](cursor/) | clone once, then in your repo `cp -Rn ~/.tracker-plugins/cursor/.cursor .` | sessionStart, beforeSubmitPrompt, stop |
| [Codex](codex/) | clone once, then in your repo `cp -Rn ~/.tracker-plugins/codex/.codex . && cat ~/.tracker-plugins/codex/AGENTS.md >> AGENTS.md && codex mcp login tracker` | SessionStart, UserPromptSubmit, Stop |
| [VS Code + Copilot](vscode-copilot/) | clone once, then in your repo `cp -Rn ~/.tracker-plugins/vscode-copilot/.vscode ~/.tracker-plugins/vscode-copilot/.github .` | SessionStart, UserPromptSubmit, Stop (Copilot hooks, Preview) |

"Clone once" means `git clone --depth 1 https://github.com/zagware/tracker-plugins ~/.tracker-plugins`.
Cursor, Codex and Copilot read their configuration from each repository, so those files are copied rather than installed.

## Auth

- **OAuth (default).** Every tool above supports remote MCP sign-in. The server URL `https://tracker.zagware.io/mcp` is all it needs; you approve the agent once in the browser. Revoke it in **Settings → Agents**.
- **API token.** Create an *agent* token in **Settings → Agents**, export it as `TRACKER_TOKEN`, and send `Authorization: Bearer $TRACKER_TOKEN`. Each tool's README shows where the header goes.

## How the hooks behave

| Hook | Runs | Effect |
|---|---|---|
| session start | `trk hook session-start --channel <tool>` | Prints the bound context pack; the tool adds it to the conversation |
| prompt submit | `trk hook prompt --channel <tool>` | Records your prompt verbatim as human input (`INP-n`), marked *unverified* because it came from a local tool |
| stop | `trk hook stop --channel <tool>` | Marks the bound work item active if it was still proposed or ready; otherwise writes nothing |

Hooks always exit 0 and never block the tool. A repo that isn't bound gets
nothing. Bindings are stored in `~/.config/trk/bindings.json`, never in the
repository, so a repo you clone can't redirect where your prompts go. Cursor,
Gemini CLI and Copilot read hook output as JSON, so their packages run hooks
through a small `trk-hook.mjs` bridge, which needs `node`.

## What agents may and may not do

Agents can raise questions, record decisions they made themselves (origin
`autonomous`, or `inferred` with a pointer to your words), propose and update
work, and record changes and issues. They cannot answer questions, review
decisions, create intents, or record decisions as yours: those need you,
signed in to Tracker in a browser. The CLI token can read, capture your prompts
and update work. Nothing more.

## License

[MIT](LICENSE): use, copy and modify these files freely, including in
commercial and closed-source repos. The Tracker service they connect to is
not open source.

---

This repository is generated from `integrations/` in the Tracker source on
every release, so pull requests are not merged here. Report problems as
issues, and security problems privately (see [SECURITY.md](SECURITY.md)).
