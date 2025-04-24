/*
  Warnings:

  - Added the required column `pais_procedencia` to the `HuespedSecundario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HuespedSecundario" ADD COLUMN     "pais_procedencia" TEXT NOT NULL;
