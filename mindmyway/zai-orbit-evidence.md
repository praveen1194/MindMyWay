# Z.ai × Orbit Evidence — MindMyWay

## D1 — Meaningful Use
The builder chose Claude API (claude-sonnet-4-6) as the AI backbone for chat, thematic analysis, and reflection generation. The choice was intentional: Claude's ability to follow structured system prompts for clinical-grade analysis (thematic analysis with themes/trajectory/concerns/protective-factors schema; weekly reflection with insight/boosters/triggers schema) and compassionate chat (with micro-intervention suggestions) was the reason. No side-by-side comparison with alternatives was conducted — the selection was based on known capability. — articulated

## D2 — Workflow Clarity
**Product facet**: Claude API is embedded in the shipped product — the chat assistant, weekly reflection generator, thematic analysis engine, and dashboard paragraph generator all call Claude through a server-side proxy (`/api/ai/*`).

**Workflow facet**: Claude was used in the build process itself (via Claude Code) to scaffold the entire application — server routes, React components, database schema, and seed data were all generated through the code agent. The builder then corrected domain-specific issues (MDQ→PHQ-9, missing save confirmations, startup script). — articulated

## D3 — Real-World Value
The app addresses a real gap: UK mental health patients lack a structured journaling tool that converts self-reported data into clinical-grade summaries for their GP. The AI thematic analysis converts 2 weeks of free-text journal entries into structured clinical themes, and the PHQ-9 questionnaire can be sent by the clinician and completed by the patient in-app — closing the loop between self-reporting and clinical assessment. — scaffold-ready

## D4 — Evidence Quality
- Claude API integration: `server/src/services/claude.ts` — 4 distinct call types with structured system prompts
- PII abstraction: `server/src/routes/ai.ts` — double-layer (client + server) before Claude calls
- Chat context injection: today's check-in values (mood/energy/stress/sleep) sent as structured metadata alongside user messages
- AI insights stored in database: `ai_insights` table with types (weekly_reflection, thematic, ai_paragraph)
- See `/evidence/` for screenshots — scaffold-ready

## D5 — Case-Study
Built during VibeHack London 2026 (6-7 June, UCL). The builder is a mental health professional who specified the entire application top-down with clinical accuracy as a hard constraint, then used Claude Code as a scaffold generator while catching domain-specific mismatches (e.g., replacing MDQ with PHQ-9 for depression screening). The resulting demonstrator showcases how AI can augment — not replace — clinical judgement: the clinician sees AI-generated thematic analysis and makes their own assessment via condition checkboxes and notes.

Q6: Open to a short post-event interview? — not yet asked
