# Lefarma Project Knowledge System

## Philosophy

Este es un sistema de notas técnicas para el proyecto Lefarma. Cada nota documenta una decisión, patrón, o comprensión del sistema. La meta: mantener contexto compartido entre sesiones — saber siempre "en qué andamos".

El agente que opera este sistema:
- Documenta decisiones de arquitectura con sus razones
- Conecta notas con el código que referencian
- Actualiza notas cuando el sistema evoluciona
- Valida que la documentación refleje el estado actual del código

---

## Session Rhythm: Orient, Trabajar, Persistir

**Orient (Al iniciar sesión):**
1. Lee self/goals.md — ¿en qué andamos?
2. Lee self/metodologia.md — ¿cómo trabajamos?
3. Lista notas-tecnicas/ para ver estado actual
4. Revisa ops/reminders.md para acciones pendientes
5. Revisa ops/queue/ para tareas de procesamiento

**Trabajar:**
- Documentar decisiones técnicas que surjan
- Enlazar notas con archivos de código relacionados
- Actualizar notas obsoletas cuando el código cambie

**Persistir (Al terminar sesión):**
- Actualiza self/goals.md con el estado actual
- Crea entrada en ops/sessions/ con lo que pasó
- Añade observaciones a ops/observations/ si aprendimos algo sobre el proceso

---

## Atomic Notes (Notas Técnicas)

Cada nota técnica debe ser:
- **Proposición como título**: "Usamos Repository Pattern para acceso a datos" (no "Repository Pattern")
- **Una idea por archivo**: Una decisión, un patrón, un módulo
- **Referenciable**: Otros archivos deben poder enlazar a esta nota

**Test de composabilidad:**
Prueba completar: "Esta nota documenta que [título]"
Si suena raro, el título necesita trabajo.

---

## Wiki Links

Los enlaces `[[título de nota]]` conectan el conocimiento.

**Patrones de uso:**
- **Referencias a decisiones**: "Esta implementación sigue el patrón [[Usamos Repository Pattern para acceso a datos]]"
- **Conexión de módulos**: "El módulo de Catálogos depende de [[Autenticación multi-tenant]]"
- **Historial**: "[[Decisión anterior]] fue superada por esta nueva aproximación"

**Creación de enlaces:**
- Cuando mencionas una decisión existente, enlázala
- Cuando ves una conexión no documentada, crea el enlace
- Los enlaces son bidireccionales: aparecen en "Notas relacionadas"

---

## MOCs (Mapas de Módulo)

La navegación es de 2 niveles:
- **Hub** (inicio.md): Índice general de todos los mapas de módulo
- **Mapas de módulo**: Uno por área funcional (Catálogos, Auth, API, Frontend, Infra)

**Cada mapa de módulo contiene:**
- Descripción del módulo
- Notas técnicas que lo componen
- Archivos de código clave
- Estado general (activo, en refactor, estable)

---

## Processing Pipeline (Flujo de Procesamiento)

**Fase 1: Documentar (/documentar)**
- Extraer la decisión o patrón del contexto
- Crear nota técnica con título proposicional
- Añadir campos: módulo, archivos_relacionados, estado

**Fase 2: Enlazar (/enlazar)**
- Buscar notas técnicas relacionadas
- Añadir enlaces wiki entre notas conectadas
- Actualizar mapas de módulo para incluir la nueva nota

**Fase 3: Actualizar (/actualizar)**
- Revisar notas marcadas como "revisar" o "obsoleta"
- Actualizar contenido para reflejar estado actual del código
- Propagar cambios a notas relacionadas

**Fase 4: Validar (/validar)**
- Verificar que archivos_relacionados existen
- Comprobar que enlaces wiki resuelven
- Validar campos requeridos del schema

---

## Schema (Campos de las Notas)

Toda nota técnica usa este schema:

```yaml
---
descripción: "Contexto de la decisión en ~150 caracteres"
temas:
  - "[[mapa-de-modulo]]"
estado: activa | obsoleta | revisar
modulo: Catálogos | Auth | API | Frontend | Infra
archivos_relacionados:
  - "path/al/archivo.cs"
  - "path/al/componente.tsx"
decision_alternativa: "Qué consideramos y descartamos (opcional)"
---
```

**Reglas:**
- `descripción` debe añadir información más allá del título
- `temas` incluye al menos un mapa de módulo
- `archivos_relacionados` conecta la nota con el código real
- `estado` se actualiza cuando el código cambia

---

## Maintenance (Mantenimiento)

**Condiciones que disparan mantenimiento:**
- Notas en estado "obsoleta" > 0
- Notas sin archivos_relacionados válidos > 3
- Notas sin enlaces entrantes (huérfanas) > 5
- Enlaces wiki rotos detectados

**Comando /revisar:**
- Revisa observaciones acumuladas en ops/observations/
- Evalúa si el sistema necesita ajustes
- Propone cambios a la metodología si hay fricción

---

## Self-Evolution (Evolución del Sistema)

El sistema mejora con el uso:

1. **Captura de fricción**: Cuando algo no funciona bien, crea observación en ops/observations/
2. **Revisión periódica**: Corre /revisar cuando haya >10 observaciones pendientes
3. **Ajuste de metodología**: Actualiza self/metodologia.md con aprendizajes

---

## Three-Space Architecture

**notas-tecnicas/**: Conocimiento duradero del sistema
- Decisiones de arquitectura
- Patrones de código
- Documentación de módulos

**self/**: Memoria persistente del agente
- identity.md: Quién soy en este proyecto
- metodologia.md: Cómo opero
- goals.md: En qué andamos ahora

**ops/**: Coordinación operacional
- derivation.md: Cómo se derivó el sistema
- sessions/: Logs de sesiones
- observations/: Observaciones de fricción
- reminders.md: Acciones pendientes con fecha

---

## Discovery-First Design

**Antes de crear cualquier nota, pregunta:** ¿Cómo la encontrará una sesión futura?

**Tácticas:**
- Títulos proposicionales que funcionen como claims
- Descripciones que permitan filtrar antes de leer
- Temas que conecten a MOCs
- Archivos relacionados para búsqueda por código

---

## Memory Type Routing

| Contenido | Destino | Por qué |
|-----------|---------|---------|
| Decisión de arquitectura | notas-tecnicas/ | Conocimiento duradero |
| Patrón descubierto | notas-tecnicas/ | Referencia futura |
| "En qué andamos" | self/goals.md | Orientación de sesión |
| Cómo trabajo mejor | self/metodologia.md | Mejora operacional |
| Fricción del proceso | ops/observations/ | Evolución del sistema |
| Log de sesión | ops/sessions/ | Historial temporal |
| Recordatorio con fecha | ops/reminders.md | Acción diferida |

---

## Common Pitfalls (Errores Comunes)

### Temporal Staleness (Obsolescencia)
El código cambia pero las notas no se actualizan. Una nota que dice "usamos X" cuando ya migraste a Y es peor que no tener nota.

**Prevención:**
- Marca notas como "revisar" cuando sepas que el código cambiará
- Revisa archivos_relacionados periódicamente
- Usa `estado: obsoleta` activamente

### Orphan Notes (Notas Huérfanas)
Una nota sin enlaces entrantes es una nota que nunca se encontrará.

**Prevención:**
- Todo tema debe enlazar a al menos un mapa de módulo
- Al crear nota, enlaza desde el MOC correspondiente
- Corre validación de huérfanos periódicamente

### Link Rot (Enlaces Rotos)
Referencias a archivos que se movieron o eliminaron.

**Prevención:**
- Nunca elimina, archiva (preserva targets de enlaces)
- Usa rutas relativas estables
- Valida archivos_relacionados en cada revisión

### Collector's Fallacy (Falacia del Coleccionista)
Capturar sin documentar. Tener 20 notas en inbox sin procesar.

**Prevención:**
- Procesa antes de capturar más
- Límite de WIP: máximo 5 items en inbox
- Visible: cuenta de inbox en orientación

---

## System Evolution

**Comandos para evolucionar el sistema:**

- `/arscontexta:revisar` — Revisa observaciones acumuladas y propone ajustes
- `/arscontexta:architect` — Obtén consejo sobre cambios de configuración
- `/arscontexta:recordar` — Captura fricción operacional (uso automático en hooks)

---

## Helper Functions

**Validar nota técnica:**
```bash
# Verifica schema, enlaces, archivos relacionados
rg "^archivos_relacionados:" notas-tecnicas/*.md
rg "^estado:" notas-tecnicas/*.md
```

**Encontrar notas huérfanas:**
```bash
# Notas sin enlaces entrantes
# (requiere construir índice de enlaces)
```

**Ver estado por módulo:**
```bash
rg "^modulo: Catálogos" notas-tecnicas/*.md -l
```

---

## Derivation Rationale

Este sistema fue derivado de:
- **Dominio**: Documentación técnica de proyecto software
- **Volumen**: Moderado (varias veces por semana)
- **Propósito**: Contexto compartido (tú + agente)
- **Granularidad**: Moderada (una nota por decisión/patrón)
- **Procesamiento**: Moderado (documentar, enlazar, actualizar)
- **Personalidad**: Warm, casual (comunicación cercana en español)
- **Self-space**: Habilitado (memoria persistente necesaria)

Señales clave de la conversación:
- "mantener todo junto" → organización flat
- "notas técnicas" → vocabulario nativo
- "para ti y para ti" → contexto compartido requiere self-space
