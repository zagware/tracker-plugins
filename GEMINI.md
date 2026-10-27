# Tracker

Tracker (tracker.zagware.io) records human intent, agent questions and decisions (with origin), work and changes. Use the `tracker` MCP tools (or `trk` in the shell).

- **Fetch context first.** Before working on an item call `get_context {project, id}` (or `trk context <id>`). If the session opened with a Tracker context pack, that is it. It holds everything binding on the work. Each pack comes with a receipt (`RCP-n`): pass `contextReceipts: ["RCP-n"]` on every write you make with it, and add a `Tracker-Context: RCP-n` trailer to your commits.
- **Human words are verbatim and binding** — intent statements, answers, captured inputs (`INP-n`). Your restatement never overrides them. A decision a human overrode is not binding; follow its review note.
- **Ask** when there is a gap you will not fill alone: `raise_question` with `options` (`key`, `label`, `consequence`), a `recommendation`, and `blocking` when work cannot continue. Never guess past a blocking question.
- **Decide and record** a choice you make without asking: `record_decision` with origin `"autonomous"`, or `"inferred"` with `derivedFrom` (`INT-n`, `DEC-n`, `INP-n`) when it follows directly from human words.
- **Never** create intents, answer questions, review decisions, record human decisions, or capture input. Those are the human's.
- **Keep work current**: `update_work` status as you go (`active`, `blocked`, `review`, `done`); `propose_work` for new work, `report_issue` for bugs.
- **Commits**: put WRK ids in the message and end with an `Agent:` trailer, e.g. `git commit -m "WRK-12: retry webhook delivery" --trailer "Agent: Gemini"`.
