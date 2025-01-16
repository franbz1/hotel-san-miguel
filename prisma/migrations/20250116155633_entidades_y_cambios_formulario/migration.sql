-- CreateTable
CREATE TABLE "LinkFormulario" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "expirado" BOOLEAN NOT NULL DEFAULT false,
    "vencimiento" TIMESTAMP(3) NOT NULL,
    "formularioId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LinkFormulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formulario" (
    "id" SERIAL NOT NULL,
    "huespedId" INTEGER NOT NULL,
    "reservaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Formulario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinkFormulario_formularioId_key" ON "LinkFormulario"("formularioId");

-- CreateIndex
CREATE INDEX "LinkFormulario_deleted_idx" ON "LinkFormulario"("deleted");

-- CreateIndex
CREATE INDEX "Formulario_deleted_idx" ON "Formulario"("deleted");

-- AddForeignKey
ALTER TABLE "LinkFormulario" ADD CONSTRAINT "LinkFormulario_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "Formulario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulario" ADD CONSTRAINT "Formulario_huespedId_fkey" FOREIGN KEY ("huespedId") REFERENCES "Huesped"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulario" ADD CONSTRAINT "Formulario_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
