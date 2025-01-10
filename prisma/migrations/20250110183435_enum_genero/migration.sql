/*
  Warnings:

  - Changed the type of `genero` on the `Huesped` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');

-- AlterTable
ALTER TABLE "Huesped" DROP COLUMN "genero",
ADD COLUMN     "genero" "Genero" NOT NULL;
