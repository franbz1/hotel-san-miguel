/*
  Warnings:

  - You are about to drop the column `desinfeccion` on the `RegistroAseoZonaComun` table. All the data in the column will be lost.
  - You are about to drop the column `limpieza` on the `RegistroAseoZonaComun` table. All the data in the column will be lost.
  - You are about to drop the `RegistroAseoZonaLavado` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ZonaLavado` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RegistroAseoZonaLavado" DROP CONSTRAINT "RegistroAseoZonaLavado_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "RegistroAseoZonaLavado" DROP CONSTRAINT "RegistroAseoZonaLavado_zonaLavadoId_fkey";

-- AlterTable
ALTER TABLE "RegistroAseoZonaComun" DROP COLUMN "desinfeccion",
DROP COLUMN "limpieza",
ADD COLUMN     "tipos_realizados" "TiposAseo"[];

-- DropTable
DROP TABLE "RegistroAseoZonaLavado";

-- DropTable
DROP TABLE "ZonaLavado";
