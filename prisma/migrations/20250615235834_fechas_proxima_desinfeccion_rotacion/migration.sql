-- AlterTable
ALTER TABLE "ConfiguracionAseo" ADD COLUMN     "dias_aviso_desinfeccion_zona_comun" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "frecuencia_desinfeccion_zona_comun" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Habitacion" ADD COLUMN     "requerido_desinfeccion_hoy" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ZonaComun" ADD COLUMN     "proxima_desinfeccion_zona_comun" TIMESTAMP(3),
ADD COLUMN     "requerido_desinfeccion_hoy" BOOLEAN NOT NULL DEFAULT false;
