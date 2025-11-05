-- CreateTable
CREATE TABLE "public"."USUARIO" (
    "mail" VARCHAR(255) NOT NULL,
    "contraseña" VARCHAR(255) NOT NULL,

    CONSTRAINT "USUARIO_pkey" PRIMARY KEY ("mail")
);

-- CreateTable
CREATE TABLE "public"."PERSONA" (
    "dni" VARCHAR(32) NOT NULL,
    "mail" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(120),
    "apellido" VARCHAR(120),
    "telefono" VARCHAR(40),

    CONSTRAINT "PERSONA_pkey" PRIMARY KEY ("dni")
);

-- CreateTable
CREATE TABLE "public"."SESION" (
    "email" VARCHAR(255) NOT NULL,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3),

    CONSTRAINT "SESION_pkey" PRIMARY KEY ("email","fechaHoraInicio")
);

-- CreateTable
CREATE TABLE "public"."PERFIL" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" VARCHAR(255),

    CONSTRAINT "PERFIL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."USUARIOxPERFIL" (
    "mail" TEXT NOT NULL,
    "idPerfil" INTEGER NOT NULL,

    CONSTRAINT "USUARIOxPERFIL_pkey" PRIMARY KEY ("mail","idPerfil")
);

-- CreateTable
CREATE TABLE "public"."PASSWORD_RESET" (
    "mail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PASSWORD_RESET_pkey" PRIMARY KEY ("mail")
);

-- CreateTable
CREATE TABLE "public"."INSUMOS" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cal_100g" DOUBLE PRECISION NOT NULL,
    "grasasTotales_100g" DOUBLE PRECISION NOT NULL,
    "grasasTrans_100g" DOUBLE PRECISION NOT NULL,
    "grasasSaturadas_100g" DOUBLE PRECISION NOT NULL,
    "proteinas_100g" DOUBLE PRECISION NOT NULL,
    "carbohidratos_100g" DOUBLE PRECISION NOT NULL,
    "sodio_100g" DOUBLE PRECISION NOT NULL,
    "fibra_100g" DOUBLE PRECISION NOT NULL,
    "otro_100g" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "INSUMOS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FORMULA" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "porcion" DOUBLE PRECISION NOT NULL,
    "kcalorias" DOUBLE PRECISION NOT NULL,
    "kjuls" DOUBLE PRECISION NOT NULL,
    "grasaTotal" DOUBLE PRECISION NOT NULL,
    "grasaTrans" DOUBLE PRECISION NOT NULL,
    "grasaSaturada" DOUBLE PRECISION NOT NULL,
    "proteinas" DOUBLE PRECISION NOT NULL,
    "carbohidratos" DOUBLE PRECISION NOT NULL,
    "sodio" DOUBLE PRECISION NOT NULL,
    "fibra" DOUBLE PRECISION NOT NULL,
    "otros" DOUBLE PRECISION NOT NULL,
    "esProtegida" BOOLEAN NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FORMULA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FORMULAINSUMO" (
    "id" SERIAL NOT NULL,
    "idFormula" INTEGER NOT NULL,
    "idInsumo" INTEGER NOT NULL,
    "cantidadInsumo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FORMULAINSUMO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TIPOS_MOVIMIENTO" (
    "idTipoMovimiento" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,

    CONSTRAINT "TIPOS_MOVIMIENTO_pkey" PRIMARY KEY ("idTipoMovimiento")
);

-- CreateTable
CREATE TABLE "public"."MOVIMIENTO_PRODUCTO" (
    "idMovimiento" SERIAL NOT NULL,
    "fechaHoraActualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idDepositoOrigen" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "idDepositoDestino" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "responsable" VARCHAR(255) NOT NULL,
    "observaciones" TEXT,
    "idTipoMovimiento" INTEGER NOT NULL,

    CONSTRAINT "MOVIMIENTO_PRODUCTO_pkey" PRIMARY KEY ("idMovimiento")
);

-- CreateTable
CREATE TABLE "public"."ESTADO_MOVIMIENTO" (
    "idEstadoMovimiento" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,

    CONSTRAINT "ESTADO_MOVIMIENTO_pkey" PRIMARY KEY ("idEstadoMovimiento")
);

-- CreateTable
CREATE TABLE "public"."CAMBIO_ESTADO_MOVIMIENTO" (
    "idCambioEstadoMovimiento" SERIAL NOT NULL,
    "idEstadoMovimiento" INTEGER NOT NULL,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3),
    "responsable" VARCHAR(255),
    "responsableEntrega" VARCHAR(255),
    "responsableRecepcion" VARCHAR(255),
    "observaciones" TEXT,
    "idMovimiento" INTEGER NOT NULL,

    CONSTRAINT "CAMBIO_ESTADO_MOVIMIENTO_pkey" PRIMARY KEY ("idCambioEstadoMovimiento")
);

-- CreateTable
CREATE TABLE "public"."DEPOSITOS" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "capacidadTotal" INTEGER NOT NULL,
    "capacidadUsada" INTEGER NOT NULL DEFAULT 0,
    "estado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DEPOSITOS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PRODUCTOS" (
    "idProducto" SERIAL NOT NULL,
    "idFormula" INTEGER NOT NULL,
    "nombreComercial" TEXT NOT NULL,
    "pesoNeto" DOUBLE PRECISION NOT NULL,
    "cantPorcionesAportadas" INTEGER NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PRODUCTOS_pkey" PRIMARY KEY ("idProducto")
);

-- CreateTable
CREATE TABLE "public"."INVENTARIO" (
    "idDeposito" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "cantidadProducto" INTEGER NOT NULL DEFAULT 0,
    "umbralMin" INTEGER NOT NULL DEFAULT 0,
    "umbralMax" INTEGER,

    CONSTRAINT "INVENTARIO_pkey" PRIMARY KEY ("idDeposito","idProducto")
);

-- CreateTable
CREATE TABLE "public"."ESTADO_PEDIDO" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "ESTADO_PEDIDO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CAMBIO_ESTADO_PEDIDO" (
    "idCambioEstado" SERIAL NOT NULL,
    "idPedido" INTEGER NOT NULL,
    "idEstadoPedido" INTEGER NOT NULL,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3),

    CONSTRAINT "CAMBIO_ESTADO_PEDIDO_pkey" PRIMARY KEY ("idCambioEstado")
);

-- CreateTable
CREATE TABLE "public"."PEDIDOS" (
    "numPedido" SERIAL NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "cantAProducir_gramos" DOUBLE PRECISION NOT NULL,
    "cantAProducir_paquetes" DOUBLE PRECISION NOT NULL,
    "cantAProducir_porciones" DOUBLE PRECISION NOT NULL,
    "observacion" TEXT,
    "idCambioEstadoPedido" INTEGER,
    "mailUsuarioCreador" TEXT NOT NULL,
    "idPerfilCreador" INTEGER NOT NULL,
    "mailUsuarioCocinero" TEXT,
    "idPerfilCocinero" INTEGER,
    "estaAsignado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PEDIDOS_pkey" PRIMARY KEY ("numPedido")
);

-- CreateIndex
CREATE UNIQUE INDEX "PERSONA_mail_key" ON "public"."PERSONA"("mail");

-- CreateIndex
CREATE INDEX "SESION_email_idx" ON "public"."SESION"("email");

-- CreateIndex
CREATE INDEX "USUARIOxPERFIL_idPerfil_idx" ON "public"."USUARIOxPERFIL"("idPerfil");

-- CreateIndex
CREATE INDEX "USUARIOxPERFIL_mail_idx" ON "public"."USUARIOxPERFIL"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "INSUMOS_nombre_key" ON "public"."INSUMOS"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "FORMULA_nombre_key" ON "public"."FORMULA"("nombre");

-- CreateIndex
CREATE INDEX "FORMULA_nombre_activo_idx" ON "public"."FORMULA"("nombre", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "TIPOS_MOVIMIENTO_nombre_key" ON "public"."TIPOS_MOVIMIENTO"("nombre");

-- CreateIndex
CREATE INDEX "MOVIMIENTO_PRODUCTO_idDepositoOrigen_idProducto_idx" ON "public"."MOVIMIENTO_PRODUCTO"("idDepositoOrigen", "idProducto");

-- CreateIndex
CREATE INDEX "MOVIMIENTO_PRODUCTO_idDepositoDestino_idProducto_idx" ON "public"."MOVIMIENTO_PRODUCTO"("idDepositoDestino", "idProducto");

-- CreateIndex
CREATE INDEX "MOVIMIENTO_PRODUCTO_idTipoMovimiento_idx" ON "public"."MOVIMIENTO_PRODUCTO"("idTipoMovimiento");

-- CreateIndex
CREATE UNIQUE INDEX "ESTADO_MOVIMIENTO_nombre_key" ON "public"."ESTADO_MOVIMIENTO"("nombre");

-- CreateIndex
CREATE INDEX "CAMBIO_ESTADO_MOVIMIENTO_idEstadoMovimiento_idx" ON "public"."CAMBIO_ESTADO_MOVIMIENTO"("idEstadoMovimiento");

-- CreateIndex
CREATE INDEX "CAMBIO_ESTADO_MOVIMIENTO_idMovimiento_idx" ON "public"."CAMBIO_ESTADO_MOVIMIENTO"("idMovimiento");

-- CreateIndex
CREATE UNIQUE INDEX "DEPOSITOS_nombre_key" ON "public"."DEPOSITOS"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PRODUCTOS_nombreComercial_key" ON "public"."PRODUCTOS"("nombreComercial");

-- CreateIndex
CREATE INDEX "PRODUCTOS_nombreComercial_estaActivo_idx" ON "public"."PRODUCTOS"("nombreComercial", "estaActivo");

-- CreateIndex
CREATE INDEX "INVENTARIO_idDeposito_idx" ON "public"."INVENTARIO"("idDeposito");

-- CreateIndex
CREATE INDEX "INVENTARIO_idProducto_idx" ON "public"."INVENTARIO"("idProducto");

-- CreateIndex
CREATE UNIQUE INDEX "ESTADO_PEDIDO_nombre_key" ON "public"."ESTADO_PEDIDO"("nombre");

-- CreateIndex
CREATE INDEX "ESTADO_PEDIDO_nombre_idx" ON "public"."ESTADO_PEDIDO"("nombre");

-- CreateIndex
CREATE INDEX "CAMBIO_ESTADO_PEDIDO_idPedido_idx" ON "public"."CAMBIO_ESTADO_PEDIDO"("idPedido");

-- CreateIndex
CREATE INDEX "CAMBIO_ESTADO_PEDIDO_idEstadoPedido_idx" ON "public"."CAMBIO_ESTADO_PEDIDO"("idEstadoPedido");

-- CreateIndex
CREATE UNIQUE INDEX "PEDIDOS_idCambioEstadoPedido_key" ON "public"."PEDIDOS"("idCambioEstadoPedido");

-- CreateIndex
CREATE INDEX "PEDIDOS_estaAsignado_createdAt_idx" ON "public"."PEDIDOS"("estaAsignado", "createdAt");

-- CreateIndex
CREATE INDEX "PEDIDOS_idProducto_idx" ON "public"."PEDIDOS"("idProducto");

-- CreateIndex
CREATE INDEX "PEDIDOS_mailUsuarioCreador_idPerfilCreador_idx" ON "public"."PEDIDOS"("mailUsuarioCreador", "idPerfilCreador");

-- CreateIndex
CREATE INDEX "PEDIDOS_mailUsuarioCocinero_idPerfilCocinero_idx" ON "public"."PEDIDOS"("mailUsuarioCocinero", "idPerfilCocinero");

-- AddForeignKey
ALTER TABLE "public"."PERSONA" ADD CONSTRAINT "PERSONA_mail_fkey" FOREIGN KEY ("mail") REFERENCES "public"."USUARIO"("mail") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SESION" ADD CONSTRAINT "SESION_email_fkey" FOREIGN KEY ("email") REFERENCES "public"."USUARIO"("mail") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."USUARIOxPERFIL" ADD CONSTRAINT "USUARIOxPERFIL_mail_fkey" FOREIGN KEY ("mail") REFERENCES "public"."USUARIO"("mail") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."USUARIOxPERFIL" ADD CONSTRAINT "USUARIOxPERFIL_idPerfil_fkey" FOREIGN KEY ("idPerfil") REFERENCES "public"."PERFIL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PASSWORD_RESET" ADD CONSTRAINT "PASSWORD_RESET_mail_fkey" FOREIGN KEY ("mail") REFERENCES "public"."USUARIO"("mail") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FORMULAINSUMO" ADD CONSTRAINT "FORMULAINSUMO_idFormula_fkey" FOREIGN KEY ("idFormula") REFERENCES "public"."FORMULA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FORMULAINSUMO" ADD CONSTRAINT "FORMULAINSUMO_idInsumo_fkey" FOREIGN KEY ("idInsumo") REFERENCES "public"."INSUMOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MOVIMIENTO_PRODUCTO" ADD CONSTRAINT "MOVIMIENTO_PRODUCTO_idDepositoOrigen_idProducto_fkey" FOREIGN KEY ("idDepositoOrigen", "idProducto") REFERENCES "public"."INVENTARIO"("idDeposito", "idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MOVIMIENTO_PRODUCTO" ADD CONSTRAINT "MOVIMIENTO_PRODUCTO_idDepositoDestino_idProducto_fkey" FOREIGN KEY ("idDepositoDestino", "idProducto") REFERENCES "public"."INVENTARIO"("idDeposito", "idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MOVIMIENTO_PRODUCTO" ADD CONSTRAINT "MOVIMIENTO_PRODUCTO_idTipoMovimiento_fkey" FOREIGN KEY ("idTipoMovimiento") REFERENCES "public"."TIPOS_MOVIMIENTO"("idTipoMovimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CAMBIO_ESTADO_MOVIMIENTO" ADD CONSTRAINT "CAMBIO_ESTADO_MOVIMIENTO_idEstadoMovimiento_fkey" FOREIGN KEY ("idEstadoMovimiento") REFERENCES "public"."ESTADO_MOVIMIENTO"("idEstadoMovimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CAMBIO_ESTADO_MOVIMIENTO" ADD CONSTRAINT "CAMBIO_ESTADO_MOVIMIENTO_idMovimiento_fkey" FOREIGN KEY ("idMovimiento") REFERENCES "public"."MOVIMIENTO_PRODUCTO"("idMovimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PRODUCTOS" ADD CONSTRAINT "PRODUCTOS_idFormula_fkey" FOREIGN KEY ("idFormula") REFERENCES "public"."FORMULA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."INVENTARIO" ADD CONSTRAINT "INVENTARIO_idDeposito_fkey" FOREIGN KEY ("idDeposito") REFERENCES "public"."DEPOSITOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."INVENTARIO" ADD CONSTRAINT "INVENTARIO_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "public"."PRODUCTOS"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CAMBIO_ESTADO_PEDIDO" ADD CONSTRAINT "CAMBIO_ESTADO_PEDIDO_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "public"."PEDIDOS"("numPedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CAMBIO_ESTADO_PEDIDO" ADD CONSTRAINT "CAMBIO_ESTADO_PEDIDO_idEstadoPedido_fkey" FOREIGN KEY ("idEstadoPedido") REFERENCES "public"."ESTADO_PEDIDO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PEDIDOS" ADD CONSTRAINT "PEDIDOS_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "public"."PRODUCTOS"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PEDIDOS" ADD CONSTRAINT "PEDIDOS_idCambioEstadoPedido_fkey" FOREIGN KEY ("idCambioEstadoPedido") REFERENCES "public"."CAMBIO_ESTADO_PEDIDO"("idCambioEstado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PEDIDOS" ADD CONSTRAINT "PEDIDOS_mailUsuarioCreador_idPerfilCreador_fkey" FOREIGN KEY ("mailUsuarioCreador", "idPerfilCreador") REFERENCES "public"."USUARIOxPERFIL"("mail", "idPerfil") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PEDIDOS" ADD CONSTRAINT "PEDIDOS_mailUsuarioCocinero_idPerfilCocinero_fkey" FOREIGN KEY ("mailUsuarioCocinero", "idPerfilCocinero") REFERENCES "public"."USUARIOxPERFIL"("mail", "idPerfil") ON DELETE SET NULL ON UPDATE CASCADE;
