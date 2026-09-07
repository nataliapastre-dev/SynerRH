-- CreateTable
CREATE TABLE "colaboradores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "dataAdmissao" DATETIME NOT NULL,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ciclos_avaliacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nota" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "comentario" TEXT,
    "dataConclusao" DATETIME,
    "colaboradorId" INTEGER NOT NULL,
    "cicloId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "avaliacoes_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "avaliacoes_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "ciclos_avaliacao" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pdis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "objetivo" TEXT,
    "prazo" DATETIME,
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NAO_INICIADO',
    "colaboradorId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pdis_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'OUTRO',
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "colaboradorId" INTEGER NOT NULL,
    "autorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "feedbacks_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "feedbacks_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "colaboradores" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_email_key" ON "colaboradores"("email");

-- CreateIndex
CREATE INDEX "colaboradores_departamento_idx" ON "colaboradores"("departamento");

-- CreateIndex
CREATE INDEX "colaboradores_status_idx" ON "colaboradores"("status");

-- CreateIndex
CREATE INDEX "avaliacoes_colaboradorId_idx" ON "avaliacoes"("colaboradorId");

-- CreateIndex
CREATE INDEX "avaliacoes_cicloId_idx" ON "avaliacoes"("cicloId");

-- CreateIndex
CREATE INDEX "avaliacoes_status_idx" ON "avaliacoes"("status");

-- CreateIndex
CREATE INDEX "pdis_colaboradorId_idx" ON "pdis"("colaboradorId");

-- CreateIndex
CREATE INDEX "pdis_status_idx" ON "pdis"("status");

-- CreateIndex
CREATE INDEX "feedbacks_colaboradorId_idx" ON "feedbacks"("colaboradorId");

-- CreateIndex
CREATE INDEX "feedbacks_autorId_idx" ON "feedbacks"("autorId");

-- CreateIndex
CREATE INDEX "feedbacks_tipo_idx" ON "feedbacks"("tipo");
