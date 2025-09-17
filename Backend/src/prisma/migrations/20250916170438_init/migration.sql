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

-- CreateIndex
CREATE UNIQUE INDEX "PERSONA_mail_key" ON "public"."PERSONA"("mail");

-- CreateIndex
CREATE INDEX "SESION_email_idx" ON "public"."SESION"("email");

-- CreateIndex
CREATE INDEX "USUARIOxPERFIL_idPerfil_idx" ON "public"."USUARIOxPERFIL"("idPerfil");

-- CreateIndex
CREATE INDEX "USUARIOxPERFIL_mail_idx" ON "public"."USUARIOxPERFIL"("mail");

-- AddForeignKey
ALTER TABLE "public"."PERSONA" ADD CONSTRAINT "PERSONA_mail_fkey" FOREIGN KEY ("mail") REFERENCES "public"."USUARIO"("mail") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SESION" ADD CONSTRAINT "SESION_email_fkey" FOREIGN KEY ("email") REFERENCES "public"."USUARIO"("mail") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."USUARIOxPERFIL" ADD CONSTRAINT "USUARIOxPERFIL_mail_fkey" FOREIGN KEY ("mail") REFERENCES "public"."USUARIO"("mail") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."USUARIOxPERFIL" ADD CONSTRAINT "USUARIOxPERFIL_idPerfil_fkey" FOREIGN KEY ("idPerfil") REFERENCES "public"."PERFIL"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
