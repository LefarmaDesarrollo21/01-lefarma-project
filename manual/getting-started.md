---
description: First session guide — creating your first nota técnica and building connections
type: manual
generated_from: "arscontexta-1.0.0"
---
# Getting Started

## What to Expect

This system helps you document technical decisions and code patterns for the Lefarma project. Each "nota técnica" is a markdown file with structured metadata that connects to your actual code.

## Creating Your First Nota Técnica

1. **Capture the decision**: Tell Claude about a technical decision or pattern in your project
2. **Let Claude document it**: Claude will create a properly structured note in `notas-tecnicas/`
3. **Review the schema**: Every note has:
   - `descripción`: Context beyond the title
   - `modulo`: Which area (Catálogos, Auth, API, Frontend, Infra)
   - `archivos_relacionados`: Paths to actual code files
   - `estado`: activa, obsoleta, or revisar
   - `temas`: Links to the relevant mapa de módulo

## How Connections Work

- **Wiki links**: `[[title of note]]` connects related decisions
- **Topics footer**: Every note declares which mapa de módulo it belongs to
- **Code links**: `archivos_relacionados` connects documentation to actual files

## The Session Rhythm

1. **Orient**: Claude reads self/goals.md to remember what we're working on
2. **Work**: Document decisions, connect notes, update code
3. **Persist**: Update goals.md with current state

## Where to Go Next

- Read [[skills]] to see all available commands
- Try [[workflows]] to understand the full pipeline
- Run /arscontexta:help when skills are activated
