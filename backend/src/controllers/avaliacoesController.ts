
import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../prisma";

export async function listarAvaliacoes(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        colaborador: true,
        ciclo: true,
      },
    });

    return reply.send(avaliacoes);
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);

    return reply.status(500).send({
      mensagem: "Erro ao buscar avaliações",
    });
  }
}

type CriarAvaliacaoBody = {
  colaboradorId: number;
  cicloId: number;
  nota?: number | null;
  status?: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
  comentario?: string | null;
  dataConclusao?: string | null;
};

export async function criarAvaliacao(
  request: FastifyRequest<{
    Body: CriarAvaliacaoBody;
  }>,
  reply: FastifyReply,
) {
  try {
    const {
      colaboradorId,
      cicloId,
      nota = null,
      status = "PENDENTE",
      comentario = null,
      dataConclusao = null,
    } = request.body;

    if (!colaboradorId || !cicloId) {
      return reply.status(400).send({
        mensagem: "Colaborador e ciclo são obrigatórios",
      });
    }

    const avaliacao = await prisma.avaliacao.create({
      data: {
        colaboradorId,
        cicloId,
        nota,
        status,
        comentario,
        dataConclusao: dataConclusao
          ? new Date(dataConclusao)
          : null,
      },
      include: {
        colaborador: true,
        ciclo: true,
      },
    });

    return reply.status(201).send(avaliacao);
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);

    return reply.status(500).send({
      mensagem: "Erro ao criar avaliação",
    });
  }
}

type AtualizarAvaliacaoBody = {
  nota?: number | null;
  status?: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
  comentario?: string | null;
  dataConclusao?: string | null;
};

export async function atualizarAvaliacao(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: AtualizarAvaliacaoBody;
  }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id)) {
      return reply.status(400).send({
        mensagem: "ID da avaliação inválido",
      });
    }

    const avaliacao = await prisma.avaliacao.update({
      where: {
        id,
      },
      data: {
        nota: request.body.nota,
        status: request.body.status,
        comentario: request.body.comentario,
        dataConclusao: request.body.dataConclusao
          ? new Date(request.body.dataConclusao)
          : request.body.dataConclusao === null
            ? null
            : undefined,
      },
      include: {
        colaborador: true,
        ciclo: true,
      },
    });

    return reply.send(avaliacao);
  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);

    return reply.status(500).send({
      mensagem: "Erro ao atualizar avaliação",
    });
  }
}

export async function excluirAvaliacao(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id)) {
      return reply.status(400).send({
        mensagem: "ID da avaliação inválido",
      });
    }

    await prisma.avaliacao.delete({
      where: {
        id,
      },
    });

    return reply.send({
      mensagem: "Avaliação excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir avaliação:", error);

    return reply.status(500).send({
      mensagem: "Erro ao excluir avaliação",
    });
  }
}

export async function iniciarAvaliacao(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const id = Number(request.params.id);

    if (!Number.isInteger(id)) {
      return reply.status(400).send({
        mensagem: "ID da avaliação inválido",
      });
    }

    const avaliacao = await prisma.avaliacao.update({
      where: {
        id,
      },
      data: {
        status: "EM_ANDAMENTO",
      },
      include: {
        colaborador: true,
        ciclo: true,
      },
    });

    return reply.send(avaliacao);
  } catch (error) {
    console.error("Erro ao iniciar avaliação:", error);

    return reply.status(500).send({
      mensagem: "Erro ao iniciar avaliação",
    });
  }
}

