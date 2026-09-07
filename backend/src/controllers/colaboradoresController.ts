import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../prisma";

type CriarColaboradorBody = {
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  avatar?: string;
};

export async function listarColaboradores(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const colaboradores = await prisma.colaborador.findMany({
      orderBy: {
        nome: "asc",
      },
    });

    return reply.send(colaboradores);
  } catch (error) {
    console.error("Erro ao buscar colaboradores:", error);

    return reply.status(500).send({
      mensagem: "Erro ao buscar colaboradores",
    });
  }
}

export async function criarColaborador(
  request: FastifyRequest<{ Body: CriarColaboradorBody }>,
  reply: FastifyReply,
) {
  try {
    const {
      nome,
      email,
      cargo,
      departamento,
      dataAdmissao,
      avatar,
    } = request.body;

    const colaborador = await prisma.colaborador.create({
      data: {
        nome,
        email,
        cargo,
        departamento,
        dataAdmissao: new Date(dataAdmissao),
        avatar,
      },
    });

    return reply.status(201).send(colaborador);
  } catch (error) {
    console.error("Erro ao criar colaborador:", error);

    return reply.status(500).send({
      mensagem: "Erro ao criar colaborador",
    });
  }
}