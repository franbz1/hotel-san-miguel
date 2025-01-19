/*
  Warnings:

  - Changed the type of `motivo_viaje` on the `Reserva` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MotivosViajes" AS ENUM ('NEGOCIOS_Y_MOTIVOS_PROFESIONALES', 'VACACIONES_RECREO_Y_OCIO', 'VISITAS_A_FAMILIARES_Y_AMIGOS', 'EDUCACION_YFORMACION', 'SALUD_Y_ATENCION_MEDICA', 'RELIGION_Y_PEREGRINACIONES', 'COMPRAS', 'TRANSITO', 'OTROS_MOTIVOS');

-- AlterTable
ALTER TABLE "Reserva" DROP COLUMN "motivo_viaje",
ADD COLUMN     "motivo_viaje" "MotivosViajes" NOT NULL;
