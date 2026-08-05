# Estado — Integración de inventario (Woo ↔ All-In-Pharma)

> Handoff para continuar (última sesión: 2026-08-05, branch `fix/bugs-auditoria`).

## Misión
Control de inventario para no sobrevender (el "problema del sábado"): el stock
real de la fábrica y el de WooCommerce tienen que estar sincronizados. Modelo
nuevo: **las cajas son la fuente de verdad del stock** (el `Inventario` agregado
viejo NO se usa). Es un **puente hasta "One Factory"** (repo 1brain ya disponible).

Flujo físico: elaboración → **depósito Atrás** → **Intermedio** → **Estantería** →
venta (mostrador o retiro por compra web). FIFO por lote, doble firma en
producción y traslados, venta rápida sin doble firma.

## Branch y deploy
- Trabajo en `fix/bugs-auditoria`; deploy en `modifMain` (merge por PR).
- Dominios: `allinpharma.farmaceuticosasociados.com` (front) · `api.allinpharma.farmaceuticosasociados.com`.
- El backend corre `prisma migrate deploy` al arrancar (Dockerfile CMD) → las
  migraciones se aplican solas en el deploy. **Local:** `docker compose up -d && npx prisma migrate deploy`.
- **Verificar build del front SIEMPRE con `tsc -b` o `npm run build`** (nunca `tsc --noEmit`: el tsconfig raíz de Vite tiene `files:[]` y es un falso OK).

## Hecho (slices 1–6a) ✅
1. **SKU** en Producto (mapeo con Woo, único, case preservado).
2. **Lote + Caja** (`LOTE`, `CAJA`): nº autogenerado editable, vencimiento, caja parcial.
3. **Finalizar elaboración** crea Lote+Cajas en Atrás + `diasVencimiento` en Producto.
4. **Traslado** de cajas entre depósitos (FIFO + doble firma, `MOVIMIENTO_CAJA`) + vista de stock por cajas/lote (reemplazó el tab viejo).
5. **Egreso/venta** por unidades FIFO desde estantería (`EGRESO_CAJA`, sin doble firma).
6a. **Backend integración Woo**: `POST /integracion/venta-woo` (API key `x-api-key`, idempotente por `orderId` → `WOO_ORDER_PROCESADA`); webhook saliente a n8n (`N8N_STOCK_WEBHOOK_URL`) cuando cambia estantería.

Endpoints nuevos: `/lotes` (list/detail), `/lotes/stock/deposito/:id`, `/lotes/traslado`, `/lotes/egreso`, `/integracion/venta-woo`.

## Falta (para cerrar) ⬜
- **6b — Workflows en n8n** (usar skills de n8n):
  - Woo *order created* → n8n → `POST /integracion/venta-woo` con `{ orderId, items:[{sku, unidades}] }` + header `x-api-key`.
  - AIP avisa (webhook a `N8N_STOCK_WEBHOOK_URL`, body `{ productos:[{sku, unidades}] }`) → n8n actualiza stock del producto en Woo por SKU.
  - Necesita: URL/acceso a n8n + credenciales de Woo cargadas en n8n.
- **6c — Código (sin dependencias):** re-apuntar alertas del `PuntoVentaDashboard`
  (hoy leen el `Inventario` viejo) al stock por cajas; borrar código huérfano
  (`StockGlobalTab`, `StockGlobalTable`, etc.).

## Config que debe hacer Juani (deployado + DB arriba)
1. Crear **3 depósitos** con nombres EXACTOS: `Fábrica-Atrás`, `Intermedio`, `Estantería` (o cambiar `frontend/src/features/inventario/depositosConfig.ts`). Con umbral mínimo.
2. **SKU** en cada producto = SKU en Woo.
3. **Días de vencimiento** en cada producto.
4. Usuario de **Millie** con rol ADMINFAB (desde panel adminsis).
5. Env nuevas (backend `.env` + Dokploy): `INTEGRATION_API_KEY` (secreto random) y `N8N_STOCK_WEBHOOK_URL`.

## Notas
- Docs de contexto más ricos (fuera del repo, en la máquina Windows): `C:\matrix\ultra-farm\tecnologia\` → `MODELO-INVENTARIO.md`, `RELEVAMIENTO-FABRICA.md`, `RESUMEN-SISTEMAS.md`, `PRD-PowerFarm-SmartFood.md`. Traerlos si no están sincronizados en la Mac.
- Pendiente seguridad: **revocar la API key de Groq** que se pegó en el chat (console.groq.com/keys).
