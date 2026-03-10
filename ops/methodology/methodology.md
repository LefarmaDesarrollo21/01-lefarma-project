---
description: The vault's self-knowledge — derivation rationale, configuration state, and operational evolution history
type: moc
---
# methodology

This folder records what the system knows about its own operation — why it was configured this way, what the current state is, and how it has evolved. Meta-skills (/revisar, /architect) read from and write to this folder. /recordar captures operational corrections here.

## Derivation Rationale
- [[derivation-rationale]] — Why each configuration dimension was set the way it was

## Configuration State
(Populated by /revisar, /architect)

## Evolution History
(Populated by /revisar, /architect, /reseed)

## How to Use This Folder

Browse notes: `ls ops/methodology/`
Query by category: `rg '^category:' ops/methodology/`
Find active directives: `rg '^status: active' ops/methodology/`
Ask the research graph: `/ask [question about your system]`

Meta-skills (/revisar, /architect) read from and write to this folder.
/recordar captures operational corrections here.
