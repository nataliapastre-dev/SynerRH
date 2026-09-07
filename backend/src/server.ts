import Fastify from "fastify";
import cors from "@fastify/cors";

import { colaboradoresRoutes } from "./routes/colaboradoresRoutes";
import { avaliacoesRoutes } from "./routes/avaliacoesRoutes";
import { ciclosRoutes } from "./routes/ciclosRoutes";
import { pdisRoutes } from "./routes/pdisRoutes";
import { feedbacksRoutes } from "./routes/feedbacksRoutes";

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
});

app.register(colaboradoresRoutes, {
  prefix: "/colaboradores",
});

app.register(avaliacoesRoutes, {
  prefix: "/avaliacoes",
});

app.register(ciclosRoutes, {
  prefix: "/ciclos",
});

app.register(pdisRoutes, {
  prefix: "/pdis",
});

app.register(feedbacksRoutes, {
  prefix: "/feedbacks",
});

app.get("/", async () => {
  return {
    message: "SynerRH API funcionando 🚀",
  };
});

const start = async () => {
  try {
    await app.listen({
      port: 3333,
      host: "0.0.0.0",
    });

    console.log(
      "🚀 SynerRH API rodando em http://localhost:3333",
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();