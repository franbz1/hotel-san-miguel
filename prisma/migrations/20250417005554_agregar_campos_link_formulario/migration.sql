/*
  Warnings:

  - Added the required column `costo` to the `LinkFormulario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaFin` to the `LinkFormulario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaInicio` to the `LinkFormulario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroHabitacion` to the `LinkFormulario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LinkFormulario" ADD COLUMN     "costo" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fechaFin" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaInicio" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "numeroHabitacion" INTEGER NOT NULL;
