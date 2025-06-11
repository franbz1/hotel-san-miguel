/*
  Warnings:

  - The values [ORDEN_ASEO] on the enum `TiposAseo` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `observaciones_objetos` on the `RegistroAseoHabitacion` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones_rastros` on the `RegistroAseoHabitacion` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones_objetos` on the `RegistroAseoZonaComun` table. All the data in the column will be lost.
  - You are about to drop the column `observaciones_rastros` on the `RegistroAseoZonaComun` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TiposAseo_new" AS ENUM ('LIMPIEZA', 'DESINFECCION', 'ROTACION_COLCHONES', 'LIMPIEZA_BANIO', 'DESINFECCION_BANIO');
ALTER TABLE "Habitacion" ALTER COLUMN "ultimo_aseo_tipo" TYPE "TiposAseo_new" USING ("ultimo_aseo_tipo"::text::"TiposAseo_new");
ALTER TABLE "RegistroAseoHabitacion" ALTER COLUMN "tipos_realizados" TYPE "TiposAseo_new"[] USING ("tipos_realizados"::text::"TiposAseo_new"[]);
ALTER TABLE "ZonaComun" ALTER COLUMN "ultimo_aseo_tipo" TYPE "TiposAseo_new" USING ("ultimo_aseo_tipo"::text::"TiposAseo_new");
ALTER TABLE "RegistroAseoZonaComun" ALTER COLUMN "tipos_realizados" TYPE "TiposAseo_new"[] USING ("tipos_realizados"::text::"TiposAseo_new"[]);
ALTER TYPE "TiposAseo" RENAME TO "TiposAseo_old";
ALTER TYPE "TiposAseo_new" RENAME TO "TiposAseo";
DROP TYPE "TiposAseo_old";
COMMIT;

-- AlterTable
ALTER TABLE "RegistroAseoHabitacion" DROP COLUMN "observaciones_objetos",
DROP COLUMN "observaciones_rastros",
ADD COLUMN     "observaciones" TEXT;

-- AlterTable
ALTER TABLE "RegistroAseoZonaComun" DROP COLUMN "observaciones_objetos",
DROP COLUMN "observaciones_rastros",
ADD COLUMN     "observaciones" TEXT;
