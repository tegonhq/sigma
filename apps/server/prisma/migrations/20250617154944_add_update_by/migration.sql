-- AlterTable
ALTER TABLE "List" ADD COLUMN     "updatedBy" TEXT NOT NULL DEFAULT 'user';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "updatedBy" TEXT NOT NULL DEFAULT 'user';
