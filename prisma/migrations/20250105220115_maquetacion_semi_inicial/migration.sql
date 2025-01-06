/*
  Warnings:

  - You are about to drop the column `apellidos` on the `Huesped` table. All the data in the column will be lost.
  - You are about to drop the column `destino` on the `Huesped` table. All the data in the column will be lost.
  - You are about to drop the column `direccion` on the `Huesped` table. All the data in the column will be lost.
  - You are about to drop the column `procedencia` on the `Huesped` table. All the data in the column will be lost.
  - Added the required column `ciudad_procedencia` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ciudad_residencia` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departamento_procedencia` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departamento_residencia` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genero` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lugar_nacimiento` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nacionalidad` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ocupacion` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pais_destino` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pais_procedencia` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pais_residencia` to the `Huesped` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primer_apellido` to the `Huesped` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "HuespedSecundario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "primer_apellido" TEXT NOT NULL,
    "segundo_apellido" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "pais_residencia" TEXT NOT NULL,
    "departamento_residencia" TEXT NOT NULL,
    "ciudad_residencia" TEXT NOT NULL,
    "lugar_nacimiento" TEXT NOT NULL,
    "fecha_nacimiento" DATETIME NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "ocupacion" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "huespedId" INTEGER NOT NULL,
    CONSTRAINT "HuespedSecundario_huespedId_fkey" FOREIGN KEY ("huespedId") REFERENCES "Huesped" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha_inicio" DATETIME NOT NULL,
    "fecha_fin" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'RESERVADO',
    "habitacionId" INTEGER NOT NULL,
    "huespedId" INTEGER NOT NULL,
    "facturaId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Reserva_huespedId_fkey" FOREIGN KEY ("huespedId") REFERENCES "Huesped" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "Habitacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Habitacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero_habitacion" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'UNACAMA',
    "estado" TEXT NOT NULL DEFAULT 'LIBRE',
    "precio_por_noche" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "total" REAL NOT NULL,
    "fecha_factura" DATETIME NOT NULL,
    "huespedId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Factura_huespedId_fkey" FOREIGN KEY ("huespedId") REFERENCES "Huesped" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Documento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "huespedId" INTEGER,
    "huespedSecundarioId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Documento_huespedId_fkey" FOREIGN KEY ("huespedId") REFERENCES "Huesped" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Documento_huespedSecundarioId_fkey" FOREIGN KEY ("huespedSecundarioId") REFERENCES "HuespedSecundario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Documento" ("createdAt", "huespedId", "id", "nombre", "url") SELECT "createdAt", "huespedId", "id", "nombre", "url" FROM "Documento";
DROP TABLE "Documento";
ALTER TABLE "new_Documento" RENAME TO "Documento";
CREATE INDEX "Documento_huespedId_idx" ON "Documento"("huespedId");
CREATE INDEX "Documento_huespedSecundarioId_idx" ON "Documento"("huespedSecundarioId");
CREATE TABLE "new_Huesped" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "primer_apellido" TEXT NOT NULL,
    "segundo_apellido" TEXT,
    "nombres" TEXT NOT NULL,
    "pais_residencia" TEXT NOT NULL,
    "departamento_residencia" TEXT NOT NULL,
    "ciudad_residencia" TEXT NOT NULL,
    "pais_procedencia" TEXT NOT NULL,
    "departamento_procedencia" TEXT NOT NULL,
    "ciudad_procedencia" TEXT NOT NULL,
    "pais_destino" TEXT NOT NULL,
    "lugar_nacimiento" TEXT NOT NULL,
    "fecha_nacimiento" DATETIME NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "ocupacion" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "motivo_viaje" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Huesped" ("correo", "createdAt", "deleted", "fecha_nacimiento", "id", "motivo_viaje", "nombres", "numero_documento", "tipo_documento", "updatedAt") SELECT "correo", "createdAt", "deleted", "fecha_nacimiento", "id", "motivo_viaje", "nombres", "numero_documento", "tipo_documento", "updatedAt" FROM "Huesped";
DROP TABLE "Huesped";
ALTER TABLE "new_Huesped" RENAME TO "Huesped";
CREATE INDEX "Huesped_deleted_idx" ON "Huesped"("deleted");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Reserva_facturaId_key" ON "Reserva"("facturaId");

-- CreateIndex
CREATE INDEX "Reserva_huespedId_idx" ON "Reserva"("huespedId");

-- CreateIndex
CREATE INDEX "Reserva_deleted_idx" ON "Reserva"("deleted");

-- CreateIndex
CREATE INDEX "Habitacion_deleted_idx" ON "Habitacion"("deleted");

-- CreateIndex
CREATE INDEX "Factura_deleted_idx" ON "Factura"("deleted");
