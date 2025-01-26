-- AlterTable
ALTER TABLE "Formulario" ADD COLUMN     "SubidoASubir" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "SubidoATra" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "traId" INTEGER;

-- CreateTable
CREATE TABLE "_HuespedSecundarioToReserva" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_HuespedSecundarioToReserva_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_HuespedSecundarioToReserva_B_index" ON "_HuespedSecundarioToReserva"("B");

-- AddForeignKey
ALTER TABLE "_HuespedSecundarioToReserva" ADD CONSTRAINT "_HuespedSecundarioToReserva_A_fkey" FOREIGN KEY ("A") REFERENCES "HuespedSecundario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_HuespedSecundarioToReserva" ADD CONSTRAINT "_HuespedSecundarioToReserva_B_fkey" FOREIGN KEY ("B") REFERENCES "Reserva"("id") ON DELETE CASCADE ON UPDATE CASCADE;
