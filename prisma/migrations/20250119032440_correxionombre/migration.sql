/*
  Warnings:

  - The values [EDUCACION_YFORMACION] on the enum `MotivosViajes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MotivosViajes_new" AS ENUM ('NEGOCIOS_Y_MOTIVOS_PROFESIONALES', 'VACACIONES_RECREO_Y_OCIO', 'VISITAS_A_FAMILIARES_Y_AMIGOS', 'EDUCACION_Y_FORMACION', 'SALUD_Y_ATENCION_MEDICA', 'RELIGION_Y_PEREGRINACIONES', 'COMPRAS', 'TRANSITO', 'OTROS_MOTIVOS');
ALTER TABLE "Reserva" ALTER COLUMN "motivo_viaje" TYPE "MotivosViajes_new" USING ("motivo_viaje"::text::"MotivosViajes_new");
ALTER TYPE "MotivosViajes" RENAME TO "MotivosViajes_old";
ALTER TYPE "MotivosViajes_new" RENAME TO "MotivosViajes";
DROP TYPE "MotivosViajes_old";
COMMIT;
