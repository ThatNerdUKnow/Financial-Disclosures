/*
  Warnings:

  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Report` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "url" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "body" TEXT NOT NULL
);
INSERT INTO "new_Report" ("body", "date", "name", "office", "type", "url") SELECT "body", "date", "name", "office", "type", "url" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE UNIQUE INDEX "Report_url_key" ON "Report"("url");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
