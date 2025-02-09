/*
  Warnings:

  - You are about to drop the column `image` on the `Avatar` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Element` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Element` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Map` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Map` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `createrId` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ElementMap` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ElementSpace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MapToSpace` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id]` on the table `Avatar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Element` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Map` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Space` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `static` to the `Element` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ElementMap" DROP CONSTRAINT "ElementMap_elementId_fkey";

-- DropForeignKey
ALTER TABLE "ElementMap" DROP CONSTRAINT "ElementMap_mapId_fkey";

-- DropForeignKey
ALTER TABLE "ElementSpace" DROP CONSTRAINT "ElementSpace_elementId_fkey";

-- DropForeignKey
ALTER TABLE "ElementSpace" DROP CONSTRAINT "ElementSpace_spaceId_fkey";

-- DropForeignKey
ALTER TABLE "Space" DROP CONSTRAINT "Space_createrId_fkey";

-- DropForeignKey
ALTER TABLE "_MapToSpace" DROP CONSTRAINT "_MapToSpace_A_fkey";

-- DropForeignKey
ALTER TABLE "_MapToSpace" DROP CONSTRAINT "_MapToSpace_B_fkey";

-- AlterTable
ALTER TABLE "Avatar" DROP COLUMN "image",
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Element" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "static" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Map" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Space" DROP COLUMN "createdAt",
DROP COLUMN "createrId",
DROP COLUMN "updatedAt",
ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "ElementMap";

-- DropTable
DROP TABLE "ElementSpace";

-- DropTable
DROP TABLE "_MapToSpace";

-- CreateTable
CREATE TABLE "spaceElements" (
    "id" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "spaceElements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MapElements" (
    "id" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "x" INTEGER,
    "y" INTEGER,

    CONSTRAINT "MapElements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "spaceElements_id_key" ON "spaceElements"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MapElements_id_key" ON "MapElements"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Avatar_id_key" ON "Avatar"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Element_id_key" ON "Element"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Map_id_key" ON "Map"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Space_id_key" ON "Space"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaceElements" ADD CONSTRAINT "spaceElements_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaceElements" ADD CONSTRAINT "spaceElements_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "Element"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapElements" ADD CONSTRAINT "MapElements_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapElements" ADD CONSTRAINT "MapElements_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "Element"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
