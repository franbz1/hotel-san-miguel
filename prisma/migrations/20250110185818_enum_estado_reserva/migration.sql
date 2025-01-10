/*
  Warnings:

  - Changed the type of `estado` on the `Reserva` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EstadosReserva" AS ENUM ('RESERVADO', 'CANCELADO', 'FINALIZADO', 'PENDIENTE');

-- AlterTable
ALTER TABLE "Reserva" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadosReserva" NOT NULL;
