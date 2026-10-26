# Tracker for omp

An omp plugin package: MCP server, the `tracker` skill, and an extension wiring the session lifecycle to `trk`.

## Install

```sh
omp plugin marketplace add zagware/tracker-plugins && omp plugin install tracker@zagware-tracker
```

Or inside omp: `/marketplace add zagware/tracker-plugins`, then `/marketplace install tracker@zagware-tracker`. The catalog is `.omp-plugin/marketplace.json` at the root of this repo; update with `omp plugin marketplace update zagware-tracker`.

Restart omp afterwards (new extension modules load at session start). MCP server only: add `{"mcpServers":{"tracker":{"type":"http","url":"https://tracker.zagware.io/mcp"}}}` to `~/.omp/agent/mcp.json` (or a project's `.omp/mcp.json`).

## What it wires

| File | Does |
|---|---|
| `package.json` | Plugin manifest: package `@zagware/omp-tracker`, `omp.extensions` → `extensions/tracker-hooks.ts` |
| `mcp.json` | Remote MCP server `tracker`, `type: "http"` → `https://tracker.zagware.io/mcp` (Streamable HTTP) |
| `skills/tracker/SKILL.md` | When to ask vs decide, fetch context first, never act as the human, WRK ids and `Agent: omp` trailer |
| `extensions/tracker-hooks.ts` | `session_start` → `trk hook session-start --channel omp` (the context pack is added to the first prompt) · `input` → `trk hook prompt --channel omp` (records your prompt verbatim, without delaying it) · `session_stop` → `trk hook stop --channel omp`. Subagent sessions are skipped; handlers never throw |

omp has no shell-command hook files: its hooks are TypeScript extension modules, so the extension spawns `trk` itself and feeds it the same JSON shape as Claude Code's hooks (`session_id`, `cwd`, `hook_event_name`, `prompt`).

## Auth

- **OAuth (default).** omp runs the OAuth flow (dynamic client registration) when the server asks for it; to sign in again, `/mcp reauth tracker`.
- **API token.** Create an agent token at <https://tracker.zagware.io/settings/agents>, export it as `TRACKER_TOKEN`, and define the server in `~/.omp/agent/mcp.json` with a header (omp's own config wins over the plugin's):

  ```json
  { "mcpServers": { "tracker": { "type": "http", "url": "https://tracker.zagware.io/mcp", "headers": { "Authorization": "Bearer ${TRACKER_TOKEN}" } } } }
  ```

## Hooks need `trk`

`npm i -g https://tracker.zagware.io/downloads/trk.tgz`, then `trk login` once per machine and `trk use <project> [WRK-n]` in the repo. Without `trk` on `PATH` the extension does nothing.

Docs (inside omp): `omp://extensions.md`, `omp://plugin-manager-installer-plumbing.md`, `omp://mcp-config.md`, `omp://skills.md`.
