---
description: Common issues and resolution patterns
type: manual
generated_from: "arscontexta-1.0.0"
---
# Troubleshooting

## Orphan Notas Técnicas

**Problem**: Notes with no incoming wiki links — they'll never be found.

**Detection**: /validar or /estadisticas shows orphan count.

**Solution**:
1. Find the relevant mapa de módulo
2. Add the note to its topics list
3. Create links from related notes

**Prevention**: Always add notes to at least one mapa de módulo when creating.

## Dangling Links

**Problem**: Wiki links to notes that don't exist.

**Detection**: /validar checks link resolution.

**Solution**:
- Create the missing note, or
- Fix the link to point to correct title, or
- Remove the link if no longer relevant

## Stale Content

**Problem**: Documentation describes code that no longer exists.

**Detection**: Notes with estado:obsoleta or archivos_relacionados that don't exist.

**Solution**:
```
/actualizar "Nombre de nota obsoleta"
```

Or manually update estado to obsoleta and add note about what replaced it.

## Schema Drift

**Problem**: Notes missing required fields or using wrong values.

**Detection**: /validar shows schema violations.

**Common issues**:
- Missing `modulo` field
- `estado` not in [activa, obsoleta, revisar]
- `archivos_relacionados` pointing to non-existent files

**Solution**: Update notes to match template schema.

## Inbox Overflow

**Problem**: Too many unprocessed items in inbox/.

**Warning signs**: inbox/ has >10 files.

**Solution**:
1. Stop adding new items
2. Process existing items through /documentar
3. Move or delete items you won't process

## Link Rot in Code References

**Problem**: `archivos_relacionados` points to files that moved.

**Detection**: /validar checks file existence.

**Solution**: Update paths in affected notes. Consider creating redirect notes if old path was widely referenced.

## Methodology Drift

**Problem**: System behavior diverging from documented methodology.

**Detection**: Agent creates notes differently than specified in CLAUDE.md.

**Solution**:
1. /recordar the specific drift
2. /revisar to review accumulated drift
3. Either update CLAUDE.md or correct agent behavior

## Pipeline Stalls

**Problem**: Tasks stuck in queue without processing.

**Detection**: ops/queue/ shows old pending items.

**Solution**:
```
/siguiente  # See what should be processed
# Or manually process stuck items
```

## Quick Fixes Table

| Issue | Quick Check | Quick Fix |
|-------|-------------|-----------|
| Can't find a note | `rg "keyword" notas-tecnicas/` | Check MOCs or use /estadisticas |
| Broken wiki link | `rg "\[\[title\]\]" notas-tecnicas/` | Create note or fix link |
| Obsolete doc | Check `estado:` field | Update or mark obsoleta |
| Schema issue | `rg "^modulo:" notas-tecnicas/*.md` | Add missing field |
| Lost context | Read self/goals.md | Claude re-orients |
