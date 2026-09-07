import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../prisma";

export async function listarCiclos(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const ciclos = await prisma.cicloAvaliacao.findMany({
      orderBy: {
        dataInicio: "desc",
      },
    });

    return reply.send(ciclos);
  } catch (error) {
    console.error("Erro ao buscar ciclos:", error);

    return reply.status(500).send({
      mensagem: "Erro ao buscar ciclos",
    });
  }
}

type CriarCicloBody = {
  nome: string;
  descricao?: string | null;
  dataInicio: string;
  dataFim: string;
  ativo?: boolean;
};

export async function criarCiclo(
  request: FastifyRequest<{
    Body: CriarCicloBody;
  }>,
  reply: FastifyReply,
) {
  try {
    const {
      nome,
      descricao = null,
      dataInicio,
      dataFim,
      ativo = true,
    } = request.body;

    if (!nome || !dataInicio || !dataFim) {
      return reply.status(400).send({
        mensagem: "Nome, data de início e data de fim são obrigatórios",
      });
    }

    const ciclo = await prisma.cicloAvaliacao.create({
      data: {
        nome,
        descricao,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        ativo,
      },
    });

    return reply.status(201).send(ciclo);
  } catch (error) {
    console.error("Erro ao criar ciclo:", error);

    return reply.status(500).send({
      mensagem: "Erro ao criar ciclo",
    });
  }
}