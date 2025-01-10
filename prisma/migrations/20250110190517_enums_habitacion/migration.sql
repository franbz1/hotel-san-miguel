/*
  Warnings:

  - Changed the type of `tipo` on the `Habitacion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `estado` on the `Habitacion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TiposHabitacion" AS ENUM ('UNA_CAMA', 'DOS_CAMAS', 'TRES_CAMAS', 'CUATRO_CAMAS');

-- CreateEnum
CREATE TYPE "EstadosHabitacion" AS ENUM ('LIBRE', 'OCUPADO', 'RESERVADO', 'EN_DESINFECCION', 'EN_MANTENIMIENTO', 'EN_LIMPIEZA');

-- AlterTable
ALTER TABLE "Habitacion" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TiposHabitacion" NOT NULL,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadosHabitacion" NOT NULL;
