/*
  Warnings:

  - You are about to drop the column `SubidoASubir` on the `Formulario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Formulario" DROP COLUMN "SubidoASubir",
ADD COLUMN     "SubidoASire" BOOLEAN NOT NULL DEFAULT false;
