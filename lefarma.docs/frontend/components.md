# Components - Frontend Documentation

## Índice

- [Layout Components](#layout-components)
- [UI Components](#ui-components)

---

## Layout Components

### MainLayout

**Archivo:** `src/components/layout/MainLayout.tsx`

Layout principal de la aplicación para rutas protegidas.

#### Estructura

```
┌─────────────────────────────────────┐
│  Sidebar  │      Header             │
│  (fijo)   ├─────────────────────────┤
│           │                         │
│           │      Content            │
│           │      <Outlet />         │
│           │                         │
└─────────────────────────────────────┘
```

#### Implementación

```tsx
export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

#### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| - | - | No recibe props |

---

### Header

**Archivo:** `src/components/layout/Header.tsx`

Header superior con información de ubicación y menú de usuario.

#### Secciones

##### 1. Ubicación Actual
- Empresa seleccionada
- Sucursal seleccionada

##### 2. Menú de Usuario (Dropdown)
- Perfil
- Cambiar Ubicación
- Separador
- Cerrar Sesión

#### Estado Global

```tsx
const { user, empresa, sucursal, logout } = useAuthStore();
```

#### UI Components

- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`
- `DropdownMenuItem`, `DropdownMenuSeparator`
- Iconos: `Building2`, `MapPin`, `User`, `Settings`, `LogOut`, `ChevronDown`

---

### Sidebar

**Archivo:** `src/components/layout/Sidebar.tsx`

Barra lateral de navegación fija.

#### Items de Menú

| Ruta | Label | Icono |
|------|-------|-------|
| `/` | Dashboard | `LayoutDashboard` |
| `/roles` | Roles | `Shield` |
| `/permisos` | Permisos | `Key` |
| `/perfil` | Perfil | `User` |
| `/configuracion` | Configuración | `Settings` |

#### Logo

- Texto: "LeFarma"
- Badge: "v{version}"

#### Responsive

- Desktop: Visible (`lg:block`)
- Mobile: Oculto (`hidden`)

#### Implementación

```tsx
const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/roles', label: 'Roles', icon: Shield },
  { path: '/permisos', label: 'Permisos', icon: Key },
  { path: '/perfil', label: 'Perfil', icon: User },
  { path: '/configuracion', label: 'Configuración', icon: Settings },
];
```

---

## UI Components

Basados en [Radix UI](https://www.radix-ui.com/) y estilizados con TailwindCSS.

### Button

**Archivo:** `src/components/ui/button.tsx`

Botón con múltiples variantes y tamaños.

#### Variantes

| Variante | Descripción |
|----------|-------------|
| `default` | Fondo primario, texto blanco |
| `destructive` | Fondo rojo, texto blanco |
| `outline` | Borde primario, fondo transparente |
| `secondary` | Fondo secundario, texto secundario |
| `ghost` | Sin fondo, hover suave |
| `link` | Apariencia de enlace |

#### Tamaños

| Tamaño | Clases |
|--------|--------|
| `default` | `h-10 px-4 py-2` |
| `sm` | `h-9 px-3` |
| `lg` | `h-11 px-8` |
| `icon` | `h-10 w-10` |

#### Uso

```tsx
<Button>Default</Button>
<Button variant="destructive">Eliminar</Button>
<Button variant="outline" size="sm">Cancelar</Button>
<Button disabled>Cargando...</Button>
```

---

### Card

**Archivo:** `src/components/ui/card.tsx`

Contenedor con estilo de tarjeta.

#### Subcomponentes

| Componente | Descripción |
|------------|-------------|
| `Card` | Contenedor principal |
| `CardHeader` | Encabezado de la tarjeta |
| `CardTitle` | Título del encabezado |
| `CardDescription` | Descripción del encabezado |
| `CardContent` | Contenido principal |
| `CardFooter` | Pie de la tarjeta |

#### Uso

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
  <CardFooter>
    <Button>Acción</Button>
  </CardFooter>
</Card>
```

---

### Dialog

**Archivo:** `src/components/ui/dialog.tsx`

Modal/Popup para contenido superpuesto.

#### Subcomponentes

| Componente | Descripción |
|------------|-------------|
| `Dialog` | Contenedor principal |
| `DialogTrigger` | Elemento que abre el diálogo |
| `DialogContent` | Contenido del diálogo |
| `DialogHeader` | Encabezado |
| `DialogTitle` | Título |
| `DialogDescription` | Descripción |
| `DialogFooter` | Pie con acciones |

#### Uso

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título del Modal</DialogTitle>
      <DialogDescription>Descripción del modal</DialogDescription>
    </DialogHeader>
    {/* Contenido */}
    <DialogFooter>
      <Button type="submit">Guardar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Input

**Archivo:** `src/components/ui/input.tsx`

Campo de texto estilizado.

#### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `type` | `string` | Tipo de input (text, password, email, etc.) |
| `placeholder` | `string` | Texto placeholder |
| `disabled` | `boolean` | Estado deshabilitado |

#### Uso

```tsx
<Input type="text" placeholder="Nombre completo" />
<Input type="password" placeholder="Contraseña" />
<Input disabled value="No editable" />
```

---

### Label

**Archivo:** `src/components/ui/label.tsx`

Etiqueta para formularios.

#### Uso

```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

---

### Select

**Archivo:** `src/components/ui/select.tsx`

Selector desplegable.

#### Subcomponentes

| Componente | Descripción |
|------------|-------------|
| `Select` | Contenedor principal |
| `SelectTrigger` | Botón que abre el select |
| `SelectValue` | Valor seleccionado |
| `SelectContent` | Lista de opciones |
| `SelectItem` | Opción individual |
| `SelectGroup` | Grupo de opciones |
| `SelectLabel` | Label de grupo |
| `SelectSeparator` | Separador |

#### Uso

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona una opción" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Grupo</SelectLabel>
      <SelectItem value="1">Opción 1</SelectItem>
      <SelectItem value="2">Opción 2</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

---

### Table

**Archivo:** `src/components/ui/table.tsx`

Tabla para mostrar datos.

#### Subcomponentes

| Componente | Descripción |
|------------|-------------|
| `Table` | Contenedor principal |
| `TableHeader` | Encabezado de tabla |
| `TableBody` | Cuerpo de tabla |
| `TableFooter` | Pie de tabla |
| `TableRow` | Fila |
| `TableHead` | Celda de encabezado |
| `TableCell` | Celda de datos |
| `TableCaption` | Caption de tabla |

#### Uso

```tsx
<Table>
  <TableCaption>Lista de usuarios</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Rol</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Juan Pérez</TableCell>
      <TableCell>juan@example.com</TableCell>
      <TableCell>Admin</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### DropdownMenu

**Archivo:** `src/components/ui/dropdown-menu.tsx`

Menú desplegable con opciones.

#### Subcomponentes

| Componente | Descripción |
|------------|-------------|
| `DropdownMenu` | Contenedor principal |
| `DropdownMenuTrigger` | Elemento que abre el menú |
| `DropdownMenuContent` | Contenido del menú |
| `DropdownMenuItem` | Item seleccionable |
| `DropdownMenuCheckboxItem` | Item con checkbox |
| `DropdownMenuRadioItem` | Item con radio |
| `DropdownMenuLabel` | Label no seleccionable |
| `DropdownMenuSeparator` | Separador |
| `DropdownMenuShortcut` | Atajo de teclado |
| `DropdownMenuGroup` | Grupo de items |
| `DropdownMenuSub` | Submenú |

#### Uso

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Menú</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Perfil</DropdownMenuItem>
    <DropdownMenuItem>Configuración</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Form

**Archivo:** `src/components/ui/form.tsx`

Integración de React Hook Form con componentes UI.

#### Contextos y Hooks

| Nombre | Descripción |
|--------|-------------|
| `Form` | Contenedor de formulario |
| `FormField` | Campo de formulario con contexto |
| `FormItem` | Item de formulario |
| `FormLabel` | Label del campo |
| `FormControl` | Control del input |
| `FormDescription` | Descripción del campo |
| `FormMessage` | Mensaje de error |
| `useFormField` | Hook para acceder al contexto |

#### Uso

```tsx
const form = useForm({
  resolver: zodResolver(formSchema),
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Tu nombre de usuario</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

---

### Toast / Toaster

**Archivos:**
- `src/components/ui/toast.tsx`
- `src/components/ui/toaster.tsx`

Sistema de notificaciones.

#### Hook

```tsx
const { toast } = useToast();
```

#### Uso

```tsx
toast({
  title: "Éxito",
  description: "Operación completada",
});

toast({
  title: "Error",
  description: "Algo salió mal",
  variant: "destructive",
});
```

#### Variantes

| Variante | Uso |
|----------|-----|
| `default` | Notificación normal |
| `destructive` | Errores o acciones críticas |

---

### Tooltip

**Archivo:** `src/components/ui/tooltip.tsx`

Tooltip informativo al hacer hover.

#### Uso

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Información adicional</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Utilidades

### cn() - Class Name Utils

**Archivo:** `src/lib/utils.ts`

Función para combinar clases CSS condicionalmente.

```tsx
import { cn } from "@/lib/utils";

// Uso básico
className={cn("base-class", conditional && "conditional-class")}

// Con variantes
className={cn(
  "btn",
  variant === "primary" && "btn-primary",
  variant === "secondary" && "btn-secondary",
  isLoading && "btn-loading"
)}
```

Combina:
- `clsx` - Condicionales de clases
- `tailwind-merge` - Resolución de conflictos Tailwind
