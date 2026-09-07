/*
  Warnings:

  - A unique constraint covering the columns `[matricula]` on the table `colaboradores` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "colaboradores" ADD COLUMN "matricula" TEXT;

-- AlterTable
ALTER TABLE "pdis" ADD COLUMN "responsavel" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_matricula_key" ON "colaboradores"("matricula");
