---
_schema:
  entity_type: "mapa-modulo"
  applies_to: "notas-tecnicas/mapa-*.md"
  required:
    - descripción
    - estado
  optional:
    - archivos_clave
    - notas_relacionadas
  enums:
    estado:
      - activo
      - en-refactor
      - estable
      - deprecado
  constraints:
    descripción:
      max_length: 200
      format: "Descripción del módulo y su propósito"

descripción: ""
estado: activo
archivos_clave:
  - ""
---

# {Nombre del Módulo}

## Descripción

{Qué hace este módulo, su responsabilidad en el sistema}

## Estado

{activo | en-refactor | estable | deprecado}

## Decisiones Técnicas

{Notas técnicas que documentan decisiones de este módulo}
- [[nota-tecnica-1]]
- [[nota-tecnica-2]]

## Archivos Clave

{Código principal de este módulo}
- `ruta/al/archivo.cs`
- `ruta/al/componente.tsx`

## Dependencias

{Qué otros módulos usa este}
- Depende de: [[otro-mapa]]
- Lo usan: [[otro-mapa]]

## Patrones

{Patrones recurrentes en este módulo}

---

Temas:
- [[inicio]]
