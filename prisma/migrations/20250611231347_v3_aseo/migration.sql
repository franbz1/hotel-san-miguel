/*
  Warnings:

  - You are about to drop the column `areas_intervenir` on the `RegistroAseoHabitacion` table. All the data in the column will be lost.
  - You are about to drop the column `elementos_aseo` on the `RegistroAseoHabitacion` table. All the data in the column will be lost.
  - You are about to drop the column `elementos_proteccion` on the `RegistroAseoHabitacion` table. All the data in the column will be lost.
  - You are about to drop the column `procedimiento_aseo` on the `RegistroAseoHabitacion` table. All the data in the column will be lost.
  - You are about to drop the column `procedimiento_desinfeccion` on the `RegistroAseoHabitacion` table. All the data in the column will be lost.
  - You are about to drop the column `procedimiento_rotacion_colchones` on the `RegistroAseoHabitacion` table. All the data in the column will be lost.
  - You are about to drop the column `productos_quimicos` on the `RegistroAseoHabitacion` table. All the data in the column will be lost.
  - You are about to drop the column `elementos_aseo` on the `RegistroAseoZonaComun` table. All the data in the column will be lost.
  - You are about to drop the column `elementos_proteccion` on the `RegistroAseoZonaComun` table. All the data in the column will be lost.
  - You are about to drop the column `procedimiento_aseo` on the `RegistroAseoZonaComun` table. All the data in the column will be lost.
  - You are about to drop the column `procedimiento_desinfeccion` on the `RegistroAseoZonaComun` table. All the data in the column will be lost.
  - You are about to drop the column `productos_quimicos` on the `RegistroAseoZonaComun` table. All the data in the column will be lost.
  - Added the required column `procedimiento_aseo` to the `ReporteAseoDiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `procedimiento_desinfeccion` to the `ReporteAseoDiario` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Habitacion_requerido_aseo_hoy_idx";

-- DropIndex
DROP INDEX "Habitacion_requerido_rotacion_colchones_idx";

-- DropIndex
DROP INDEX "Habitacion_ultima_rotacion_colchones_idx";

-- DropIndex
DROP INDEX "Habitacion_ultimo_aseo_fecha_estado_idx";

-- DropIndex
DROP INDEX "RegistroAseoHabitacion_fecha_registro_habitacionId_idx";

-- DropIndex
DROP INDEX "RegistroAseoHabitacion_usuarioId_fecha_registro_idx";

-- AlterTable
ALTER TABLE "RegistroAseoHabitacion" DROP COLUMN "areas_intervenir",
DROP COLUMN "elementos_aseo",
DROP COLUMN "elementos_proteccion",
DROP COLUMN "procedimiento_aseo",
DROP COLUMN "procedimiento_desinfeccion",
DROP COLUMN "procedimiento_rotacion_colchones",
DROP COLUMN "productos_quimicos";

-- AlterTable
ALTER TABLE "RegistroAseoZonaComun" DROP COLUMN "elementos_aseo",
DROP COLUMN "elementos_proteccion",
DROP COLUMN "procedimiento_aseo",
DROP COLUMN "procedimiento_desinfeccion",
DROP COLUMN "productos_quimicos";

-- AlterTable
ALTER TABLE "ReporteAseoDiario" ADD COLUMN     "elementos_aseo" TEXT[],
ADD COLUMN     "elementos_proteccion" TEXT[],
ADD COLUMN     "procedimiento_aseo" TEXT NOT NULL,
ADD COLUMN     "procedimiento_desinfeccion" TEXT NOT NULL,
ADD COLUMN     "productos_quimicos" TEXT[];

-- CreateIndex
CREATE INDEX "Habitacion_ultimo_aseo_fecha_estado_deleted_idx" ON "Habitacion"("ultimo_aseo_fecha", "estado", "deleted");

-- CreateIndex
CREATE INDEX "Habitacion_requerido_aseo_hoy_deleted_idx" ON "Habitacion"("requerido_aseo_hoy", "deleted");

-- CreateIndex
CREATE INDEX "Habitacion_ultima_rotacion_colchones_deleted_idx" ON "Habitacion"("ultima_rotacion_colchones", "deleted");

-- CreateIndex
CREATE INDEX "Habitacion_requerido_rotacion_colchones_deleted_idx" ON "Habitacion"("requerido_rotacion_colchones", "deleted");

-- CreateIndex
CREATE INDEX "RegistroAseoHabitacion_fecha_registro_habitacionId_deleted_idx" ON "RegistroAseoHabitacion"("fecha_registro", "habitacionId", "deleted");

-- CreateIndex
CREATE INDEX "RegistroAseoHabitacion_usuarioId_fecha_registro_deleted_idx" ON "RegistroAseoHabitacion"("usuarioId", "fecha_registro", "deleted");

-- CreateIndex
CREATE INDEX "ZonaComun_ultimo_aseo_fecha_deleted_idx" ON "ZonaComun"("ultimo_aseo_fecha", "deleted");

-- CreateIndex
CREATE INDEX "ZonaComun_requerido_aseo_hoy_deleted_idx" ON "ZonaComun"("requerido_aseo_hoy", "deleted");
