/*
  Warnings:

  - Changed the type of `tipo_documento` on the `Huesped` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Huesped" DROP COLUMN "tipo_documento",
ADD COLUMN     "tipo_documento" "TipoDocumento" NOT NULL;
