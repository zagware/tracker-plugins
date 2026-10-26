# Security

Please report vulnerabilities privately, not as public issues:
**Security → Report a vulnerability** on
<https://github.com/zagware/tracker-plugins/security/advisories/new>.

This covers the plugin files here and the service they connect to,
<https://tracker.zagware.io> (MCP server, API, `trk` CLI).

## How this repository is published

This repository is a snapshot mirror. Every commit is pushed by the Tracker
release process from the private source; pull requests are not merged here.
Changes are made upstream and arrive with the next release, so a commit that
did not come from that process is unexpected and worth reporting.

The plugins hold no credentials. Sign-in happens in your browser (OAuth), and
tokens stay on your machine under `~/.config/trk/` or in your tool's own MCP
credential store.
