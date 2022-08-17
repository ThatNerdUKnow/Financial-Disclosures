-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "office" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "body" TEXT NOT NULL
);
INSERT INTO "new_Report" ("body", "date", "id", "name", "office", "type", "url") SELECT "body", "date", "id", "name", "office", "type", "url" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE UNIQUE INDEX "Report_url_key" ON "Report"("url");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
