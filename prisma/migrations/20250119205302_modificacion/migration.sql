/*
  Warnings:

  - The values [UNA_CAMA,DOS_CAMAS,TRES_CAMAS,CUATRO_CAMAS] on the enum `TiposHabitacion` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TiposHabitacion_new" AS ENUM ('APARTAMENTO', 'HAMACA', 'CAMPING', 'MÚLTIPLE', 'CASA', 'FINCA', 'CAMA', 'PLAZA', 'SENCILLA', 'SUITE', 'DOBLE', 'OTRO');
ALTER TABLE "Habitacion" ALTER COLUMN "tipo" TYPE "TiposHabitacion_new" USING ("tipo"::text::"TiposHabitacion_new");
ALTER TYPE "TiposHabitacion" RENAME TO "TiposHabitacion_old";
ALTER TYPE "TiposHabitacion_new" RENAME TO "TiposHabitacion";
DROP TYPE "TiposHabitacion_old";
COMMIT;
