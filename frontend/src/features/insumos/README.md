# Módulo de Gestión de Insumos 🧪

## Descripción

Módulo frontend completo para el CRUD (Crear, Leer, Actualizar, Eliminar) de insumos nutricionales, desarrollado con React + TypeScript siguiendo la arquitectura existente del proyecto All-In Pharma.

## 🚀 Características

### ✅ Funcionalidades Implementadas

- **📋 Listado de Insumos**: Tabla responsiva con información nutricional completa
- **🔍 Búsqueda en Tiempo Real**: Filtrado instantáneo por nombre de insumo
- **➕ Crear Insumo**: Modal con formulario completo para nuevos insumos
- **✏️ Editar Insumo**: Doble clic en tabla para editar insumos existentes
- **🗑️ Eliminar Insumo**: Confirmación segura antes de eliminar
- **📱 Responsive Design**: Funciona perfectamente en móviles y desktop
- **⚡ Validaciones**: Validación de formularios y manejo de errores
- **🎨 UI Consistente**: Sigue la paleta de colores del proyecto (#5d5448, #f5f1e8)

### 🎯 Interactividad

- **Doble clic** en cualquier fila de la tabla abre el menú de acciones
- **Búsqueda instantánea** mientras escribes
- **Feedback visual** en todas las acciones (loading, éxito, error)
- **Navegación por teclado** (ESC para cerrar modales)

## 📁 Estructura del Módulo

```
src/features/insumos/
├── components/           # Componentes reutilizables
│   ├── InsumosTable.tsx     # Tabla principal con datos
│   ├── SearchBar.tsx        # Barra de búsqueda
│   ├── InsumoActionModal.tsx # Modal de acciones (editar/eliminar)
│   ├── InsumoFormModal.tsx   # Modal de formulario (crear/editar)
│   └── DeleteConfirmModal.tsx # Modal de confirmación de eliminación
├── pages/               # Páginas principales
│   └── InsumosPage.tsx     # Página principal que integra todo
├── services/            # Servicios API
│   └── insumo.service.ts   # Comunicación con backend
├── types/               # Definiciones TypeScript
│   └── insumo.types.ts     # Interfaces y tipos
└── index.ts             # Exportaciones del módulo
```

## 🔧 Componentes

### `InsumosTable`

Tabla responsiva que muestra todos los insumos con:

- Información nutricional completa por 100g
- Formateo automático de números
- Filas alternadas para mejor legibilidad
- Hover effects y cursor pointer
- Contador de resultados

### `SearchBar`

Barra de búsqueda con:

- Búsqueda en tiempo real
- Botón de limpiar búsqueda
- Iconos SVG integrados
- Focus automático

### `InsumoActionModal`

Modal que aparece con doble clic, ofrece:

- **Editar Insumo**: Abre formulario de edición
- **Eliminar Insumo**: Abre confirmación de eliminación
- **Cancelar**: Cierra el modal
- Información del insumo seleccionado

### `InsumoFormModal`

Formulario completo para crear/editar con:

- Campos para todos los valores nutricionales
- Validaciones en tiempo real
- Soporte para decimales
- Estados de loading
- Diferenciación visual entre crear y editar

### `DeleteConfirmModal`

Confirmación de eliminación con:

- Warning visual claro
- Información del insumo a eliminar
- Botones de confirmación y cancelación
- Estados de loading durante eliminación

## 🌐 Integración con Backend

### API Service (`InsumoService`)

Maneja todas las comunicaciones con el backend:

```typescript
// Obtener todos los insumos
await InsumoService.getAllInsumos();

// Crear nuevo insumo
await InsumoService.createInsumo(insumoData);

// Actualizar insumo existente
await InsumoService.updateInsumo(id, insumoData);

// Eliminar insumo
await InsumoService.deleteInsumo(id);

// Búsqueda por nombre
await InsumoService.searchInsumos(searchTerm);
```

### Endpoints Utilizados

- `GET /api/insumos` - Obtener todos los insumos
- `GET /api/insumos/:id` - Obtener insumo por ID
- `POST /api/insumos` - Crear nuevo insumo
- `PUT /api/insumos/:id` - Actualizar insumo
- `DELETE /api/insumos/:id` - Eliminar insumo

## 🎨 Diseño y UX

### Paleta de Colores

- **Primary**: `#5d5448` (Brand Brown)
- **Secondary**: `#f5f1e8` (Brand Beige)
- **Accent Colors**: Red para eliminar, Green para éxito
- **Grays**: Escala de grises para texto y borders

### Patrones de Diseño

- **Modales**: Portal-based modals con backdrop
- **Buttons**: Consistente con el sistema de diseño
- **Forms**: Grid responsive para campos
- **Tables**: Hover states y alternating rows
- **Loading States**: Spinners y disabled states

## 🚀 Cómo Usar

### 1. Acceso desde Dashboard Admin

- Navegar al Dashboard de Administrador
- Hacer clic en "Insumos" en el sidebar
- O usar el acceso rápido desde la vista de resumen

### 2. Gestionar Insumos

- **Ver lista**: La tabla se carga automáticamente
- **Buscar**: Escribir en la barra de búsqueda
- **Crear**: Hacer clic en "Agregar Insumo"
- **Editar**: Doble clic en cualquier fila → "Editar Insumo"
- **Eliminar**: Doble clic en cualquier fila → "Eliminar Insumo"

### 3. Formulario de Insumo

Campos disponibles (todos por 100g):

- **Nombre**: Texto único requerido
- **Calorías**: Número decimal
- **Grasas Totales**: En gramos
- **Grasas Trans**: En gramos
- **Grasas Saturadas**: En gramos
- **Proteínas**: En gramos
- **Carbohidratos**: En gramos
- **Sodio**: En gramos
- **Fibra**: En gramos
- **Otros**: En gramos

## 🔧 Configuración Técnica

### Variables de Entorno

```env
VITE_API_URL=http://localhost:3000  # URL del backend
```

### TypeScript

Todos los tipos están definidos en `insumo.types.ts`:

- `Insumo`: Interfaz completa del insumo
- `CreateInsumoDto`: Para crear nuevos insumos
- `UpdateInsumoDto`: Para actualizar insumos existentes

### Manejo de Errores

- Captura de errores en todas las operaciones API
- Mensajes user-friendly
- Estados de loading durante operaciones
- Rollback automático en caso de error

## 🧪 Testing Manual

### Casos de Prueba

1. **Carga inicial**: Verificar que se cargan los insumos
2. **Búsqueda**: Probar filtros por nombre
3. **Crear insumo**: Validar formulario y creación
4. **Editar insumo**: Modificar datos existentes
5. **Eliminar insumo**: Confirmar eliminación
6. **Responsividad**: Probar en diferentes tamaños
7. **Navegación**: Verificar flujos entre modales

### Validaciones

- ✅ Nombres únicos de insumos
- ✅ Valores numéricos no negativos
- ✅ Campos requeridos marcados
- ✅ Feedback visual de errores
- ✅ Estados de loading apropiados

## 🔮 Posibles Mejoras Futuras

- **🔍 Filtros Avanzados**: Por rangos nutricionales
- **📊 Gráficos**: Visualización de datos nutricionales
- **📁 Categorías**: Agrupación de insumos por tipo
- **📤 Exportar**: Excel/PDF de la lista de insumos
- **🔄 Historial**: Tracking de cambios en insumos
- **🔐 Permisos**: Control de acceso por roles
- **📱 Modo Offline**: Cache local para mejor UX

---

**Desarrollado para All-In Pharma** 💊⚗️
Módulo completo de gestión de insumos nutricionales
