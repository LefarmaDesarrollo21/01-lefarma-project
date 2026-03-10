---
description: Complete reference for every available command
type: manual
generated_from: "arscontexta-1.0.0"
---
# Skills

## Processing Commands

### /documentar
Extract and document a technical decision or pattern.

**When to use**: After making a technical decision or discovering a pattern.

**Example**:
```
/documentar Decision de usar Repository Pattern para acceso a datos
```

### /enlazar
Find and create connections between notas técnicas.

**When to use**: When you have several notes that should relate to each other.

**Example**:
```
/enlazar "Repository Pattern" "Unit of Work"
```

### /actualizar
Update notes to reflect current code state.

**When to use**: When code changes and documentation becomes stale.

**Example**:
```
/actualizar estado:obsoleta for "Usamos Entity Framework 6"
```

### /validar
Verify notes against schema and check link health.

**When to use**: Before committing changes or during maintenance.

## Navigation Commands

### /estadisticas
Show vault metrics and progress.

**When to use**: To get an overview of documentation coverage.

### /siguiente
Get intelligent next-action recommendations.

**When to use**: When you don't know what to work on next.

## Meta-Skills

### /revisar
Review accumulated observations and tensions.

**When to use**: When ops/observations/ has >10 items or things feel off.

### /architect
Get research-backed configuration advice.

**When to use**: When considering system changes.

### /recordar
Capture operational friction and learnings.

**When to use**: Automatically triggered, but can be called manually.

## Onboarding

### /tutorial
Interactive walkthrough for new users.

**When to use**: First time using the system.

### /ayuda
See everything available.

**When to use**: Anytime you need a command reference.
