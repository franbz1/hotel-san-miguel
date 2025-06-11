-- CreateEnum
CREATE TYPE "TiposAseo" AS ENUM ('LIMPIEZA', 'DESINFECCION', 'ROTACION_COLCHONES', 'ORDEN_ASEO', 'LIMPIEZA_BANIO', 'DESINFECCION_BANIO');

-- AlterTable
ALTER TABLE "Habitacion" ADD COLUMN     "proxima_rotacion_colchones" TIMESTAMP(3),
ADD COLUMN     "requerido_aseo_hoy" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requerido_rotacion_colchones" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ultima_rotacion_colchones" TIMESTAMP(3),
ADD COLUMN     "ultimo_aseo_fecha" TIMESTAMP(3),
ADD COLUMN     "ultimo_aseo_tipo" "TiposAseo";

-- CreateTable
CREATE TABLE "ConfiguracionAseo" (
    "id" SERIAL NOT NULL,
    "hora_limite_aseo" TEXT NOT NULL DEFAULT '17:00',
    "frecuencia_rotacion_colchones" INTEGER NOT NULL DEFAULT 180,
    "dias_aviso_rotacion_colchones" INTEGER NOT NULL DEFAULT 5,
    "habilitar_notificaciones" BOOLEAN NOT NULL DEFAULT false,
    "email_notificaciones" TEXT,
    "elementos_aseo_default" TEXT[],
    "elementos_proteccion_default" TEXT[],
    "productos_quimicos_default" TEXT[],
    "areas_intervenir_habitacion_default" TEXT[],
    "areas_intervenir_banio_default" TEXT[],
    "procedimiento_aseo_habitacion_default" TEXT,
    "procedimiento_desinfeccion_habitacion_default" TEXT,
    "procedimiento_rotacion_colchones_default" TEXT,
    "procedimiento_limieza_zona_comun_default" TEXT,
    "procedimiento_desinfeccion_zona_comun_default" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionAseo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAseoHabitacion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "habitacionId" INTEGER NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL,
    "tipos_realizados" "TiposAseo"[],
    "objetos_perdidos" BOOLEAN NOT NULL DEFAULT false,
    "observaciones_objetos" TEXT,
    "rastros_de_animales" BOOLEAN NOT NULL DEFAULT false,
    "observaciones_rastros" TEXT,
    "elementos_aseo" TEXT[],
    "elementos_proteccion" TEXT[],
    "productos_quimicos" TEXT[],
    "areas_intervenir" TEXT[],
    "procedimiento_aseo" TEXT NOT NULL,
    "procedimiento_desinfeccion" TEXT NOT NULL,
    "procedimiento_rotacion_colchones" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RegistroAseoHabitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZonaComun" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "piso" INTEGER NOT NULL,
    "requerido_aseo_hoy" BOOLEAN NOT NULL DEFAULT false,
    "ultimo_aseo_fecha" TIMESTAMP(3),
    "ultimo_aseo_tipo" "TiposAseo",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ZonaComun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAseoZonaComun" (
    "id" SERIAL NOT NULL,
    "zonaComunId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL,
    "limpieza" BOOLEAN NOT NULL DEFAULT false,
    "desinfeccion" BOOLEAN NOT NULL DEFAULT false,
    "objetos_perdidos" BOOLEAN NOT NULL DEFAULT false,
    "observaciones_objetos" TEXT,
    "rastros_de_animales" BOOLEAN NOT NULL DEFAULT false,
    "observaciones_rastros" TEXT,
    "elementos_aseo" TEXT[],
    "elementos_proteccion" TEXT[],
    "productos_quimicos" TEXT[],
    "procedimiento_aseo" TEXT NOT NULL,
    "procedimiento_desinfeccion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RegistroAseoZonaComun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZonaLavado" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "piso" INTEGER NOT NULL,
    "requerido_aseo_hoy" BOOLEAN NOT NULL DEFAULT false,
    "ultimo_aseo_fecha" TIMESTAMP(3),
    "ultimo_aseo_tipo" "TiposAseo",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ZonaLavado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroAseoZonaLavado" (
    "id" SERIAL NOT NULL,
    "zonaLavadoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL,
    "limpieza" BOOLEAN NOT NULL DEFAULT false,
    "desinfeccion" BOOLEAN NOT NULL DEFAULT false,
    "orden_aseo" BOOLEAN NOT NULL DEFAULT false,
    "objetos_perdidos" BOOLEAN NOT NULL DEFAULT false,
    "observaciones_objetos" TEXT,
    "rastros_de_animales" BOOLEAN NOT NULL DEFAULT false,
    "observaciones_rastros" TEXT,
    "elementos_aseo" TEXT[],
    "elementos_proteccion" TEXT[],
    "productos_quimicos" TEXT[],
    "procedimiento_aseo" TEXT NOT NULL,
    "procedimiento_desinfeccion" TEXT NOT NULL,
    "procedimiento_limpieza" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RegistroAseoZonaLavado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReporteAseoDiario" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "datos" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReporteAseoDiario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistroAseoHabitacion_fecha_registro_habitacionId_idx" ON "RegistroAseoHabitacion"("fecha_registro", "habitacionId");

-- CreateIndex
CREATE INDEX "RegistroAseoHabitacion_usuarioId_fecha_registro_idx" ON "RegistroAseoHabitacion"("usuarioId", "fecha_registro");

-- CreateIndex
CREATE INDEX "RegistroAseoHabitacion_deleted_idx" ON "RegistroAseoHabitacion"("deleted");

-- CreateIndex
CREATE INDEX "ZonaComun_deleted_idx" ON "ZonaComun"("deleted");

-- CreateIndex
CREATE INDEX "RegistroAseoZonaComun_fecha_registro_zonaComunId_idx" ON "RegistroAseoZonaComun"("fecha_registro", "zonaComunId");

-- CreateIndex
CREATE INDEX "RegistroAseoZonaComun_usuarioId_fecha_registro_idx" ON "RegistroAseoZonaComun"("usuarioId", "fecha_registro");

-- CreateIndex
CREATE INDEX "RegistroAseoZonaComun_deleted_idx" ON "RegistroAseoZonaComun"("deleted");

-- CreateIndex
CREATE INDEX "ZonaLavado_deleted_idx" ON "ZonaLavado"("deleted");

-- CreateIndex
CREATE INDEX "RegistroAseoZonaLavado_fecha_registro_zonaLavadoId_idx" ON "RegistroAseoZonaLavado"("fecha_registro", "zonaLavadoId");

-- CreateIndex
CREATE INDEX "RegistroAseoZonaLavado_usuarioId_fecha_registro_idx" ON "RegistroAseoZonaLavado"("usuarioId", "fecha_registro");

-- CreateIndex
CREATE INDEX "RegistroAseoZonaLavado_deleted_idx" ON "RegistroAseoZonaLavado"("deleted");

-- CreateIndex
CREATE INDEX "ReporteAseoDiario_fecha_idx" ON "ReporteAseoDiario"("fecha");

-- CreateIndex
CREATE INDEX "ReporteAseoDiario_deleted_idx" ON "ReporteAseoDiario"("deleted");

-- CreateIndex
CREATE INDEX "Habitacion_ultimo_aseo_fecha_estado_idx" ON "Habitacion"("ultimo_aseo_fecha", "estado");

-- CreateIndex
CREATE INDEX "Habitacion_requerido_aseo_hoy_idx" ON "Habitacion"("requerido_aseo_hoy");

-- CreateIndex
CREATE INDEX "Habitacion_ultima_rotacion_colchones_idx" ON "Habitacion"("ultima_rotacion_colchones");

-- CreateIndex
CREATE INDEX "Habitacion_requerido_rotacion_colchones_idx" ON "Habitacion"("requerido_rotacion_colchones");

-- AddForeignKey
ALTER TABLE "RegistroAseoHabitacion" ADD CONSTRAINT "RegistroAseoHabitacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAseoHabitacion" ADD CONSTRAINT "RegistroAseoHabitacion_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "Habitacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAseoZonaComun" ADD CONSTRAINT "RegistroAseoZonaComun_zonaComunId_fkey" FOREIGN KEY ("zonaComunId") REFERENCES "ZonaComun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAseoZonaComun" ADD CONSTRAINT "RegistroAseoZonaComun_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAseoZonaLavado" ADD CONSTRAINT "RegistroAseoZonaLavado_zonaLavadoId_fkey" FOREIGN KEY ("zonaLavadoId") REFERENCES "ZonaLavado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroAseoZonaLavado" ADD CONSTRAINT "RegistroAseoZonaLavado_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
