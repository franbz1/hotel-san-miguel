/*
  Warnings:

  - You are about to alter the column `precio_por_noche` on the `Habitacion` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Habitacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero_habitacion" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'UNACAMA',
    "estado" TEXT NOT NULL DEFAULT 'LIBRE',
    "precio_por_noche" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Habitacion" ("createdAt", "deleted", "estado", "id", "numero_habitacion", "precio_por_noche", "tipo", "updatedAt") SELECT "createdAt", "deleted", "estado", "id", "numero_habitacion", "precio_por_noche", "tipo", "updatedAt" FROM "Habitacion";
DROP TABLE "Habitacion";
ALTER TABLE "new_Habitacion" RENAME TO "Habitacion";
CREATE UNIQUE INDEX "Habitacion_numero_habitacion_key" ON "Habitacion"("numero_habitacion");
CREATE INDEX "Habitacion_deleted_idx" ON "Habitacion"("deleted");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
