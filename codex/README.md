# Tracker for Codex

Project files for your repository: MCP server config, `AGENTS.md` instructions, and lifecycle hooks.

## Install

These files are copied into each repository. Clone this repo once, then from your repository root (`-n` keeps files you already have — merge those by hand):

```sh
git clone --depth 1 https://github.com/zagware/tracker-plugins ~/.tracker-plugins   # once; `git -C ~/.tracker-plugins pull` to update
cp -Rn ~/.tracker-plugins/codex/.codex . && cat ~/.tracker-plugins/codex/AGENTS.md >> AGENTS.md && codex mcp login tracker
```

Project `.codex/` config and hooks load only in a trusted project. MCP server only, user-wide: `codex mcp add tracker --url https://tracker.zagware.io/mcp && codex mcp login tracker`.

## What it wires

| File | Does |
|---|---|
| `.codex/config.toml` | `[mcp_servers.tracker]` → `url = "https://tracker.zagware.io/mcp"` (Streamable HTTP) |
| `AGENTS.md` | Tracker section: fetch context first, ask vs decide, never act as the human, WRK ids and `Agent: Codex` trailer |
| `.codex/hooks.json` | `SessionStart` → `trk hook session-start --channel codex` (plain stdout becomes developer context) · `UserPromptSubmit` → `trk hook prompt --channel codex` (records your prompt verbatim) · `Stop` → `trk hook stop --channel codex` (prints `{}`, the no-op answer `Stop` requires) |

Codex asks you to review and trust new hooks before they run: open `/hooks` after copying.

## Auth

- **OAuth (default).** `codex mcp login tracker` opens the browser; Codex registers itself with the server (dynamic client registration).
- **API token.** Create an agent token at <https://tracker.zagware.io/settings/agents>, export it as `TRACKER_TOKEN`, and uncomment `bearer_token_env_var = "TRACKER_TOKEN"` in `.codex/config.toml`.

## Hooks need `trk`

`npm i -g https://tracker.zagware.io/downloads/trk.tgz`, then `trk login` once per machine and `trk use <project> [WRK-n]` in the repo. Without `trk` on `PATH` the hooks exit 0 silently; they never block Codex.

Docs: [MCP](https://developers.openai.com/codex/mcp), [hooks](https://developers.openai.com/codex/hooks), [config reference](https://developers.openai.com/codex/config-reference), [AGENTS.md](https://developers.openai.com/codex/guides/agents-md).
