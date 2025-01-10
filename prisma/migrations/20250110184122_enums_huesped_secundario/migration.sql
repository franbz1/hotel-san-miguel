/*
  Warnings:

  - Changed the type of `tipo_documento` on the `HuespedSecundario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `genero` on the `HuespedSecundario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "HuespedSecundario" DROP COLUMN "tipo_documento",
ADD COLUMN     "tipo_documento" "TipoDocumento" NOT NULL,
DROP COLUMN "genero",
ADD COLUMN     "genero" "Genero" NOT NULL;
