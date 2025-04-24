/*
  Warnings:

  - Added the required column `ciudad_procedencia` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pais_procedencia` to the `Huesped` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Huesped" ADD COLUMN     "ciudad_procedencia" TEXT NOT NULL,
ADD COLUMN     "pais_procedencia" TEXT NOT NULL;
