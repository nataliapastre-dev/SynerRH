import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../prisma";

type CriarPDIBody = {
  titulo: string;
  objetivo?: string | null;
  descricao?: string | null;
  prazo?: string | null;
  progresso?: number;
  status?: "NAO_INICIADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "ATRASADO";
  responsavel?: string | null;
  colaboradorId: number;
};

type AtualizarPDIBody = {
  titulo?: string;
  objetivo?: string | null;
  descricao?: string | null;
  prazo?: string | null;
  progresso?: number;
  status?: "NAO_INICIADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "ATRASADO";
  responsavel?: string | null;
};

export async function listarPDIs(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const pdis = await prisma.pDI.findMany({
      include: {
        colaborador: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            departamento: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return reply.send(pdis);
  } catch (error) {
    console.error("Erro ao buscar PDIs:", error);

    return reply.status(500).send({
      mensagem: "Erro ao buscar PDIs",
    });
  }
}

export async function criarPDI(
  request: FastifyRequest<{ Body: CriarPDIBody }>,
  reply: FastifyReply,
) {
  try {
    const {
      titulo,
      objetivo,
      descricao,
      prazo,
      progresso,
      status,
      responsavel,
      colaboradorId,
    } = request.body;

    const colaborador = await prisma.colaborador.findUnique({
      where: {
        id: colaboradorId,
      },
    });

    if (!colaborador) {
      return reply.status(404).send({
        mensagem: "Colaborador não encontrado",
      });
    }

    const pdi = await prisma.pDI.create({
      data: {
        titulo,
        objetivo,
        descricao,
        prazo: prazo ? new Date(prazo) : null,
        progresso: progresso ?? 0,
        status: status ?? "NAO_INICIADO",
        responsavel,
        colaboradorId,
      },
      include: {
        colaborador: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            departamento: true,
          },
        },
      },
    });

    return reply.status(201).send(pdi);
  } catch (error) {
    console.error("Erro ao criar PDI:", error);

    return reply.status(500).send({
      mensagem: "Erro ao criar PDI",
    });
  }
}

export async function atualizarPDI(
  request: FastifyRequest<{
    Params: { id: string };
    Body: AtualizarPDIBody;
  }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(request.params.id);

    if (Number.isNaN(id)) {
      return reply.status(400).send({
        mensagem: "ID do PDI inválido",
      });
    }

    const {
      titulo,
      objetivo,
      descricao,
      prazo,
      progresso,
      status,
      responsavel,
    } = request.body;

    const pdiExistente = await prisma.pDI.findUnique({
      where: {
        id,
      },
    });

    if (!pdiExistente) {
      return reply.status(404).send({
        mensagem: "PDI não encontrado",
      });
    }

    const pdi = await prisma.pDI.update({
      where: {
        id,
      },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(objetivo !== undefined && { objetivo }),
        ...(descricao !== undefined && { descricao }),
        ...(prazo !== undefined && {
          prazo: prazo ? new Date(prazo) : null,
        }),
        ...(progresso !== undefined && { progresso }),
        ...(status !== undefined && { status }),
        ...(responsavel !== undefined && { responsavel }),
      },
      include: {
        colaborador: {
          select: {
            id: true,
            nome: true,
            cargo: true,
            departamento: true,
          },
        },
      },
    });

    return reply.send(pdi);
  } catch (error) {
    console.error("Erro ao atualizar PDI:", error);

    return reply.status(500).send({
      mensagem: "Erro ao atualizar PDI",
    });
  }
}

export async function excluirPDI(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(request.params.id);

    if (Number.isNaN(id)) {
      return reply.status(400).send({
        mensagem: "ID do PDI inválido",
      });
    }

    const pdiExistente = await prisma.pDI.findUnique({
      where: {
        id,
      },
    });

    if (!pdiExistente) {
      return reply.status(404).send({
        mensagem: "PDI não encontrado",
      });
    }

    await prisma.pDI.delete({
      where: {
        id,
      },
    });

    return reply.status(204).send();
  } catch (error) {
    console.error("Erro ao excluir PDI:", error);

    return reply.status(500).send({
      mensagem: "Erro ao excluir PDI",
    });
  }
}