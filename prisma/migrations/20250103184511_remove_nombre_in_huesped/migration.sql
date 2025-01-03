/*
  Warnings:

  - You are about to drop the column `nombre` on the `Huesped` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Huesped" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fecha_nacimiento" DATETIME NOT NULL,
    "direccion" TEXT NOT NULL,
    "procedencia" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "motivo_viaje" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Huesped" ("apellidos", "correo", "createdAt", "deleted", "destino", "direccion", "fecha_nacimiento", "id", "motivo_viaje", "nombres", "numero_documento", "procedencia", "tipo_documento", "updatedAt") SELECT "apellidos", "correo", "createdAt", "deleted", "destino", "direccion", "fecha_nacimiento", "id", "motivo_viaje", "nombres", "numero_documento", "procedencia", "tipo_documento", "updatedAt" FROM "Huesped";
DROP TABLE "Huesped";
ALTER TABLE "new_Huesped" RENAME TO "Huesped";
CREATE INDEX "Huesped_deleted_idx" ON "Huesped"("deleted");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
