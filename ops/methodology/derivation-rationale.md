---
description: Why each configuration dimension was chosen — the reasoning behind initial system setup
category: derivation-rationale
created: 2026-03-10
status: active
---
# derivation rationale for Lefarma technical documentation

## Domain Context
The user is working on Lefarma, a pharmaceutical company management system with .NET 10 backend and React/TypeScript frontend. They want to track technical documentation — architecture decisions, code patterns, and the meaning behind implementation choices.

## Conversation Signals

**Primary signals:**
1. "documentacion tecnica en este proyecto" → Technical documentation domain
2. "varias veces por semana" → Moderate volume, sustainable pace
3. "el objetivo es para mi y para ti. saber siempre en que andamos" → Shared context between user and agent is primary goal
4. "mantener todo junto" → Flat organization preferred
5. "notas técnicas" → Domain-native vocabulary for the notes

## Dimension Decisions

### Granularity: Moderate
Rationale: Technical documentation works best at the decision/pattern level. Atomic granularity (one claim per note) would over-decompose — "we use Repository Pattern" and "we use Dependency Injection" are naturally part of the same architectural decision. Coarse granularity would mix too many concepts.

### Organization: Flat
Rationale: User explicitly stated "mantener todo junto." No separation between backend/frontend. Module-based MOCs (Catálogos, Auth, API, etc.) provide organization without folder silos that would prevent cross-cutting documentation.

### Linking: Explicit
Rationale: At moderate volume with clear module boundaries, explicit wiki links suffice. The user didn't mention cross-vocabulary discovery needs that would require semantic search.

### Processing: Moderate
Rationale: "Varias veces por semana" suggests a sustainable rhythm. Not heavy academic extraction, but more than simple capture — the goal is to connect documentation with actual code (archivos_relacionados field).

### Navigation: 2-tier
Rationale: Hub → Module MOCs → Notes. With expected volume of 20-50 notes over coming months, deeper hierarchy would be unnecessary overhead.

### Self-space: Enabled
Rationale: Critical for this use case. The explicit goal is "saber siempre en que andamos" — the agent needs persistent memory of current state across sessions. self/goals.md is the orientation anchor.

### Schema: Moderate
Rationale: Technical documentation benefits from structure: module, archivos_relacionados, estado, decision_alternativa. Not minimal (would lose code connection) and not dense (would slow capture).

### Personality: Warm, casual
Rationale: Conversation in Spanish with casual tone ("para ti y para ti"). Technical domains default to neutral, but the relationship signal (collaborative, personal) overrides to warm.

## Platform Configuration

Claude Code platform detected → Full automation tier available.
- Skills: Generated in .claude/skills/
- Hooks: Configured in .claude/hooks/
- Context: CLAUDE.md

## Coherence Validation

All hard constraints passed:
- No atomic + shallow navigation conflict
- Platform supports full automation
- Processing intensity matches automation level

Soft constraints:
- Moderate processing + moderate granularity → good fit
- Moderate schema + full automation → validation will catch drift

## Vocabulary Mapping

| Universal | Domain Term |
|-----------|-------------|
| notes | notas-tecnicas |
| note | nota técnica |
| reduce | documentar |
| reflect | enlazar con código |
| MOC | mapa de módulo |

This mapping ensures the system feels native to the technical domain rather than imported from academic research traditions.

---

Temas:
- [[methodology]]
