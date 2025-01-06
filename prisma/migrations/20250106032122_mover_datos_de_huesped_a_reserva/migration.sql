/*
  Warnings:

  - You are about to drop the column `ciudad_procedencia` on the `Huesped` table. All the data in the column will be lost.
  - You are about to drop the column `departamento_procedencia` on the `Huesped` table. All the data in the column will be lost.
  - You are about to drop the column `motivo_viaje` on the `Huesped` table. All the data in the column will be lost.
  - You are about to drop the column `pais_destino` on the `Huesped` table. All the data in the column will be lost.
  - You are about to drop the column `pais_procedencia` on the `Huesped` table. All the data in the column will be lost.
  - Added the required column `check_in` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `check_out` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ciudad_procedencia` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costo` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departamento_procedencia` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `motivo_viaje` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_acompaniantes` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pais_destino` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pais_procedencia` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "lugar_nacimiento" TEXT NOT NULL,
    "fecha_nacimiento" DATETIME NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "ocupacion" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Huesped" ("ciudad_residencia", "correo", "createdAt", "deleted", "departamento_residencia", "fecha_nacimiento", "genero", "id", "lugar_nacimiento", "nacionalidad", "nombres", "numero_documento", "ocupacion", "pais_residencia", "primer_apellido", "segundo_apellido", "telefono", "tipo_documento", "updatedAt") SELECT "ciudad_residencia", "correo", "createdAt", "deleted", "departamento_residencia", "fecha_nacimiento", "genero", "id", "lugar_nacimiento", "nacionalidad", "nombres", "numero_documento", "ocupacion", "pais_residencia", "primer_apellido", "segundo_apellido", "telefono", "tipo_documento", "updatedAt" FROM "Huesped";
DROP TABLE "Huesped";
ALTER TABLE "new_Huesped" RENAME TO "Huesped";
CREATE UNIQUE INDEX "Huesped_numero_documento_key" ON "Huesped"("numero_documento");
CREATE INDEX "Huesped_numero_documento_idx" ON "Huesped"("numero_documento");
CREATE INDEX "Huesped_deleted_idx" ON "Huesped"("deleted");
CREATE TABLE "new_Reserva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha_inicio" DATETIME NOT NULL,
    "fecha_fin" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'RESERVADO',
    "pais_procedencia" TEXT NOT NULL,
    "departamento_procedencia" TEXT NOT NULL,
    "ciudad_procedencia" TEXT NOT NULL,
    "pais_destino" TEXT NOT NULL,
    "motivo_viaje" TEXT NOT NULL,
    "check_in" DATETIME NOT NULL,
    "check_out" DATETIME NOT NULL,
    "costo" REAL NOT NULL,
    "numero_acompaniantes" INTEGER NOT NULL,
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
INSERT INTO "new_Reserva" ("createdAt", "deleted", "estado", "facturaId", "fecha_fin", "fecha_inicio", "habitacionId", "huespedId", "id", "updatedAt") SELECT "createdAt", "deleted", "estado", "facturaId", "fecha_fin", "fecha_inicio", "habitacionId", "huespedId", "id", "updatedAt" FROM "Reserva";
DROP TABLE "Reserva";
ALTER TABLE "new_Reserva" RENAME TO "Reserva";
CREATE UNIQUE INDEX "Reserva_facturaId_key" ON "Reserva"("facturaId");
CREATE INDEX "Reserva_huespedId_idx" ON "Reserva"("huespedId");
CREATE INDEX "Reserva_deleted_idx" ON "Reserva"("deleted");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
