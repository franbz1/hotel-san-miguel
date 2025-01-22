/*
  Warnings:

  - Added the required column `ciudad_procedencia` to the `HuespedSecundario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HuespedSecundario" ADD COLUMN     "ciudad_procedencia" TEXT NOT NULL;
