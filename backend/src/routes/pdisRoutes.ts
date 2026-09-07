import { FastifyInstance } from "fastify";

import {
  listarPDIs,
  criarPDI,
  atualizarPDI,
  excluirPDI,
} from "../controllers/pdisController";

export async function pdisRoutes(fastify: FastifyInstance) {
  fastify.get("/", listarPDIs);

  fastify.post("/", criarPDI);

  fastify.put("/:id", atualizarPDI);

  fastify.delete("/:id", excluirPDI);
}