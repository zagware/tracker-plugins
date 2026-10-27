---
name: tracker
description: Rules for working with Tracker (tracker.zagware.io), the record of human intent, agent questions and decisions, work and changes. Use whenever a Tracker context pack is loaded, a WRK/INT/QST/DEC/INP id is mentioned, the `tracker` MCP tools are available, or before committing in a repo bound with `trk use`.
---

# Working with Tracker

Tracker records what humans want, what agents asked and decided (with origin), the work, and the changes that shipped it. The `tracker` MCP server is your interface; `trk` is the same from the shell.

## Before you start

- Fetch the context pack first: `get_context {project, id}` for the work item (or `trk context <id>`). If the session opened with a Tracker context pack, that is it. It holds everything binding on the work. Each pack comes with a receipt (`RCP-n`): pass `contextReceipts: ["RCP-n"]` on every write you make with it, and add a `Tracker-Context: RCP-n` trailer to your commits.
- Human words — intent statements, answers, captured inputs (`INP-n`) — are verbatim and binding. Your restatement never overrides them. A decision a human overrode is not binding; follow its review note.

## Ask or decide

- A gap you will not fill alone → `raise_question` with `options` (`key`, `label`, `consequence`), a `recommendation`, and `blocking` when work cannot continue. Never guess past a blocking question: stop that part and wait or work on something else.
- A choice you make without asking → `record_decision` with origin `"autonomous"`. If it follows directly from human words, origin `"inferred"` with `derivedFrom` citing them (`INT-n`, `DEC-n`, or `INP-n`).
- Never create intents, answer questions, review decisions, record human decisions, or capture input. Those are the human's.

## As you work

- `update_work` the item's status as you go: `active` when you start, `blocked` with a question, `review` or `done` at the end.
- New work you discover → `propose_work`; a bug or incident → `report_issue`.

## Commits

Put the WRK ids in the commit message and end agent commits with an `Agent:` trailer:

```sh
git commit -m "WRK-12: retry webhook delivery" --trailer "Agent: omp"
```
