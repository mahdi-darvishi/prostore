/*
  Warnings:

  - You are about to drop the column `imaages` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imaages",
ADD COLUMN     "images" TEXT[];
