# Tracker for Claude Code

A Claude Code plugin, listed in the `zagware-tracker` marketplace at the root of this repo.

## Install

```sh
claude plugin marketplace add zagware/tracker-plugins && claude plugin install tracker@zagware-tracker
```

Or inside Claude Code: `/plugin marketplace add zagware/tracker-plugins`, then `/plugin install tracker@zagware-tracker`. Update later with `claude plugin marketplace update zagware-tracker`. To try it for one session without installing, clone this repo and run `claude --plugin-dir ./tracker-plugins/claude-code`.

## What it wires

| File | Does |
|---|---|
| `.mcp.json` | Remote MCP server `tracker` → `https://tracker.zagware.io/mcp` (Streamable HTTP) |
| `hooks/hooks.json` | `SessionStart` → `trk hook session-start --channel claude-code` (its stdout, the bound context pack and its receipt, becomes context) · `UserPromptSubmit` → `trk hook prompt --channel claude-code` (records your prompt verbatim as an Input) · `Stop` → `trk hook stop --channel claude-code` (marks the bound work item active once work starts) · `SessionEnd` → `trk hook session-end --channel claude-code` (records the SHA-256 of `transcript_path` as a claimed transcript digest) |
| `skills/tracker/SKILL.md` | When to ask vs decide, fetch context first, WRK ids and the `Agent: Claude` trailer in commits |
| `.claude-plugin/plugin.json` | Plugin manifest (the marketplace is `../.claude-plugin/marketplace.json`) |

## Auth

- **OAuth (default).** Run `/mcp` in Claude Code, pick `tracker`, sign in. Claude Code registers itself with the server through dynamic client registration.
- **API token.** In <https://tracker.zagware.io/settings/agents>, add the agent `Claude Code` and issue it a token, export it as `TRACKER_TOKEN`, and add the server with a header instead of using OAuth:

  ```sh
  claude mcp add --transport http tracker https://tracker.zagware.io/mcp --header "Authorization: Bearer $TRACKER_TOKEN"
  ```

## Claude Code's own identity

Run `trk login --agent claude-code` once per machine: `trk` commands Claude Code runs then record as **Claude Code** (verified). To have its commits prove they are Claude Code's, run `trk agent-key claude-code`, register the printed public key under Settings → Agents, and put the printed `env` block in the repo's `.claude/settings.local.json`: git in Claude Code then signs its commits with that key, and yours stay as they are.

## Hooks need `trk`

The hooks call the `trk` CLI and do nothing until it is set up. Once per machine: `npm i -g https://tracker.zagware.io/downloads/trk.tgz` and `trk login`. In each repo: `trk use <project> [WRK-n]`. Without `trk` on `PATH` the hooks exit 0 silently; they never block Claude Code.

## Develop

```sh
claude plugin validate .                                   # marketplace manifest (repo root)
claude plugin validate claude-code/.claude-plugin/plugin.json   # plugin manifest
```

Docs: [plugins](https://code.claude.com/docs/en/plugins/create), [plugin manifest](https://code.claude.com/docs/en/plugins/manifest-reference), [marketplaces](https://code.claude.com/docs/en/plugins/marketplace-reference), [hooks](https://code.claude.com/docs/en/hooks), [MCP](https://code.claude.com/docs/en/mcp).
