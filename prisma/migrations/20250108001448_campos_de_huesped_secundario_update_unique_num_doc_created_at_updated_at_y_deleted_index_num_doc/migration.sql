/*
  Warnings:

  - Added the required column `updatedAt` to the `HuespedSecundario` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HuespedSecundario" (
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
    "huespedId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "HuespedSecundario_huespedId_fkey" FOREIGN KEY ("huespedId") REFERENCES "Huesped" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_HuespedSecundario" ("ciudad_residencia", "correo", "departamento_residencia", "fecha_nacimiento", "genero", "huespedId", "id", "lugar_nacimiento", "nacionalidad", "nombres", "numero_documento", "ocupacion", "pais_residencia", "primer_apellido", "segundo_apellido", "telefono", "tipo_documento") SELECT "ciudad_residencia", "correo", "departamento_residencia", "fecha_nacimiento", "genero", "huespedId", "id", "lugar_nacimiento", "nacionalidad", "nombres", "numero_documento", "ocupacion", "pais_residencia", "primer_apellido", "segundo_apellido", "telefono", "tipo_documento" FROM "HuespedSecundario";
DROP TABLE "HuespedSecundario";
ALTER TABLE "new_HuespedSecundario" RENAME TO "HuespedSecundario";
CREATE UNIQUE INDEX "HuespedSecundario_numero_documento_key" ON "HuespedSecundario"("numero_documento");
CREATE INDEX "HuespedSecundario_numero_documento_idx" ON "HuespedSecundario"("numero_documento");
CREATE INDEX "HuespedSecundario_deleted_idx" ON "HuespedSecundario"("deleted");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
