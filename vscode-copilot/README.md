# Tracker for VS Code (GitHub Copilot)

Project files to copy into your repository: MCP server, Copilot instructions, and agent hooks.

## Install

These files are copied into each repository. Clone this repo once, then from your repository root (`-n` keeps files you already have — merge those by hand):

```sh
git clone --depth 1 https://github.com/zagware/tracker-plugins ~/.tracker-plugins   # once; `git -C ~/.tracker-plugins pull` to update
cp -Rn ~/.tracker-plugins/vscode-copilot/.vscode ~/.tracker-plugins/vscode-copilot/.github .
```

MCP server only, user-wide: `code --add-mcp '{"name":"tracker","type":"http","url":"https://tracker.zagware.io/mcp"}'`.

## What it wires

| File | Does |
|---|---|
| `.vscode/mcp.json` | MCP server `tracker`, `type: "http"` → `https://tracker.zagware.io/mcp` (Streamable HTTP) |
| `.github/copilot-instructions.md` | Tracker rules: fetch context first, ask vs decide, never act as the human, WRK ids and `Agent: Copilot` trailer |
| `.github/hooks/tracker.json` | Copilot agent hooks (Preview), declared with the VS Code-compatible event names so payloads use `session_id`/`prompt`: `SessionStart` → `trk hook session-start --channel copilot` (context pack returned as `additionalContext`) · `UserPromptSubmit` → `trk hook prompt --channel copilot` (records your prompt verbatim) · `Stop` → `trk hook stop --channel copilot` |
| `.github/hooks/trk-hook.mjs` | Bridge the hooks run with `node`: forwards the hook JSON to `trk` and prints the JSON Copilot parses on stdout. Always exits 0 |

The hooks apply to sessions on the **Copilot** session target (VS Code, Copilot CLI and the Copilot app share this hook format). Copilot cloud agent also reads `.github/hooks/`, but has no `trk` login, so the hooks no-op there.

## Auth

- **OAuth (default).** VS Code discovers the server's OAuth metadata and registers itself (dynamic client registration); start the server from `.vscode/mcp.json` or the MCP view and sign in when prompted.
- **API token.** Create an agent token at <https://tracker.zagware.io/settings/agents>, export it as `TRACKER_TOKEN` in the environment VS Code runs in, and add a header (use `${env:…}`, not an `${input:…}` prompt: Copilot harness sessions drop servers that need interactive input):

  ```json
  {
    "servers": {
      "tracker": {
        "type": "http",
        "url": "https://tracker.zagware.io/mcp",
        "headers": { "Authorization": "Bearer ${env:TRACKER_TOKEN}" }
      }
    }
  }
  ```

## Hooks need `trk`

The hooks need `node` and the `trk` CLI on `PATH`: `npm i -g https://tracker.zagware.io/downloads/trk.tgz`, then `trk login` once per machine and `trk use <project> [WRK-n]` in the repo. Without them the hooks answer `{}` and never block Copilot.

Docs: [MCP servers in VS Code](https://code.visualstudio.com/docs/agent-customization/mcp-servers), [MCP configuration](https://code.visualstudio.com/docs/agents/reference/mcp-configuration), [custom instructions](https://code.visualstudio.com/docs/agent-customization/custom-instructions), [hooks in VS Code](https://code.visualstudio.com/docs/agent-customization/hooks), [Copilot hooks reference](https://docs.github.com/en/copilot/reference/hooks-reference).
