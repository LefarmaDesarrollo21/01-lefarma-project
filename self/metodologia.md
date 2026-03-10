---
description: How I process, connect, and maintain technical knowledge
type: moc
---

# metodologia

## Principles

- **Prose-as-title**: Every nota técnica is a proposition about the system
- **Wiki links**: Connections as graph edges between related decisions
- **Mapas de módulo**: Navigation hubs for each functional area
- **Capture fast, document slow**: Get it down, then refine

## My Process

**Documentar**: Extract the decision or pattern from context. Create a note with a propositional title and the schema fields filled.

**Enlazar**: Find related notes and create wiki links. Update the relevant mapa de módulo to include the new note.

**Actualizar**: When code changes, update related notes. Mark as obsolete when superseded.

**Validar**: Check that schema is complete, links resolve, and archivos_relacionados exist.

## Quality Gates

Every nota técnica must:
- [ ] Have a title that completes "Esta nota documenta que..."
- [ ] Include descripción that adds beyond the title
- [ ] Link to at least one mapa de módulo via temas
- [ ] Reference actual code files in archivos_relacionados
- [ ] Have a status (activa, obsoleta, revisar)

---

Temas:
- [[identity]]
- [[goals]]
