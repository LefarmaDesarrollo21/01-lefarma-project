---
name: enlazar
description: Encuentra y crea conexiones entre notas técnicas relacionadas
options: |
  {título de nota técnica a enlazar, o 'all' para procesar todas}
---

# /enlazar

Encuentra conexiones entre notas técnicas y crea enlaces wiki entre ellas.

## Uso

```
/enlazar "Usamos Repository Pattern para acceso a datos"
/enlazar all  # Procesa todas las notas sin conexiones
```

## Proceso

1. **Identificar candidatos**:
   - Busca notas del mismo módulo
   - Busca notas que mencionen archivos relacionados comunes
   - Busca notas con temas similares

2. **Evaluar conexiones**:
   - ¿Una nota expande otra?
   - ¿Una decisión habilita otra?
   - ¿Hay contradicciones que documentar?

3. **Crear enlaces**:
   - Añade wiki links `[[título]]` en ambas direcciones
   - Documenta la relación en "Notas relacionadas"

4. **Actualizar MOCs**:
   - Asegura que ambas notas estén en sus mapas de módulo

## Quality Gates

- [ ] Cada nota tiene al menos un enlace entrante o saliente
- [ ] Las conexiones son significativas (no arbitrarias)
- [ ] Las relaciones se documentan con contexto

## Handoff

Después de /enlazar:
```
/validar para verificar integridad de enlaces
```
