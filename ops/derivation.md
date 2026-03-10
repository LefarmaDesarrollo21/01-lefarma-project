---
description: How this knowledge system was derived -- enables architect and reseed commands
created: 2026-03-10
engine_version: "1.0.0"
---

# System Derivation

## Configuration Dimensions
| Dimension | Position | Conversation Signal | Confidence |
|-----------|----------|--------------------|--------------------|
| Granularity | moderate | "documentación técnica en este proyecto" -- notas por decisión/patrón, no claims atómicos | High |
| Organization | flat | "mantener todo junto" -- sin separación backend/frontend | High |
| Linking | explicit | Dominio técnico con conexiones al código | Medium |
| Processing | moderate | "varias veces por semana" -- ritmo sostenido, conexión con código existente | High |
| Navigation | 2-tier | Volumen moderado, MOCs por módulo funcional | Medium |
| Maintenance | condition-based | "para ti y para ti" -- contexto compartido que evoluciona | Medium |
| Schema | moderate | Campos técnicos: módulo, archivos relacionados, estado | High |
| Automation | full | Claude Code platform supports full automation | High |

## Personality Dimensions
| Dimension | Position | Signal |
|-----------|----------|--------|
| Warmth | warm | Comunicación casual en español, contexto colaborativo | Medium |
| Opinionatedness | neutral | Documentación técnica requiere neutralidad | default |
| Formality | casual | "el objetivo es para mi y para ti" -- tono cercano | Medium |
| Emotional Awareness | task-focused | Dominio técnico | default |

## Vocabulary Mapping
| Universal Term | Domain Term | Category |
|---------------|-------------|----------|
| notes | notas-tecnicas | folder |
| inbox | inbox | folder |
| archive | archive | folder |
| note (type) | nota técnica | note type |
| note_plural | notas técnicas | note type |
| reduce | documentar | process phase |
| reflect | enlazar con código | process phase |
| reweave | actualizar | process phase |
| verify | validar | process phase |
| MOC | mapa de módulo | navigation |
| description | descripción | schema field |
| topics | temas | schema field |
| relevant_notes | notas_relacionadas | schema field |
| modulos | Catálogos, Auth, API, Frontend, Infra | domain areas |

## Platform
- Tier: Claude Code
- Automation level: full
- Automation: full (default)

## Active Feature Blocks
- [x] wiki-links -- always included (kernel)
- [x] maintenance -- always included (always)
- [x] self-evolution -- always included (always)
- [x] session-rhythm -- always included (always)
- [x] templates -- always included (always)
- [x] ethical-guardrails -- always included (always)
- [x] processing-pipeline -- moderate processing
- [x] atomic-notes -- moderate granularity
- [x] mocs -- 2-tier navigation
- [x] personality -- warm, casual
- [x] self-space -- enabled (contexto compartido)

## Coherence Validation Results
- Hard constraints checked: 3. Violations: none
- Soft constraints checked: 7. Auto-adjusted: navigation depth adjusted for moderate volume. User-confirmed: none
- Compensating mechanisms active: semantic search (optional for vocabulary divergence)

## Failure Mode Risks
- Collector's Fallacy (medium) -- documentación técnica sin conexión al código
- Orphan Drift (medium) -- notas técnicas sin enlaces al sistema
- Temporal Staleness (HIGH) -- decisiones obsoletas cuando el código cambia
- Link Rot (medium) -- referencias a archivos que se mueven

## Generation Parameters
- Folder names: notas-tecnicas/, inbox/, archive/, self/, ops/, templates/
- Skills to generate: 16 -- vocabulary-transformed
- Hooks to generate: orient, capture, validate, commit
- Templates to create: nota-tecnica.md, mapa-modulo.md
- Topology: single-agent
