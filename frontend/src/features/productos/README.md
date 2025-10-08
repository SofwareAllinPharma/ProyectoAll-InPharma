# Módulo de Productos

## Descripción
El módulo de productos permite gestionar el catálogo de productos finales que se fabrican a partir de las fórmulas desarrolladas. Incluye funcionalidades completas de CRUD con características avanzadas de cálculo y validación.

## Características Principales

### 🔍 Búsqueda Avanzada
- Búsqueda por nombre de producto
- Búsqueda por fórmula utilizada
- Búsqueda por ingredientes de la fórmula

### ⚖️ Modos de Cálculo Dual
- **Modo Peso Neto**: Calcula las porciones automáticamente basado en el peso neto
- **Modo Porciones**: Calcula el peso neto automáticamente basado en las porciones

### 📊 Información Nutricional
- Cálculo automático de calorías por porción
- Información nutricional derivada de la fórmula base
- Visualización clara de valores nutricionales

### 🎯 Funcionalidades CRUD
- ✅ **Crear**: Agregar nuevos productos con validaciones
- ✅ **Leer**: Visualizar lista completa con filtros
- ✅ **Actualizar**: Editar productos existentes
- ✅ **Eliminar**: Eliminación lógica (soft delete)

## Estructura del Módulo

```
productos/
├── components/          # Componentes reutilizables
│   ├── DeleteConfirmModal.tsx    # Modal de confirmación de eliminación
│   ├── InsumoActionModal.tsx     # Modal de acciones (ver/editar/eliminar)
│   ├── ProductoFormModal.tsx     # Modal de formulario (crear/editar)
│   ├── ProductosTable.tsx        # Tabla de productos
│   └── SearchBar.tsx            # Barra de búsqueda
├── pages/              # Páginas principales
│   └── ProductosPage.tsx        # Página principal del módulo
├── services/           # Servicios de API
│   └── producto.service.ts      # Servicio de comunicación con backend
├── types/              # Definiciones de tipos
│   └── producto.types.ts        # Tipos TypeScript
├── index.ts            # Archivo de exportación
└── README.md           # Este archivo
```

## Tipos y Interfaces

### Producto
```typescript
interface Producto {
  id?: string;
  nombre: string;
  descripcion?: string;
  formula_id: string;
  peso_neto: number;
  porciones: number;
  fecha_vencimiento?: Date;
  activo: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  // Relaciones
  formula?: Formula;
}
```

### Modos de Cálculo
```typescript
type CalculationMode = 'peso_neto' | 'porciones';
```

### Filtros de Búsqueda
```typescript
interface ProductSearchFilters {
  searchTerm: string;
  searchType: 'producto' | 'formula' | 'ingrediente';
}
```

## Uso del Módulo

### 1. Navegación
Acceder desde el panel de administración del sistema:
- Dashboard Admin → Productos

### 2. Operaciones Principales

#### Crear Producto
1. Hacer clic en "Agregar Producto"
2. Completar formulario:
   - Nombre del producto
   - Descripción (opcional)
   - Seleccionar fórmula base
   - Elegir modo de cálculo
   - Ingresar peso neto O porciones
   - Fecha de vencimiento (opcional)
3. El sistema calcula automáticamente el valor faltante
4. Confirmar creación

#### Buscar Productos
1. Utilizar la barra de búsqueda
2. Seleccionar tipo de búsqueda:
   - **Por Producto**: Busca en nombres de productos
   - **Por Fórmula**: Busca productos que usen una fórmula específica
   - **Por Ingrediente**: Busca productos cuyas fórmulas contengan un ingrediente
3. Los resultados se filtran en tiempo real

#### Editar Producto
1. Hacer clic en el botón de acciones (⋮)
2. Seleccionar "Editar"
3. Modificar los campos necesarios
4. El sistema recalcula automáticamente valores dependientes
5. Guardar cambios

#### Ver Detalles
1. Hacer clic en el botón de acciones (⋮)
2. Seleccionar "Ver"
3. Revisar información completa del producto
4. Ver información nutricional derivada

#### Eliminar Producto
1. Hacer clic en el botón de acciones (⋮)
2. Seleccionar "Eliminar"
3. Confirmar eliminación
4. El producto se marca como inactivo (eliminación lógica)

## Cálculos Automáticos

### Peso Neto → Porciones
```
porciones = peso_neto / formula.peso_unidad
```

### Porciones → Peso Neto
```
peso_neto = porciones * formula.peso_unidad
```

### Información Nutricional
```
calorias_por_porcion = (formula.calorias_total / formula.peso_total) * formula.peso_unidad
```

## Validaciones

### Frontend
- Nombre requerido (mínimo 2 caracteres)
- Fórmula requerida
- Peso neto o porciones debe ser > 0
- Fecha de vencimiento no puede ser pasada

### Backend
- Validación de integridad referencial con fórmulas
- Validación de unicidad de nombre
- Validaciones de rango numérico

## Integración con Otros Módulos

### Con Fórmulas
- Selección de fórmula base para cada producto
- Cálculo automático basado en peso_unidad de la fórmula
- Herencia de información nutricional

### Con Dashboard
- Contador de productos activos
- Estadísticas de ratio productos/fórmulas
- Visualización en el resumen general

## Tecnologías Utilizadas

- **React 18**: Framework principal
- **TypeScript**: Tipado estático
- **TailwindCSS**: Estilos y diseño responsivo
- **React Router**: Navegación
- **Portal API**: Modales
- **Fetch API**: Comunicación con backend

## Estados y Gestión

### Estados Locales
- `productos`: Lista de productos
- `loading`: Estado de carga
- `error`: Gestión de errores
- `formulas`: Lista de fórmulas disponibles
- `filters`: Filtros de búsqueda activos

### Estados de Modales
- `showCreateModal`: Modal de creación
- `showEditModal`: Modal de edición
- `showViewModal`: Modal de visualización
- `showDeleteModal`: Modal de confirmación
- `selectedProducto`: Producto seleccionado para operaciones

## Próximas Mejoras

- [ ] Exportación de datos a Excel/PDF
- [ ] Historial de cambios
- [ ] Gestión de lotes de producción
- [ ] Códigos de barras automáticos
- [ ] Integración con sistema de inventario
- [ ] Alertas de vencimiento
- [ ] Análisis de rentabilidad por producto