/*
  Warnings:

  - You are about to drop the column `activityId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `conversationId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `syncId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `modelId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelName` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ModelName" ADD VALUE 'Activity';
ALTER TYPE "ModelName" ADD VALUE 'Notification';

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "activityId",
DROP COLUMN "conversationId",
DROP COLUMN "syncId",
ADD COLUMN     "modelId" TEXT NOT NULL,
ADD COLUMN     "modelName" TEXT NOT NULL;
