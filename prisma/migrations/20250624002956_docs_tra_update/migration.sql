/*
  Warnings:

  - Changed the type of `tipo_documento` on the `HuespedSecundario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoDocumentoHuespedSecundario" AS ENUM ('TI', 'CC', 'PASAPORTE', 'CE', 'REGISTRO_CIVIL', 'PEP', 'DNI');

-- AlterTable
ALTER TABLE "HuespedSecundario" DROP COLUMN "tipo_documento",
ADD COLUMN     "tipo_documento" "TipoDocumentoHuespedSecundario" NOT NULL;
