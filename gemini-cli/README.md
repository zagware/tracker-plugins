# Tracker for Gemini CLI

A Gemini CLI extension named `tracker`: MCP server, context file, and hooks. Gemini CLI installs extensions only from a repository root, so the extension's files live at the root of this repo (`gemini-extension.json`, `GEMINI.md`, `hooks/`); this folder only holds its documentation.

## Install

```sh
gemini extensions install https://github.com/zagware/tracker-plugins
```

Update with `gemini extensions update tracker`. Restart Gemini CLI afterwards.

## What it wires

| File | Does |
|---|---|
| `../gemini-extension.json` | Remote MCP server `tracker` → `httpUrl: https://tracker.zagware.io/mcp` (Streamable HTTP); loads `GEMINI.md` |
| `../GEMINI.md` | Tracker rules: fetch context first, ask vs decide, never act as the human, WRK ids and `Agent: Gemini` trailer |
| `../hooks/hooks.json` | `SessionStart` → `trk hook session-start --channel gemini-cli` (context pack returned as `hookSpecificOutput.additionalContext`) · `BeforeAgent` → `trk hook prompt --channel gemini-cli` (records your prompt verbatim) · `AfterAgent` → `trk hook stop --channel gemini-cli` · `SessionEnd` → `trk hook session-end --channel gemini-cli` (records the SHA-256 of `transcript_path` as a claimed transcript digest; nothing when Gemini sends an empty path) |
| `../hooks/trk-hook.mjs` | Bridge the hooks run with `node`: forwards Gemini's hook JSON to `trk` and prints the JSON Gemini requires on stdout. Always exits 0 |

## Auth

- **OAuth (default).** Gemini CLI discovers the server's OAuth metadata and registers itself (dynamic client registration). If it does not prompt, run `/mcp auth tracker`.
- **API token.** Create an agent token at <https://tracker.zagware.io/settings/agents>, export it as `TRACKER_TOKEN`, and add the server in your settings with a header instead (it takes precedence over the extension's entry):

  ```sh
  gemini mcp add --transport http --header "Authorization: Bearer $TRACKER_TOKEN" tracker https://tracker.zagware.io/mcp
  ```

## Hooks need `trk`

The hooks need `node` and the `trk` CLI on `PATH`: `npm i -g https://tracker.zagware.io/downloads/trk.tgz`, then `trk login` once per machine and `trk use <project> [WRK-n]` in the repo. Without them the hooks answer `{}` and never block Gemini CLI.

Docs: [extensions](https://geminicli.com/docs/extensions/reference), [hooks](https://geminicli.com/docs/hooks/reference), [MCP servers](https://geminicli.com/docs/tools/mcp-server).
