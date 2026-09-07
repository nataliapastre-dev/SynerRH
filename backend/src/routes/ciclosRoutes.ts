import { FastifyInstance } from "fastify";
import {
  listarCiclos,
  criarCiclo,
} from "../controllers/ciclosController";

export async function ciclosRoutes(fastify: FastifyInstance) {
  fastify.get("/", listarCiclos);

  fastify.post("/", criarCiclo);
}