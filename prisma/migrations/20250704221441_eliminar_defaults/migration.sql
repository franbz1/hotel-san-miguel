-- AlterTable
ALTER TABLE "HuespedSecundario" ALTER COLUMN "ciudad_destino" DROP DEFAULT,
ALTER COLUMN "pais_destino" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Reserva" ALTER COLUMN "ciudad_destino" DROP DEFAULT;
