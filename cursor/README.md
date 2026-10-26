# Tracker for Cursor

Project files to copy into your repository: MCP server, an always-applied rule, and agent hooks.

## Install

These files are copied into each repository. Clone this repo once, then from your repository root (`-n` keeps files you already have — merge those by hand):

```sh
git clone --depth 1 https://github.com/zagware/tracker-plugins ~/.tracker-plugins   # once; `git -C ~/.tracker-plugins pull` to update
cp -Rn ~/.tracker-plugins/cursor/.cursor .
```

MCP server only, user-wide: open `cursor://anysphere.cursor-deeplink/mcp/install?name=tracker&config=eyJ1cmwiOiJodHRwczovL3RyYWNrZXIuemFnd2FyZS5pby9tY3AifQ==` (config = `{"url":"https://tracker.zagware.io/mcp"}`).

## What it wires

| File | Does |
|---|---|
| `.cursor/mcp.json` | Remote MCP server `tracker` → `https://tracker.zagware.io/mcp` (Streamable HTTP) |
| `.cursor/rules/tracker.mdc` | Always-applied rule: fetch context first, ask vs decide, never act as the human, WRK ids and `Agent: Cursor` trailer |
| `.cursor/hooks.json` | `sessionStart` → `trk hook session-start --channel cursor` (context pack returned as `additional_context`) · `beforeSubmitPrompt` → `trk hook prompt --channel cursor` (records your prompt verbatim; always answers `{"continue": true}`) · `stop` → `trk hook stop --channel cursor` |
| `.cursor/hooks/trk-hook.mjs` | Bridge the hooks run with `node`: forwards Cursor's hook JSON to `trk` (adding `cwd` from `workspace_roots`) and turns its output into the JSON Cursor expects. Always exits 0 |

## Auth

- **OAuth (default).** Cursor discovers the server's OAuth metadata and registers itself (dynamic client registration); click **Connect** next to `tracker` in Settings → MCP.
- **API token.** Create an agent token at <https://tracker.zagware.io/settings/agents>, export `TRACKER_TOKEN` in your shell profile, and add a header to the server entry:

  ```json
  { "mcpServers": { "tracker": { "url": "https://tracker.zagware.io/mcp", "headers": { "Authorization": "Bearer ${env:TRACKER_TOKEN}" } } } }
  ```

## Hooks need `trk`

The hooks need `node` and the `trk` CLI on `PATH`: `npm i -g https://tracker.zagware.io/downloads/trk.tgz`, then `trk login` once per machine and `trk use <project> [WRK-n]` in the repo. Without them the hooks answer with a no-op and never block Cursor. Project hooks run only in a trusted workspace.

Docs: [MCP](https://cursor.com/docs/mcp), [rules](https://cursor.com/docs/rules), [hooks](https://cursor.com/docs/hooks).
