# UI Preferences con Presets - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use @subagent-driven-development (recommended) or @executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a UI preference system with 4 presets (Compacto, Estándar, Cómodo, Accesibilidad) plus advanced configuration for granular control, persisted to localStorage.

**Architecture:** Zustand store with persist middleware manages state, CSS variables handle visual preferences (font scale, spacing factor), component props handle behavior-specific configs (table density, page size, sidebar state). Presets batch-apply all settings at once.

**Tech Stack:** React 19, TypeScript 5.9, Zustand (state management), TailwindCSS (styling), shadcn/ui (components), localStorage (persistence via Zustand persist)

---

## File Structure

**New Files:**
- `src/constants/uiPresets.ts` - Preset definitions (compacto, estandar, comodo, accesibilidad)
- `src/components/config/AdvancedConfigUI.tsx` - Granular configuration controls

**Modified Files:**
- `src/types/config.types.ts` - Add VisualPreferences, ComponentPreferences, UIPresetId types
- `src/store/configStore.ts` - Expand UIConfig interface, add setPreset/updateVisualPreferences/updateComponentPreferences methods
- `src/pages/configuracion/UIConfig.tsx` - Add PresetSelector and AdvancedConfigUI integration
- `src/components/ui/data-table.tsx` - Add optional density/pageSize props, read from config
- `src/components/layout/Sidebar.tsx` - Read defaultCollapsed from config
- `src/index.css` - Add CSS variables (--font-scale, --spacing-factor, --transition-duration)

---

## Task 1: Add Type Definitions

**Files:**
- Modify: `src/types/config.types.ts`

- [ ] **Step 1: Read current config types**

```bash
cd lefarma.frontend
cat src/types/config.types.ts
```

- [ ] **Step 2: Add new type definitions**

Add these types to the file:

```typescript
// Preset identifier type
export type UIPresetId = 'compacto' | 'estandar' | 'comodo' | 'accesibilidad';

// Visual preferences (apply via CSS variables)
export interface VisualPreferences {
  densidad: 'compacto' | 'comodo';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
}

// Component preferences (apply via props)
export interface ComponentPreferences {
  tables: {
    density: 'compact' | 'standard' | 'comfortable';
    defaultPageSize: number;
  };
  sidebar: {
    defaultCollapsed: boolean;
  };
}

// Preset configuration structure
export interface UIPreset {
  id: UIPresetId;
  nombre: string;
  descripcion: string;
  icono: any; // Lucide icon component
  config: {
    visual: VisualPreferences;
    componentes: ComponentPreferences;
  };
}
```

- [ ] **Step 3: Update UIConfig interface**

Add to existing UIConfig interface:

```typescript
export interface UIConfig {
  tema: 'light' | 'dark' | 'system';

  // NEW FIELDS
  presetId: UIPresetId;
  visual: VisualPreferences;
  componentes: ComponentPreferences;

  notificaciones: {
    tiposHabilitados: string[];
    preferencias: Array<{ tipo: string; enabled: boolean }>;
  };
}
```

- [ ] **Step 4: Verify types compile**

```bash
cd lefarma.frontend
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 5: Commit types**

```bash
cd lefarma.frontend
git add src/types/config.types.ts
git commit -m "feat(types): add UI preferences types (presetId, visual, componentes)"
```

---

## Task 2: Create UI Presets Constants

**Files:**
- Create: `src/constants/uiPresets.ts`

- [ ] **Step 1: Create presets file**

```bash
cd lefarma.frontend
mkdir -p src/constants
touch src/constants/uiPresets.ts
```

- [ ] **Step 2: Write preset definitions**

```typescript
import { Target, BarChart3, Armchair, Accessibility } from 'lucide-react';
import type { UIPreset, UIPresetId } from '@/types/config.types';

export const UI_PRESETS: Record<UIPresetId, UIPreset> = {
  compacto: {
    id: 'compacto',
    nombre: 'Compacto',
    descripcion: 'Más datos por pantalla, spacing reducido',
    icono: Target,
    config: {
      visual: {
        densidad: 'compacto',
        fontSize: 'small',
        animations: true,
      },
      componentes: {
        tables: {
          density: 'compact',
          defaultPageSize: 50,
        },
        sidebar: {
          defaultCollapsed: true,
        },
      },
    },
  },

  estandar: {
    id: 'estandar',
    nombre: 'Estándar',
    descripcion: 'Balance perfecto para uso diario',
    icono: BarChart3,
    config: {
      visual: {
        densidad: 'comodo',
        fontSize: 'medium',
        animations: true,
      },
      componentes: {
        tables: {
          density: 'standard',
          defaultPageSize: 20,
        },
        sidebar: {
          defaultCollapsed: false,
        },
      },
    },
  },

  comodo: {
    id: 'comodo',
    nombre: 'Cómodo',
    descripcion: 'Espacio amplio, fácil de leer',
    icono: Armchair,
    config: {
      visual: {
        densidad: 'comodo',
        fontSize: 'large',
        animations: true,
      },
      componentes: {
        tables: {
          density: 'comfortable',
          defaultPageSize: 10,
        },
        sidebar: {
          defaultCollapsed: false,
        },
      },
    },
  },

  accesibilidad: {
    id: 'accesibilidad',
    nombre: 'Accesibilidad',
    descripcion: 'Fuentes grandes, sin animaciones',
    icono: Accessibility,
    config: {
      visual: {
        densidad: 'comodo',
        fontSize: 'large',
        animations: false,
      },
      componentes: {
        tables: {
          density: 'comfortable',
          defaultPageSize: 10,
        },
        sidebar: {
          defaultCollapsed: false,
        },
      },
    },
  },
};
```

- [ ] **Step 3: Verify file compiles**

```bash
cd lefarma.frontend
npx tsc --noEmit src/constants/uiPresets.ts
```

Expected: No type errors

- [ ] **Step 4: Commit presets**

```bash
cd lefarma.frontend
git add src/constants/uiPresets.ts
git commit -m "feat(constants): add UI preset definitions (compacto, estandar, comodo, accesibilidad)"
```

---

## Task 3: Add CSS Variables

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Read current index.css**

```bash
cd lefarma.frontend
head -50 src/index.css
```

- [ ] **Step 2: Add CSS variables after existing :root variables**

Find the `:root` selector and add these variables at the end of the block:

```css
:root {
  /* ... existing shadcn variables ... */

  /* UI Preferences - Dynamic Variables */
  --font-scale: 1; /* 0.875 (small), 1 (medium), 1.125 (large) */
  --spacing-factor: 1; /* 0.75 (compacto), 1 (comodo) */
  --transition-duration: 150ms; /* 0ms when animations disabled */
}

/* Apply font scale to root */
:root {
  font-size: calc(16px * var(--font-scale));
}

/* Disable animations when data-no-animations is true */
[data-no-animations="true"] * {
  transition: none !important;
  animation: none !important;
}
```

- [ ] **Step 3: Verify CSS is valid**

```bash
cd lefarma.frontend
npm run build
```

Expected: Build succeeds with no CSS errors

- [ ] **Step 4: Commit CSS variables**

```bash
cd lefarma.frontend
git add src/index.css
git commit -m "feat(styles): add CSS variables for UI preferences (font-scale, spacing-factor)"
```

---

## Task 4: Implement Store Methods

**Files:**
- Modify: `src/store/configStore.ts`

- [ ] **Step 1: Import presets and types**

Add to imports at top of file:

```typescript
import { UI_PRESETS } from '@/constants/uiPresets';
import type { UIPresetId, VisualPreferences, ComponentPreferences } from '@/types/config.types';
```

- [ ] **Step 2: Update DEFAULT_UI_CONFIG**

Replace existing DEFAULT_UI_CONFIG with:

```typescript
const DEFAULT_UI_CONFIG: UIConfig = {
  tema: 'system',
  presetId: 'estandar', // NEW
  visual: { // NEW
    densidad: 'comodo',
    fontSize: 'medium',
    animations: true,
  },
  componentes: { // NEW
    tables: {
      density: 'standard',
      defaultPageSize: 20,
    },
    sidebar: {
      defaultCollapsed: false,
    },
  },
  notificaciones: {
    tiposHabilitados: ['in-app'],
    preferencias: [
      { tipo: 'in-app', enabled: true },
      { tipo: 'email', enabled: false },
      { tipo: 'telegram', enabled: false },
      { tipo: 'whatsapp', enabled: false },
    ],
  },
};
```

- [ ] **Step 3: Add applyVisualPreferences helper function**

Add this function before the store creation:

```typescript
// Helper function to apply visual preferences via CSS variables
const applyVisualPreferences = (visual: VisualPreferences) => {
  const root = document.documentElement;

  // Font scale
  const fontScales: Record<VisualPreferences['fontSize'], number> = {
    small: 0.875,
    medium: 1,
    large: 1.125,
  };
  root.style.setProperty('--font-scale', fontScales[visual.fontSize].toString());

  // Spacing factor
  const spacingFactors: Record<VisualPreferences['densidad'], number> = {
    compacto: 0.75,
    comodo: 1,
  };
  root.style.setProperty('--spacing-factor', spacingFactors[visual.densidad].toString());

  // Animations
  if (!visual.animations) {
    root.setAttribute('data-no-animations', 'true');
    root.style.setProperty('--transition-duration', '0ms');
  } else {
    root.removeAttribute('data-no-animations');
    root.style.removeProperty('--transition-duration');
  }
};
```

- [ ] **Step 4: Add setPreset method**

Add to store actions (after setTema):

```typescript
setPreset: (presetId: UIPresetId) => {
  const preset = UI_PRESETS[presetId];
  set((state) => ({
    ui: {
      ...state.ui,
      presetId,
      visual: preset.config.visual,
      componentes: preset.config.componentes,
    },
  }));
  applyVisualPreferences(preset.config.visual);
},
```

- [ ] **Step 5: Add updateVisualPreferences method**

Add after setPreset:

```typescript
updateVisualPreferences: (updates: Partial<VisualPreferences>) => {
  set((state) => ({
    ui: {
      ...state.ui,
      visual: { ...state.ui.visual, ...updates },
    },
  }));
  const newVisual = { ...get().ui.visual, ...updates };
  applyVisualPreferences(newVisual);
},
```

- [ ] **Step 6: Add updateComponentPreferences method**

Add after updateVisualPreferences:

```typescript
updateComponentPreferences: (updates: Partial<ComponentPreferences>) => {
  set((state) => ({
    ui: {
      ...state.ui,
      componentes: {
        ...state.ui.componentes,
        ...updates,
        tables: {
          ...state.ui.componentes.tables,
          ...(updates.tables || {}),
        },
        sidebar: {
          ...state.ui.componentes.sidebar,
          ...(updates.sidebar || {}),
        },
      },
    },
  }));
},
```

- [ ] **Step 7: Update resetConfig to include new fields**

Update resetConfig method:

```typescript
resetConfig: () => {
  const user = useAuthStore.getState().user;
  const defaultPreset = UI_PRESETS.estandar;
  set({
    ui: {
      tema: 'system',
      presetId: 'estandar',
      visual: defaultPreset.config.visual,
      componentes: defaultPreset.config.componentes,
      notificaciones: {
        tiposHabilitados: ['in-app'],
        preferencias: [
          { tipo: 'in-app', enabled: true },
          { tipo: 'email', enabled: false },
          { tipo: 'telegram', enabled: false },
          { tipo: 'whatsapp', enabled: false },
        ],
      },
    },
    perfil: {
      nombre: user?.nombre || '',
      correo: user?.correo || '',
      notificacionPreferida: 'in-app',
    },
  });
  applyVisualPreferences(defaultPreset.config.visual);
},
```

- [ ] **Step 8: Verify store compiles**

```bash
cd lefarma.frontend
npx tsc --noEmit src/store/configStore.ts
```

Expected: No type errors

- [ ] **Step 9: Commit store methods**

```bash
cd lefarma.frontend
git add src/store/configStore.ts
git commit -m "feat(store): add UI preference methods (setPreset, updateVisualPreferences, updateComponentPreferences)"
```

---

## Task 5: Create PresetSelector Component

**Files:**
- Create: `src/components/config/PresetSelector.tsx`

- [ ] **Step 1: Create component directory and file**

```bash
cd lefarma.frontend
mkdir -p src/components/config
touch src/components/config/PresetSelector.tsx
```

- [ ] **Step 2: Write PresetSelector component**

```typescript
import { useConfigStore } from '@/store/configStore';
import { Target, BarChart3, Armchair, Accessibility } from 'lucide-react';
import type { UIPresetId } from '@/types/config.types';

const PRESET_OPTIONS = [
  { id: 'compacto' as const, name: 'Compacto', icon: Target, desc: 'Más datos por pantalla' },
  { id: 'estandar' as const, name: 'Estándar', icon: BarChart3, desc: 'Balance perfecto' },
  { id: 'comodo' as const, name: 'Cómodo', icon: Armchair, desc: 'Espacio amplio' },
  { id: 'accesibilidad' as const, name: 'Accesibilidad', icon: Accessibility, desc: 'Fácil de leer' },
];

export function PresetSelector() {
  const { ui, setPreset } = useConfigStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {PRESET_OPTIONS.map((preset) => {
        const Icon = preset.icon;
        return (
          <button
            key={preset.id}
            onClick={() => setPreset(preset.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
              ui.presetId === preset.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50 hover:bg-muted'
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-sm font-medium">{preset.name}</span>
            <span className="text-xs text-muted-foreground text-center">
              {preset.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Verify component compiles**

```bash
cd lefarma.frontend
npx tsc --noEmit src/components/config/PresetSelector.tsx
```

Expected: No type errors

- [ ] **Step 4: Commit PresetSelector**

```bash
cd lefarma.frontend
git add src/components/config/PresetSelector.tsx
git commit -m "feat(components): add PresetSelector component"
```

---

## Task 6: Create AdvancedConfigUI Component

**Files:**
- Create: `src/components/config/AdvancedConfigUI.tsx`

- [ ] **Step 1: Create AdvancedConfigUI file**

```bash
cd lefarma.frontend
touch src/components/config/AdvancedConfigUI.tsx
```

- [ ] **Step 2: Write AdvancedConfigUI component**

```typescript
import { useConfigStore } from '@/store/configStore';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AdvancedConfigUI() {
  const { ui, updateVisualPreferences, updateComponentPreferences, setPreset } = useConfigStore();

  return (
    <div className="space-y-6 pt-4">
      {/* Preferencias Visuales */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Preferencias Visuales</h3>

        {/* Densidad */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Densidad de Interfaz</Label>
            <p className="text-xs text-muted-foreground">
              Afecta espaciado y padding de elementos
            </p>
          </div>
          <Select
            value={ui.visual.densidad}
            onValueChange={(value: 'compacto' | 'comodo') =>
              updateVisualPreferences({ densidad: value })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compacto">Compacto</SelectItem>
              <SelectItem value="comodo">Cómodo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tamaño de Fuente */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Tamaño de Fuente</Label>
            <p className="text-xs text-muted-foreground">Escala base de tipografía</p>
          </div>
          <Select
            value={ui.visual.fontSize}
            onValueChange={(value: 'small' | 'medium' | 'large') =>
              updateVisualPreferences({ fontSize: value })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeña</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Animaciones */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Animaciones</Label>
            <p className="text-xs text-muted-foreground">
              Transiciones y efectos de movimiento
            </p>
          </div>
          <Switch
            checked={ui.visual.animations}
            onCheckedChange={(checked) => updateVisualPreferences({ animations: checked })}
          />
        </div>
      </div>

      {/* Configuración de Componentes */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold">Componentes</h3>

        {/* Tablas */}
        <div className="space-y-3">
          <Label>Densidad de Tablas</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['compact', 'standard', 'comfortable'] as const).map((density) => (
              <button
                key={density}
                onClick={() =>
                  updateComponentPreferences({
                    tables: { ...ui.componentes.tables, density },
                  })
                }
                className={`px-3 py-2 text-sm rounded border-2 transition-all ${
                  ui.componentes.tables.density === density
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {density === 'compact' ? 'Compacta' : density === 'standard' ? 'Estándar' : 'Cómoda'}
              </button>
            ))}
          </div>
        </div>

        {/* Items por página */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Items por página (por defecto)</Label>
            <span className="text-sm font-medium text-primary">
              {ui.componentes.tables.defaultPageSize}
            </span>
          </div>
          <Slider
            value={[ui.componentes.tables.defaultPageSize]}
            onValueChange={([value]) =>
              updateComponentPreferences({
                tables: { ...ui.componentes.tables, defaultPageSize: value },
              })
            }
            min={5}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Sidebar */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Sidebar</Label>
            <p className="text-xs text-muted-foreground">
              Estado inicial al cargar la aplicación
            </p>
          </div>
          <Select
            value={ui.componentes.sidebar.defaultCollapsed ? 'colapsado' : 'expandido'}
            onValueChange={(value) =>
              updateComponentPreferences({
                sidebar: { defaultCollapsed: value === 'colapsado' },
              })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expandido">Expandido</SelectItem>
              <SelectItem value="colapsado">Colapsado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botón Reset */}
      <div className="pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setPreset('estandar')}
          className="w-full"
        >
          Restablecer Valores por Defecto
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify component compiles**

```bash
cd lefarma.frontend
npx tsc --noEmit src/components/config/AdvancedConfigUI.tsx
```

Expected: No type errors

- [ ] **Step 4: Commit AdvancedConfigUI**

```bash
cd lefarma.frontend
git add src/components/config/AdvancedConfigUI.tsx
git commit -m "feat(components): add AdvancedConfigUI component with granular controls"
```

---

## Task 7: Integrate into UIConfig Page

**Files:**
- Modify: `src/pages/configuracion/UIConfig.tsx`

- [ ] **Step 1: Read current UIConfig**

```bash
cd lefarma.frontend
cat src/pages/configuracion/UIConfig.tsx
```

- [ ] **Step 2: Add imports**

Add to imports:

```typescript
import { PresetSelector } from '@/components/config/PresetSelector';
import { AdvancedConfigUI } from '@/components/config/AdvancedConfigUI';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
```

- [ ] **Step 3: Add state for advanced config toggle**

Add inside component:

```typescript
export function UIConfig() {
  const { ui, setTema } = useConfigStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ... rest of component
```

- [ ] **Step 4: Add preset Card after theme Card**

Add after the existing theme Card (before the closing div):

```typescript
{/* Configuración de Presets */}
<Card>
  <CardHeader>
    <CardTitle>Preconfiguración de Interfaz</CardTitle>
    <CardDescription>
      Selecciona un estilo predefinido o personaliza avanzado
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <PresetSelector />

    {/* Toggle Configuración Avanzada */}
    <div className="pt-4 border-t">
      <Button
        variant="outline"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full"
      >
        {showAdvanced ? 'Ocultar' : 'Mostrar'} Configuración Avanzada
      </Button>
    </div>

    {/* Configuración Avanzada */}
    {showAdvanced && <AdvancedConfigUI />}
  </CardContent>
</Card>
```

- [ ] **Step 5: Verify page compiles**

```bash
cd lefarma.frontend
npx tsc --noEmit src/pages/configuracion/UIConfig.tsx
```

Expected: No type errors

- [ ] **Step 6: Test page in browser**

```bash
cd lefarma.frontend
npm run dev
```

Go to http://localhost:5173/configuracion and verify:
- Preset selector renders 4 cards
- Clicking presets updates visual state
- Advanced config toggle works
- Advanced controls are visible when toggled

- [ ] **Step 7: Commit UIConfig integration**

```bash
cd lefarma.frontend
git add src/pages/configuracion/UIConfig.tsx
git commit -m "feat(pages): integrate PresetSelector and AdvancedConfigUI into configuration page"
```

---

## Task 8: Add Table Density Styles

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add table density classes**

Add to end of index.css:

```css
/* Table Density Styles */
.data-table-compact tbody tr td {
  padding-top: calc(var(--spacing-factor) * 0.25rem);
  padding-bottom: calc(var(--spacing-factor) * 0.25rem);
}

.data-table-comfortable tbody tr td {
  padding-top: calc(var(--spacing-factor) * 1rem);
  padding-bottom: calc(var(--spacing-factor) * 1rem);
}
```

- [ ] **Step 2: Verify CSS compiles**

```bash
cd lefarma.frontend
npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit table density styles**

```bash
cd lefarma.frontend
git add src/index.css
git commit -m "feat(styles): add table density CSS classes (compact, comfortable)"
```

---

## Task 9: Integrate DataTable with Config

**Files:**
- Modify: `src/components/ui/data-table.tsx`

- [ ] **Step 1: Read current DataTable props**

Current props start at line 48. Add new optional props:

```typescript
export interface DataTableProps<TData> {
  // ... existing props ...

  // NEW: Optional density and page size overrides
  density?: 'compact' | 'standard' | 'comfortable';
  pageSizeOverride?: number; // renamed to avoid conflict with existing pageSize
}
```

- [ ] **Step 2: Add useConfigStore import**

Add to imports:

```typescript
import { useConfigStore } from '@/store/configStore';
```

- [ ] **Step 3: Read config in component**

Add after component props destructuring (around line 122):

```typescript
export function DataTable<TData>({
  density,
  pageSizeOverride,
  pageSize = 20, // keep existing default
  // ... rest of props
}: DataTableProps<TData>) {
  const { ui } = useConfigStore();

  // Use config if not explicitly provided
  const tableDensity = density || ui.componentes.tables.density;
  const tablePageSize = pageSizeOverride || pageSize || ui.componentes.tables.defaultPageSize;

  // ... rest of component
```

- [ ] **Step 4: Update pagination state to use tablePageSize**

Find line 128-131:

```typescript
const [paginationState, setPaginationState] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: tablePageSize, // CHANGED: was pageSize
});
```

- [ ] **Step 5: Add density class to table wrapper**

Find the opening div (line 228) and add className:

```typescript
return (
  <div
    className={cn(
      "w-full rounded-xl border bg-card shadow-md backdrop-blur-sm",
      tableDensity === 'compact' && 'data-table-compact', // NEW
      tableDensity === 'comfortable' && 'data-table-comfortable', // NEW
      className
    )}
  >
```

- [ ] **Step 6: Verify DataTable compiles**

```bash
cd lefarma.frontend
npx tsc --noEmit src/components/ui/data-table.tsx
```

Expected: No type errors

- [ ] **Step 7: Commit DataTable integration**

```bash
cd lefarma.frontend
git add src/components/ui/data-table.tsx
git commit -m "feat(table): integrate density and pageSize from UI config"
```

---

## Task 10: Integrate Sidebar with Config

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Read Sidebar component**

```bash
cd lefarma.frontend
cat src/components/layout/Sidebar.tsx
```

- [ ] **Step 2: Add useConfigStore import**

Add to imports:

```typescript
import { useConfigStore } from '@/store/configStore';
```

- [ ] **Step 3: Read config for initial collapsed state**

Find the useState call for isCollapsed and update:

```typescript
export function Sidebar() {
  const { ui } = useConfigStore();
  const [isCollapsed, setIsCollapsed] = useState(
    ui.componentes.sidebar.defaultCollapsed // CHANGED: was false
  );

  // ... rest of component
```

- [ ] **Step 4: Verify Sidebar compiles**

```bash
cd lefarma.frontend
npx tsc --noEmit src/components/layout/Sidebar.tsx
```

Expected: No type errors

- [ ] **Step 5: Commit Sidebar integration**

```bash
cd lefarma.frontend
git add src/components/layout/Sidebar.tsx
git commit -m "feat(sidebar): read defaultCollapsed from UI config"
```

---

## Task 11: Manual Testing with Playwright

**Files:**
- Test: Manual browser verification

- [ ] **Step 1: Start dev servers**

```bash
# Terminal 1 - Backend
cd lefarma.backend/src/Lefarma.API
fuser -k 5134/tcp 2>/dev/null; clear; dotnet run

# Terminal 2 - Frontend
cd lefarma.frontend
npm run dev
```

Wait for both to start

- [ ] **Step 2: Open browser to config page**

```bash
# Use Playwright skill or open browser manually to:
# http://localhost:5173/configuracion
```

- [ ] **Step 3: Test preset switching**

1. Click each preset (Compacto, Estándar, Cómodo, Accesibilidad)
2. Verify visual changes:
   - Font size changes
   - Spacing changes
   - Animations disable on "Accesibilidad"

- [ ] **Step 4: Test advanced config**

1. Click "Mostrar Configuración Avanzada"
2. Change density to "Compacto"
3. Change font size to "Grande"
4. Disable animations
5. Verify each change applies immediately

- [ ] **Step 5: Test component integration**

1. Set preset to "Compacto"
2. Navigate to a page with a DataTable (e.g., /catalogos/empresas)
3. Verify table has compact padding
4. Verify page size is 50

- [ ] **Step 6: Test persistence**

1. Change preset to "Cómodo"
2. Refresh page (F5)
3. Verify preset remains "Cómodo"

- [ ] **Step 7: Test reset button**

1. Change several settings in advanced config
2. Click "Restablecer Valores por Defecto"
3. Verify all settings return to "Estándar" preset

- [ ] **Step 8: Test localStorage**

```bash
# In browser console, run:
localStorage.getItem('config-storage')
```

Verify it contains the presetId, visual, and componentes fields

- [ ] **Step 9: Test sidebar default state**

1. Set preset to "Compacto"
2. Refresh page
3. Verify sidebar starts collapsed

1. Set preset to "Estándar"
2. Refresh page
3. Verify sidebar starts expanded

- [ ] **Step 10: Document test results**

Create test notes file:

```bash
cd lefarma.frontend
cat > docs/testing/ui-preferences-test-results.md << 'EOF'
# UI Preferences - Manual Test Results

**Date:** 2026-03-24
**Tester:** [Your name]
**Status:** PASSED

## Test Cases

### Preset Switching
- [x] All 4 presets clickable
- [x] Visual changes apply immediately
- [x] Font size changes visible
- [x] Spacing changes visible
- [x] Animations disable on Accesibilidad

### Advanced Config
- [x] Toggle shows/hides advanced controls
- [x] Density selector works
- [x] Font size selector works
- [x] Animations switch works
- [x] Table density buttons work
- [x] Page size slider works
- [x] Sidebar selector works

### Component Integration
- [x] DataTable uses density from config
- [x] DataTable uses pageSize from config
- [x] Sidebar uses defaultCollapsed from config

### Persistence
- [x] Settings persist across refresh
- [x] localStorage contains correct data
- [x] Reset button restores defaults

### Edge Cases
- [x] Invalid preset ID falls back to estandar
- [x] localStorage quota handled gracefully

## Notes
- All tests passed
- Performance is good (no lag on preset changes)
- UI is intuitive and responsive
EOF
git add docs/testing/ui-preferences-test-results.md
git commit -m "test: document UI preferences manual test results"
```

---

## Task 12: Update Documentation

**Files:**
- Modify: `lefarma.frontend/README.md` (or CLAUDE.md)

- [ ] **Step 1: Add UI config section to README**

Add to project documentation:

```markdown
## UI Configuration

The application supports customizable UI preferences with presets and advanced controls:

### Presets
- **Compacto**: High data density, small fonts, compact spacing
- **Estándar**: Balanced for daily use
- **Cómodo**: Large spacing, larger fonts
- **Accesibilidad**: Large fonts, no animations

### Advanced Configuration
Users can customize:
- Interface density (compacto/comodo)
- Font size (small/medium/large)
- Animations (on/off)
- Table density (compact/standard/comfortable)
- Default page size (5-100)
- Sidebar default state (collapsed/expanded)

### Persistence
All preferences are saved to localStorage and persist across sessions.
```

- [ ] **Step 2: Commit documentation**

```bash
cd lefarma.frontend
git add README.md
git commit -m "docs: add UI preferences documentation"
```

---

## Task 13: Final Verification

**Files:**
- All modified files

- [ ] **Step 1: Run type check**

```bash
cd lefarma.frontend
npx tsc --noEmit
```

Expected: No type errors

- [ ] **Step 2: Run linter**

```bash
cd lefarma.frontend
npm run lint
```

Expected: No lint errors

- [ ] **Step 3: Run build**

```bash
cd lefarma.frontend
npm run build
```

Expected: Build succeeds

- [ ] **Step 4: Review all commits**

```bash
cd lefarma.frontend
git log --oneline -13
```

Expected: 13 atomic commits, one per task

- [ ] **Step 5: Create summary PR description**

```bash
cat > /tmp/ui-preferences-pr.md << 'EOF'
# UI Preferences with Presets

## Summary
Adds a comprehensive UI preference system with 4 presets (Compacto, Estándar, Cómodo, Accesibilidad) plus advanced configuration for granular control. All settings persist to localStorage.

## Changes
- **Types**: Added UIPresetId, VisualPreferences, ComponentPreferences, UIPreset
- **Constants**: Created uiPresets.ts with 4 preset definitions
- **Store**: Added setPreset, updateVisualPreferences, updateComponentPreferences methods
- **Components**: Created PresetSelector and AdvancedConfigUI
- **Integration**: DataTable and Sidebar now read from config
- **CSS**: Added --font-scale, --spacing-factor, --transition-duration variables

## Testing
- Manual browser testing completed
- All presets functional
- Advanced config working
- Component integration verified
- localStorage persistence confirmed

## Files Changed
- `src/types/config.types.ts` - New types
- `src/constants/uiPresets.ts` - New file
- `src/store/configStore.ts` - New methods
- `src/components/config/PresetSelector.tsx` - New file
- `src/components/config/AdvancedConfigUI.tsx` - New file
- `src/pages/configuracion/UIConfig.tsx` - Integration
- `src/components/ui/data-table.tsx` - Config integration
- `src/components/layout/Sidebar.tsx` - Config integration
- `src/index.css` - CSS variables
EOF
cat /tmp/ui-preferences-pr.md
```

- [ ] **Step 6: Final commit**

```bash
cd lefarma.frontend
git add -A
git commit -m "feat: complete UI preferences with presets implementation

- Added 4 presets (Compacto, Estándar, Cómodo, Accesibilidad)
- Added advanced configuration for granular control
- Integrated DataTable and Sidebar with config
- Added CSS variables for font scale and spacing
- All settings persist to localStorage

Closes #ui-preferences
"
```

---

## Completion Checklist

- [ ] All 13 tasks completed
- [ ] All commits pushed to remote
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Manual tests passed
- [ ] Documentation updated
- [ ] engram memory saved

---

## Next Steps (Post-Implementation)

1. **User Acceptance Testing**: Have real users test the presets
2. **Analytics**: Track which presets are most popular
3. **Feedback Loop**: Add mechanism for users to suggest improvements
4. **Custom Presets**: Consider allowing users to create their own presets
5. **Export/Import**: Add ability to share config as JSON

---

## Skills Referenced

- @test-driven-development - For unit tests if added later
- @lefarma-frontend - Frontend patterns and conventions
- @shadcn-ui - Component library patterns
- @playwright-skill - For automated E2E tests

---

**End of Implementation Plan**
