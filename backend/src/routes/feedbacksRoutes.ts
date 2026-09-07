import { FastifyInstance } from "fastify";

import {
  listarFeedbacks,
  criarFeedback,
  excluirFeedback,
} from "../controllers/feedbacksController";

export async function feedbacksRoutes(
  fastify: FastifyInstance,
) {
  fastify.get("/", listarFeedbacks);

  fastify.post("/", criarFeedback);

  fastify.delete("/:id", excluirFeedback);
}