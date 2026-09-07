import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../prisma";

type TipoFeedback =
  | "POSITIVO"
  | "DESENVOLVIMENTO"
  | "RECONHECIMENTO"
  | "OUTRO";

type CriarFeedbackBody = {
  titulo: string;
  conteudo: string;
  tipo?: TipoFeedback;
  colaboradorId: number;
  autorId?: number | null;
};

export async function listarFeedbacks(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const feedbacks =
      await prisma.feedback.findMany({
        include: {
          colaborador: {
            select: {
              id: true,
              nome: true,
              cargo: true,
              departamento: true,
            },
          },

          autor: {
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

    return reply.send(feedbacks);
  } catch (error) {
    console.error(
      "Erro ao buscar feedbacks:",
      error,
    );

    return reply.status(500).send({
      mensagem:
        "Erro ao buscar feedbacks",
    });
  }
}

export async function criarFeedback(
  request: FastifyRequest<{
    Body: CriarFeedbackBody;
  }>,
  reply: FastifyReply,
) {
  try {
    const {
      titulo,
      conteudo,
      tipo,
      colaboradorId,
      autorId,
    } = request.body;

    if (!titulo?.trim()) {
      return reply.status(400).send({
        mensagem:
          "Título é obrigatório",
      });
    }

    if (!conteudo?.trim()) {
      return reply.status(400).send({
        mensagem:
          "Conteúdo é obrigatório",
      });
    }

    if (!colaboradorId) {
      return reply.status(400).send({
        mensagem:
          "Colaborador é obrigatório",
      });
    }

    const colaborador =
      await prisma.colaborador.findUnique({
        where: {
          id: colaboradorId,
        },
      });

    if (!colaborador) {
      return reply.status(404).send({
        mensagem:
          "Colaborador não encontrado",
      });
    }

    if (autorId) {
      const autor =
        await prisma.colaborador.findUnique({
          where: {
            id: autorId,
          },
        });

      if (!autor) {
        return reply.status(404).send({
          mensagem:
            "Autor não encontrado",
        });
      }
    }

    const feedback =
      await prisma.feedback.create({
        data: {
          titulo:
            titulo.trim(),

          conteudo:
            conteudo.trim(),

          tipo:
            tipo ?? "OUTRO",

          colaboradorId,

          autorId:
            autorId ?? null,
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

          autor: {
            select: {
              id: true,
              nome: true,
              cargo: true,
              departamento: true,
            },
          },
        },
      });

    return reply
      .status(201)
      .send(feedback);
  } catch (error) {
    console.error(
      "Erro ao criar feedback:",
      error,
    );

    return reply.status(500).send({
      mensagem:
        "Erro ao criar feedback",
    });
  }
}

export async function excluirFeedback(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const id =
      Number(
        request.params.id,
      );

    if (Number.isNaN(id)) {
      return reply.status(400).send({
        mensagem:
          "ID do feedback inválido",
      });
    }

    const feedbackExistente =
      await prisma.feedback.findUnique({
        where: {
          id,
        },
      });

    if (!feedbackExistente) {
      return reply.status(404).send({
        mensagem:
          "Feedback não encontrado",
      });
    }

    await prisma.feedback.delete({
      where: {
        id,
      },
    });

    return reply
      .status(204)
      .send();
  } catch (error) {
    console.error(
      "Erro ao excluir feedback:",
      error,
    );

    return reply.status(500).send({
      mensagem:
        "Erro ao excluir feedback",
    });
  }
}