/*
  Warnings:

  - You are about to drop the column `procedimiento_aseo` on the `ReporteAseoDiario` table. All the data in the column will be lost.
  - You are about to drop the column `procedimiento_desinfeccion` on the `ReporteAseoDiario` table. All the data in the column will be lost.
  - Added the required column `procedimiento_aseo_habitacion` to the `ReporteAseoDiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `procedimiento_desinfeccion_habitacion` to the `ReporteAseoDiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `procedimiento_desinfeccion_zona_comun` to the `ReporteAseoDiario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `procedimiento_limpieza_zona_comun` to the `ReporteAseoDiario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RegistroAseoHabitacion" ADD COLUMN     "procedimiento_rotacion_colchones" TEXT;

-- AlterTable
ALTER TABLE "ReporteAseoDiario" DROP COLUMN "procedimiento_aseo",
DROP COLUMN "procedimiento_desinfeccion",
ADD COLUMN     "procedimiento_aseo_habitacion" TEXT NOT NULL,
ADD COLUMN     "procedimiento_desinfeccion_habitacion" TEXT NOT NULL,
ADD COLUMN     "procedimiento_desinfeccion_zona_comun" TEXT NOT NULL,
ADD COLUMN     "procedimiento_limpieza_zona_comun" TEXT NOT NULL;
