import { FastifyInstance } from "fastify";
import {
  listarAvaliacoes,
  criarAvaliacao,
  atualizarAvaliacao,
  excluirAvaliacao,
  iniciarAvaliacao,
} from "../controllers/avaliacoesController";

export async function avaliacoesRoutes(fastify: FastifyInstance) {
  fastify.get("/", listarAvaliacoes);

  fastify.post("/", criarAvaliacao);

  fastify.patch("/:id", atualizarAvaliacao);

  fastify.delete("/:id", excluirAvaliacao);

  fastify.patch("/:id/iniciar", iniciarAvaliacao);
}