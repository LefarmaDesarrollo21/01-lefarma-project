---
name: documentar
description: Extrae y documenta una decisión técnica o patrón del proyecto
options: |
  {título de la nota técnica a crear}
---

# /documentar

Extrae una decisión técnica, patrón de código, o conocimiento del sistema y lo convierte en una nota técnica estructurada.

## Uso

```
/documentar Usamos Repository Pattern para acceso a datos en Catálogos
```

## Proceso

1. **Crear nota técnica** en `notas-tecnicas/`
   - Título como proposición (no como tópico)
   - Usa template `templates/nota-tecnica.md`

2. **Llenar schema**:
   - `descripción`: Contexto en ~150 caracteres
   - `modulo`: Catálogos | Auth | API | Frontend | Infra
   - `estado`: activa
   - `archivos_relacionados`: Rutas a archivos reales
   - `temas`: Wiki link al mapa de módulo correspondiente

3. **Escribir contenido**:
   - Contexto: ¿Qué problema resolvíamos?
   - Decisión: ¿Qué elegimos?
   - Razonamiento: ¿Por qué?
   - Implementación: ¿Cómo se ve en el código?

4. **Conectar**:
   - Añadir a mapa de módulo correspondiente
   - Crear enlaces a notas relacionadas si existen

## Quality Gates

- [ ] Título completa "Esta nota documenta que..."
- [ ] Descripción añade información más allá del título
- [ ] Al menos un archivo relacionado existe
- [ ] Conectada a un mapa de módulo

## Handoff

Después de /documentar, el siguiente paso suele ser:
```
/enlazar para conectar con notas relacionadas
```
