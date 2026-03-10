---
description: How to adjust your system via config.yaml and /architect
type: manual
generated_from: "arscontexta-1.0.0"
---
# Configuration

## config.yaml

Edit `ops/config.yaml` to adjust system behavior:

```yaml
dimensions:
  granularity: moderate    # atomic | moderate | coarse
  processing: moderate     # light | moderate | heavy
  schema: moderate         # minimal | moderate | dense
```

### Key Settings

**processing.depth**: Controls how thorough processing is
- `deep` — Full quality gates, best for important decisions
- `standard` — Balanced approach (default)
- `quick` — Fast capture, minimal processing

**maintenance**: How the system maintains itself
- `condition-based` — Runs when thresholds trigger (default)
- `manual` — You trigger maintenance explicitly

## /architect Command

Use `/architect` for guided configuration changes:

```
/architect suggest changes for higher volume
/architect enable self-space
/architect disable semantic-search
```

The architect will:
1. Analyze current configuration
2. Suggest changes based on research
3. Explain trade-offs
4. Implement if approved

## Feature Toggles

```yaml
features:
  semantic-search: false   # Enable for cross-vocabulary discovery
  processing-pipeline: true # Always keep this on
```

## Preset Information

Your system was derived from:
- **Domain**: Technical documentation for software project
- **Volume**: Moderate (several times per week)
- **Purpose**: Shared context between you and agent

## Dimension Positions Explained

| Dimension | Your Setting | What It Means |
|-----------|--------------|---------------|
| Granularity | moderate | One note per decision/pattern, not atomic claims |
| Organization | flat | No folder hierarchy, MOC-based navigation |
| Processing | moderate | Document, connect, update, validate |
| Navigation | 2-tier | Hub → Module MOCs → Notes |
| Schema | moderate | Fields for module, files, status |

See ops/derivation.md for the full reasoning behind each choice.
