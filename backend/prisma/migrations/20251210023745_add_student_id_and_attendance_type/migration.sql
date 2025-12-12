/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('QR', 'MANUAL', 'EXCUSED');

-- AlterTable
ALTER TABLE "attendance" ADD COLUMN     "type" "AttendanceType" NOT NULL DEFAULT 'QR';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "studentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_studentId_key" ON "users"("studentId");
