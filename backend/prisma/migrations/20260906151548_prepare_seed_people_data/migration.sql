/*
  Warnings:

  - A unique constraint covering the columns `[colaboradorId,cicloId]` on the table `avaliacoes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome,dataInicio,dataFim]` on the table `ciclos_avaliacao` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[colaboradorId,titulo,data]` on the table `feedbacks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[colaboradorId,titulo]` on the table `pdis` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "avaliacoes_nota_idx" ON "avaliacoes"("nota");

-- CreateIndex
CREATE INDEX "avaliacoes_dataConclusao_idx" ON "avaliacoes"("dataConclusao");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_colaboradorId_cicloId_key" ON "avaliacoes"("colaboradorId", "cicloId");

-- CreateIndex
CREATE INDEX "ciclos_avaliacao_ativo_idx" ON "ciclos_avaliacao"("ativo");

-- CreateIndex
CREATE INDEX "ciclos_avaliacao_dataInicio_idx" ON "ciclos_avaliacao"("dataInicio");

-- CreateIndex
CREATE INDEX "ciclos_avaliacao_dataFim_idx" ON "ciclos_avaliacao"("dataFim");

-- CreateIndex
CREATE UNIQUE INDEX "ciclos_avaliacao_nome_dataInicio_dataFim_key" ON "ciclos_avaliacao"("nome", "dataInicio", "dataFim");

-- CreateIndex
CREATE INDEX "colaboradores_cargo_idx" ON "colaboradores"("cargo");

-- CreateIndex
CREATE INDEX "colaboradores_dataAdmissao_idx" ON "colaboradores"("dataAdmissao");

-- CreateIndex
CREATE INDEX "feedbacks_data_idx" ON "feedbacks"("data");

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_colaboradorId_titulo_data_key" ON "feedbacks"("colaboradorId", "titulo", "data");

-- CreateIndex
CREATE INDEX "pdis_prazo_idx" ON "pdis"("prazo");

-- CreateIndex
CREATE INDEX "pdis_progresso_idx" ON "pdis"("progresso");

-- CreateIndex
CREATE UNIQUE INDEX "pdis_colaboradorId_titulo_key" ON "pdis"("colaboradorId", "titulo");
