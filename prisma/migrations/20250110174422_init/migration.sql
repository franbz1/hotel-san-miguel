-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'CAJERO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Huesped" (
    "id" SERIAL NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "primer_apellido" TEXT NOT NULL,
    "segundo_apellido" TEXT,
    "nombres" TEXT NOT NULL,
    "pais_residencia" TEXT NOT NULL,
    "departamento_residencia" TEXT NOT NULL,
    "ciudad_residencia" TEXT NOT NULL,
    "lugar_nacimiento" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "ocupacion" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Huesped_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HuespedSecundario" (
    "id" SERIAL NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "primer_apellido" TEXT NOT NULL,
    "segundo_apellido" TEXT,
    "nombres" TEXT NOT NULL,
    "pais_residencia" TEXT NOT NULL,
    "departamento_residencia" TEXT NOT NULL,
    "ciudad_residencia" TEXT NOT NULL,
    "lugar_nacimiento" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "ocupacion" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "huespedId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HuespedSecundario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "huespedId" INTEGER,
    "huespedSecundarioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" SERIAL NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'RESERVADO',
    "pais_procedencia" TEXT NOT NULL,
    "departamento_procedencia" TEXT NOT NULL,
    "ciudad_procedencia" TEXT NOT NULL,
    "pais_destino" TEXT NOT NULL,
    "motivo_viaje" TEXT NOT NULL,
    "check_in" TIMESTAMP(3) NOT NULL,
    "check_out" TIMESTAMP(3) NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL,
    "numero_acompaniantes" INTEGER NOT NULL,
    "habitacionId" INTEGER NOT NULL,
    "huespedId" INTEGER NOT NULL,
    "facturaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habitacion" (
    "id" SERIAL NOT NULL,
    "numero_habitacion" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'UNACAMA',
    "estado" TEXT NOT NULL DEFAULT 'LIBRE',
    "precio_por_noche" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Habitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" SERIAL NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "fecha_factura" TIMESTAMP(3) NOT NULL,
    "huespedId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Factura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Usuario_deleted_idx" ON "Usuario"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "Huesped_numero_documento_key" ON "Huesped"("numero_documento");

-- CreateIndex
CREATE INDEX "Huesped_numero_documento_idx" ON "Huesped"("numero_documento");

-- CreateIndex
CREATE INDEX "Huesped_deleted_idx" ON "Huesped"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "HuespedSecundario_numero_documento_key" ON "HuespedSecundario"("numero_documento");

-- CreateIndex
CREATE INDEX "HuespedSecundario_numero_documento_idx" ON "HuespedSecundario"("numero_documento");

-- CreateIndex
CREATE INDEX "HuespedSecundario_deleted_idx" ON "HuespedSecundario"("deleted");

-- CreateIndex
CREATE INDEX "Documento_huespedId_idx" ON "Documento"("huespedId");

-- CreateIndex
CREATE INDEX "Documento_huespedSecundarioId_idx" ON "Documento"("huespedSecundarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_facturaId_key" ON "Reserva"("facturaId");

-- CreateIndex
CREATE INDEX "Reserva_huespedId_idx" ON "Reserva"("huespedId");

-- CreateIndex
CREATE INDEX "Reserva_deleted_idx" ON "Reserva"("deleted");

-- CreateIndex
CREATE UNIQUE INDEX "Habitacion_numero_habitacion_key" ON "Habitacion"("numero_habitacion");

-- CreateIndex
CREATE INDEX "Habitacion_deleted_idx" ON "Habitacion"("deleted");

-- CreateIndex
CREATE INDEX "Factura_deleted_idx" ON "Factura"("deleted");

-- AddForeignKey
ALTER TABLE "HuespedSecundario" ADD CONSTRAINT "HuespedSecundario_huespedId_fkey" FOREIGN KEY ("huespedId") REFERENCES "Huesped"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_huespedId_fkey" FOREIGN KEY ("huespedId") REFERENCES "Huesped"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_huespedSecundarioId_fkey" FOREIGN KEY ("huespedSecundarioId") REFERENCES "HuespedSecundario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_huespedId_fkey" FOREIGN KEY ("huespedId") REFERENCES "Huesped"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "Habitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_huespedId_fkey" FOREIGN KEY ("huespedId") REFERENCES "Huesped"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
