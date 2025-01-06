/*
  Warnings:

  - A unique constraint covering the columns `[numero_habitacion]` on the table `Habitacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Habitacion_numero_habitacion_key" ON "Habitacion"("numero_habitacion");
