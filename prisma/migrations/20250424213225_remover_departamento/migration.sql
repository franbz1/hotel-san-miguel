/*
  Warnings:

  - You are about to drop the column `departamento_residencia` on the `Huesped` table. All the data in the column will be lost.
  - You are about to drop the column `departamento_residencia` on the `HuespedSecundario` table. All the data in the column will be lost.
  - You are about to drop the column `departamento_procedencia` on the `Reserva` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Huesped" DROP COLUMN "departamento_residencia";

-- AlterTable
ALTER TABLE "HuespedSecundario" DROP COLUMN "departamento_residencia";

-- AlterTable
ALTER TABLE "Reserva" DROP COLUMN "departamento_procedencia";
