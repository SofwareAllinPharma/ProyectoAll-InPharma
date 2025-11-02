# Módulo de Pedidos - Frontend

Este módulo implementa la gestión completa de pedidos de elaboración en el frontend de All-In Pharma.

## Estructura del Módulo

```
features/pedidos/
├── components/
│   ├── form/
│   │   └── PedidoFormModal.tsx     # Modal para crear nuevos pedidos
│   ├── PedidoHistoryModal.tsx      # Modal para ver historial y acciones
│   ├── PedidoStats.tsx             # Componente de estadísticas
│   └── index.ts                    # Exportaciones de componentes
├── pages/
│   └── PedidosPage.tsx            # Página principal del módulo
├── services/
│   └── pedido.service.ts          # Servicio para comunicación con API
├── types/
│   └── pedido.types.ts            # Tipos TypeScript
└── index.ts                       # Exportaciones del módulo
```

## Funcionalidades Implementadas

### 1. Gestión de Pedidos

- **Visualización**: Lista completa de pedidos con paginación
- **Creación**: Modal para crear nuevos pedidos (solo administradores)
- **Filtrado**: Por estado (todos, pendientes, asignados/en proceso, finalizados)
- **Estadísticas**: Dashboard con contadores por estado

### 2. Workflow de Estados

El sistema implementa una máquina de estados completa:

1. **Pendiente** → Creado, esperando asignación
2. **Asignado** → Tomado por un técnico
3. **En elaboración** → Proceso de elaboración iniciado
4. **Finalizado** → Elaboración completada, esperando aprobación
5. **Aprobado** → Aprobado por administrador
6. **Rechazado** → Rechazado por administrador

### 3. Roles y Permisos

#### Administradores (adminsis/adminfab)

- Crear pedidos
- Ver todos los pedidos
- Tomar pedidos (adminfab)
- Aprobar/rechazar pedidos finalizados

#### Técnicos

- Ver pedidos asignados y disponibles
- Tomar pedidos pendientes
- Iniciar elaboración
- Finalizar elaboración

### 4. Componentes Principales

#### PedidosPage

- Página principal con tabla de pedidos
- Filtros por estado
- Estadísticas en tiempo real
- Acciones contextuales según rol

#### PedidoFormModal

- Formulario para crear pedidos
- Selector de productos
- Cálculo automático de equivalencias (gramos/paquetes/porciones)
- Validaciones de datos

#### PedidoHistoryModal

- Historial completo del pedido
- Información detallada del producto
- Acciones disponibles según estado y rol
- Seguimiento de cambios de estado

#### PedidoStats

- Dashboard de estadísticas
- Contadores por estado
- Vista rápida del estado general

### 5. Servicios API

El `PedidoService` incluye métodos para:

- Listar pedidos
- Crear pedidos
- Tomar pedidos
- Cambiar estados (iniciar, finalizar, aprobar, rechazar)

### 6. Integración con Backend

Se integra con las siguientes APIs del backend:

- `GET /pedidos` - Listar pedidos
- `POST /pedidos` - Crear pedido
- `POST /pedidos/:id/tomar` - Tomar pedido
- `POST /pedidos/:id/iniciar-elaboracion` - Iniciar elaboración
- `POST /pedidos/:id/finalizar-elaboracion` - Finalizar elaboración
- `POST /pedidos/:id/aprobar` - Aprobar pedido
- `POST /pedidos/:id/rechazar` - Rechazar pedido

## Uso del Módulo

### Importar en la aplicación:

```typescript
import { PedidosPage } from "./features/pedidos";
```

### Agregar ruta:

```typescript
{
  path: "/pedidos",
  element: <PedidosPage />,
}
```

## Características Técnicas

- **TypeScript**: Tipado completo con interfaces bien definidas
- **React Hooks**: useState, useEffect, useCallback para manejo de estado
- **Componentes Reutilizables**: Uso de componentes UI existentes (DataTable, Modal, etc.)
- **Manejo de Errores**: Integración con sistema de toast para notificaciones
- **Responsive**: Interfaz adaptable a diferentes tamaños de pantalla
- **Filtrado en Cliente**: Filtrado eficiente sin necesidad de consultas adicionales
- **Permisos**: Control de acceso basado en roles almacenados en localStorage

## Posibles Mejoras Futuras

1. **Filtros Avanzados**: Filtrar por fecha, producto, creador
2. **Búsqueda**: Buscador por número de pedido o producto
3. **Exportación**: Exportar listado a Excel/PDF
4. **Notificaciones**: Push notifications para cambios de estado
5. **Comentarios**: Sistema de comentarios en los cambios de estado
6. **Métricas**: Gráficos de productividad y tiempos de elaboración
