# 🏢 Sistema de Depósitos - AllInPharma

## 📋 Visión General

El sistema utiliza depósitos con **IDs fijos** para garantizar consistencia en las operaciones de producción y movimientos de stock.

## 🎯 Depósitos Principales

### 1. Farmacia (Local Comercial)
- **ID:** `1`
- **Nombre:** `Farmacia`
- **Dirección:** `Belgrano 2005`
- **Responsable:** Encargado de Punto de Venta
- **Capacidad:** `2000` unidades
- **Protegido:** ✅ `true` (no se puede eliminar)

**Función:** Punto de venta donde se comercializan los productos. Los movimientos de egreso (ventas) salen de este depósito.

### 2. Fábrica
- **ID:** `2`
- **Nombre:** `Fábrica`
- **Dirección:** `Asmar 444`
- **Responsable:** Administrador de Fábrica
- **Capacidad:** `5000` unidades
- **Protegido:** ✅ `true` (no se puede eliminar)

**Función:** Centro de producción donde se deposita automáticamente el stock al finalizar los pedidos de elaboración.

## 🔄 Flujo de Operaciones

### 📦 Pedidos de Elaboración

```
1. Crear Pedido → Estado: "Creado"
2. Asignar Cocinero → Estado: "EnElaboración"
3. Finalizar Elaboración → Estado: "ElaboradoYDepositadoEnFábrica"
   └─> Stock se deposita automáticamente en Fábrica (ID=2)
```

**Código relevante:** `pedidos.service.ts → finalizarElaboracion()`

### 🚚 Movimientos de Traslado

Permiten mover productos entre depósitos:

```
Fábrica (ID=2) ──Traslado──> Farmacia (ID=1)
```

**Estados del movimiento:**
1. **Creado** → Se descuenta del depósito origen
2. **EnCamino** → En tránsito
3. **Entregado** → Se suma al depósito destino
4. **Cancelado** → Se revierte la operación

**Código relevante:** `movimiento.service.ts → registrarMovimiento()`, `CambiarEstado()`

### 🛒 Movimientos de Egreso (Ventas)

Productos que salen de la farmacia sin destino:

```
Farmacia (ID=1) ──Egreso──> Cliente
```

**Estados del egreso:**
1. **Creado** → Se descuenta del depósito origen
2. **EnCamino** → En proceso de entrega
3. **Vendido/Entregado** → Completado
4. **Cancelado** → Se devuelve al inventario

## 🔐 Validaciones Importantes

### Capacidad de Depósitos
- Al crear un traslado: valida que hay stock suficiente en origen
- Al entregar un traslado: valida que hay capacidad en destino
- Si se excede la capacidad: retorna error `CAPACITY_EXCEEDED` (HTTP 409)

### Depósitos Protegidos
- Los depósitos con `esProtegido = true` **no pueden eliminarse**
- Farmacia y Fábrica están protegidos por defecto
- Validación en: `depositos.service.ts → deactivate()`

## 🗄️ Estructura de Base de Datos

### Modelo Deposito
```prisma
model Deposito {
  id             Int          @id @default(autoincrement())
  nombre         String       @unique
  direccion      String
  responsable    String
  capacidadTotal Int
  capacidadUsada Int          @default(0)
  estado         Boolean      @default(true)
  esProtegido    Boolean      @default(false)
  inventario     Inventario[]
}
```

### Modelo Inventario
```prisma
model Inventario {
  idDeposito       Int
  idProducto       Int
  cantidadProducto Int
  umbralMin        Int?
  umbralMax        Int?
  
  deposito   Deposito @relation(...)
  producto   Producto @relation(...)
  
  @@id([idDeposito, idProducto])
}
```

## 🚀 Seeds

### Producción (`seed.prod.ts`)
```typescript
// Depósitos con IDs fijos
{ id: 1, nombre: 'Farmacia', direccion: 'Belgrano 2005', ... }
{ id: 2, nombre: 'Fábrica', direccion: 'Asmar 444', ... }
```

### Desarrollo (`seed.dev.ts`)
- Misma estructura que producción
- Incluye inventario de ejemplo en ambos depósitos
- Genera movimientos históricos de prueba

## 📊 Consultas Útiles

### Obtener stock en Farmacia
```typescript
const stockFarmacia = await prisma.inventario.findMany({
  where: { idDeposito: 1 },
  include: { producto: true }
});
```

### Obtener stock en Fábrica
```typescript
const stockFabrica = await prisma.inventario.findMany({
  where: { idDeposito: 2 },
  include: { producto: true }
});
```

### Verificar capacidad disponible
```typescript
const deposito = await prisma.deposito.findUnique({ where: { id: 1 } });
const disponible = deposito.capacidadTotal - deposito.capacidadUsada;
```

## ⚠️ Notas Importantes

1. **No hardcodear IDs en el frontend:** Usar nombres de depósitos para filtros y consultas
2. **Validar antes de operaciones:** Siempre verificar existencia y capacidad
3. **Errores de capacidad:** Manejar el código `CAPACITY_EXCEEDED` en el frontend
4. **Seed obligatorio:** Los depósitos deben existir antes de crear pedidos o movimientos

## 🔧 Mantenimiento

### Cambiar capacidad de un depósito
```http
PUT /depositos/1
Content-Type: application/json

{
  "capacidadTotal": 3000
}
```

### Cambiar responsable
```http
PUT /depositos/2
Content-Type: application/json

{
  "responsable": "Nuevo Responsable"
}
```

---

**Última actualización:** 2025-12-13
**Versión:** 1.0
