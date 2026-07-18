/*
  Warnings:

  - A unique constraint covering the columns `[locale,slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[locale,slug]` on the table `Series` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[locale,slug]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `locale` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locale` to the `Series` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locale` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "Series_slug_key";

-- DropIndex
DROP INDEX "Tag_slug_key";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "normalizedContent" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "normalizedDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "normalizedTitle" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "locale" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Series" ADD COLUMN     "locale" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "locale" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Article_locale_idx" ON "Article"("locale");

-- CreateIndex
CREATE INDEX "Article_normalizedTitle_normalizedDescription_idx" ON "Article"("normalizedTitle", "normalizedDescription");

-- CreateIndex
CREATE INDEX "Category_locale_idx" ON "Category"("locale");

-- CreateIndex
CREATE INDEX "Category_deletedAt_idx" ON "Category"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_locale_slug_key" ON "Category"("locale", "slug");

-- CreateIndex
CREATE INDEX "Series_locale_idx" ON "Series"("locale");

-- CreateIndex
CREATE INDEX "Series_deletedAt_idx" ON "Series"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Series_locale_slug_key" ON "Series"("locale", "slug");

-- CreateIndex
CREATE INDEX "Tag_locale_idx" ON "Tag"("locale");

-- CreateIndex
CREATE INDEX "Tag_deletedAt_idx" ON "Tag"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_locale_slug_key" ON "Tag"("locale", "slug");
