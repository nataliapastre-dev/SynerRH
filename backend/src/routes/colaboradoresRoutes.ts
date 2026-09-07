import { FastifyInstance } from "fastify";

import {
  criarColaborador,
  listarColaboradores,
} from "../controllers/colaboradoresController";

export async function colaboradoresRoutes(fastify: FastifyInstance) {
  fastify.get("/", listarColaboradores);

  fastify.post("/", criarColaborador);
}