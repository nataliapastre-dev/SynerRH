import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

type Aba =
  | "visao-geral"
  | "avaliacoes"
  | "pdi"
  | "feedbacks"
  | "historico";

type StatusColaboradorBackend =
  | "ATIVO"
  | "FERIAS"
  | "AFASTADO"
  | "INATIVO";

type StatusAvaliacaoBackend =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "CONCLUIDA";

type StatusPDIBackend =
  | "NAO_INICIADO"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "ATRASADO";

type TipoFeedbackBackend =
  | "POSITIVO"
  | "DESENVOLVIMENTO"
  | "RECONHECIMENTO"
  | "OUTRO";

type ColaboradorApi = {
  id: number;
  matricula?: string | null;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  status: StatusColaboradorBackend;
  dataAdmissao: string;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type AvaliacaoApi = {
  id: number;
  nota?: number | null;
  status: StatusAvaliacaoBackend;
  comentario?: string | null;
  dataConclusao?: string | null;
  colaboradorId: number;
  cicloId: number;
  createdAt?: string | null;
  updatedAt?: string | null;

  ciclo?: {
    id: number;
    nome: string;
    dataInicio?: string;
    dataFim?: string;
  };
};

type PDI = {
  id: number;
  titulo: string;
  descricao?: string | null;
  objetivo?: string | null;
  prazo?: string | null;
  progresso: number;
  status: StatusPDIBackend;
  responsavel?: string | null;
  colaboradorId: number;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type Feedback = {
  id: number;
  titulo: string;
  conteudo: string;
  tipo: TipoFeedbackBackend;
  data?: string | null;
  colaboradorId: number;
  autorId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  autor?: {
    id: number;
    nome: string;
    cargo?: string;
  } | null;
};

type Historico = {
  id: string;
  data: string;
  timestamp: number;
  titulo: string;
  descricao: string;
  tipo: "Avaliação" | "PDI" | "Feedback";
};

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://localhost:3333";

const FETCH_OPTIONS: RequestInit = {
  cache: "no-store",
};

function formatarData(
  data: string | null | undefined,
) {
  if (!data) {
    return "Não informada";
  }

  const dataSomente = data.slice(0, 10);
  const [ano, mes, dia] = dataSomente
    .split("-")
    .map(Number);

  if (!ano || !mes || !dia) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
  ).format(
    new Date(
      ano,
      mes - 1,
      dia,
    ),
  );
}

function timestamp(
  data: string | null | undefined,
) {
  if (!data) {
    return 0;
  }

  const valor = new Date(data);

  return Number.isNaN(valor.getTime())
    ? 0
    : valor.getTime();
}

function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();
}

function statusColaborador(
  status: StatusColaboradorBackend,
) {
  switch (status) {
    case "ATIVO":
      return "Ativo";

    case "FERIAS":
      return "Férias";

    case "AFASTADO":
      return "Afastado";

    case "INATIVO":
      return "Inativo";
  }
}

function classeStatusColaborador(
  status: StatusColaboradorBackend,
) {
  switch (status) {
    case "ATIVO":
      return "bg-emerald-50 text-emerald-700";

    case "FERIAS":
      return "bg-blue-50 text-blue-700";

    case "AFASTADO":
      return "bg-amber-50 text-amber-700";

    case "INATIVO":
      return "bg-slate-100 text-slate-600";
  }
}

function statusAvaliacao(
  status: StatusAvaliacaoBackend,
) {
  switch (status) {
    case "PENDENTE":
      return "Agendada";

    case "EM_ANDAMENTO":
      return "Em andamento";

    case "CONCLUIDA":
      return "Concluída";
  }
}

function statusPDI(status: StatusPDIBackend) {
  switch (status) {
    case "NAO_INICIADO":
      return "A iniciar";

    case "EM_ANDAMENTO":
      return "Em andamento";

    case "CONCLUIDO":
      return "Concluído";

    case "ATRASADO":
      return "Atrasado";
  }
}

function tipoFeedback(
  tipo: TipoFeedbackBackend,
) {
  switch (tipo) {
    case "POSITIVO":
      return "Positivo";

    case "DESENVOLVIMENTO":
      return "Desenvolvimento";

    case "RECONHECIMENTO":
      return "Reconhecimento";

    case "OUTRO":
      return "Outro";
  }
}

export default function PerfilColaborador() {
  const navigate = useNavigate();
  const params = useParams();

  const id = Number(params.id);

  const [abaAtiva, setAbaAtiva] =
    useState<Aba>("visao-geral");

  const [
    colaboradores,
    setColaboradores,
  ] = useState<ColaboradorApi[]>([]);

  const [
    avaliacoes,
    setAvaliacoes,
  ] = useState<AvaliacaoApi[]>([]);

  const [pdis, setPdis] =
    useState<PDI[]>([]);

  const [
    feedbacks,
    setFeedbacks,
  ] = useState<Feedback[]>([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [erro, setErro] =
    useState("");

  const [
    modalPDI,
    setModalPDI,
  ] = useState(false);

  const [
    modalFeedback,
    setModalFeedback,
  ] = useState(false);

  const [
    novoPDI,
    setNovoPDI,
  ] = useState({
    objetivo: "",
    descricao: "",
    prazo: "",
    responsavel: "",
  });

  const [
    novoFeedback,
    setNovoFeedback,
  ] = useState({
    titulo: "",
    tipo:
      "POSITIVO" as TipoFeedbackBackend,
    conteudo: "",
    autorId: "",
  });

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro("");

      const [
        colaboradoresResponse,
        avaliacoesResponse,
        pdisResponse,
        feedbacksResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/colaboradores`, FETCH_OPTIONS),
        fetch(`${API_URL}/avaliacoes`, FETCH_OPTIONS),
        fetch(`${API_URL}/pdis`, FETCH_OPTIONS),
        fetch(`${API_URL}/feedbacks`, FETCH_OPTIONS),
      ]);

      if (
        !colaboradoresResponse.ok ||
        !avaliacoesResponse.ok ||
        !pdisResponse.ok ||
        !feedbacksResponse.ok
      ) {
        throw new Error(
          "Não foi possível carregar o perfil do colaborador.",
        );
      }

      const [
        colaboradoresData,
        avaliacoesData,
        pdisData,
        feedbacksData,
      ] = await Promise.all([
        colaboradoresResponse.json(),
        avaliacoesResponse.json(),
        pdisResponse.json(),
        feedbacksResponse.json(),
      ]);

      const listaColaboradores:
        ColaboradorApi[] =
        Array.isArray(colaboradoresData)
          ? colaboradoresData
          : [];

      const listaAvaliacoes:
        AvaliacaoApi[] =
        Array.isArray(avaliacoesData)
          ? avaliacoesData
          : [];

      const listaPdis: PDI[] =
        Array.isArray(pdisData)
          ? pdisData
          : [];

      const listaFeedbacks:
        Feedback[] =
        Array.isArray(feedbacksData)
          ? feedbacksData
          : [];

      setColaboradores(
        listaColaboradores,
      );

      setAvaliacoes(
        listaAvaliacoes.filter(
          (avaliacao) =>
            avaliacao.colaboradorId === id,
        ),
      );

      setPdis(
        listaPdis.filter(
          (pdi) =>
            pdi.colaboradorId === id,
        ),
      );

      setFeedbacks(
        listaFeedbacks.filter(
          (feedback) =>
            feedback.colaboradorId === id,
        ),
      );
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar perfil.",
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(id)) {
      carregarDados();
    }
  }, [id]);

  const colaborador = useMemo(
    () =>
      colaboradores.find(
        (item) => item.id === id,
      ),
    [colaboradores, id],
  );

  const avaliacoesOrdenadas =
    useMemo(
      () =>
        [...avaliacoes].sort(
          (a, b) =>
            timestamp(
              b.dataConclusao ??
                b.updatedAt ??
                b.createdAt,
            ) -
            timestamp(
              a.dataConclusao ??
                a.updatedAt ??
                a.createdAt,
            ),
        ),
      [avaliacoes],
    );

  const avaliacoesComNota =
    useMemo(
      () =>
        avaliacoesOrdenadas.filter(
          (avaliacao) =>
            typeof avaliacao.nota ===
            "number",
        ),
      [avaliacoesOrdenadas],
    );

  const ultimaAvaliacao =
    avaliacoesOrdenadas[0] ?? null;

  const ultimaAvaliacaoComNota =
    avaliacoesComNota[0] ?? null;

  const mediaAvaliacoes =
    useMemo(() => {
      if (
        avaliacoesComNota.length === 0
      ) {
        return 0;
      }

      return (
        avaliacoesComNota.reduce(
          (total, avaliacao) =>
            total +
            Number(avaliacao.nota),
          0,
        ) / avaliacoesComNota.length
      );
    }, [avaliacoesComNota]);

  const evolucao = useMemo(() => {
    if (
      avaliacoesComNota.length < 2
    ) {
      return null;
    }

    const primeira =
      avaliacoesComNota[
        avaliacoesComNota.length - 1
      ].nota;

    const ultima =
      avaliacoesComNota[0].nota;

    if (
      !primeira ||
      ultima === null ||
      ultima === undefined
    ) {
      return null;
    }

    return (
      ((ultima - primeira) /
        primeira) *
      100
    );
  }, [avaliacoesComNota]);

  const pdisAtivos =
    pdis.filter(
      (item) =>
        item.status !== "CONCLUIDO",
    ).length;

  const pdisConcluidos =
    pdis.filter(
      (item) =>
        item.status === "CONCLUIDO",
    ).length;

  const historico =
    useMemo<Historico[]>(() => {
      const itens: Historico[] = [];

      avaliacoes.forEach(
        (avaliacao) => {
          const data =
            avaliacao.dataConclusao ??
            avaliacao.updatedAt ??
            avaliacao.createdAt;

          itens.push({
            id: `avaliacao-${avaliacao.id}`,
            data: formatarData(data),
            timestamp: timestamp(data),
            titulo:
              "Avaliação registrada",
            descricao:
              avaliacao.nota !== null &&
              avaliacao.nota !==
                undefined
                ? `Nota registrada: ${avaliacao.nota
                    .toFixed(1)
                    .replace(".", ",")}.`
                : `Status: ${statusAvaliacao(
                    avaliacao.status,
                  )}.`,
            tipo: "Avaliação",
          });
        },
      );

      pdis.forEach((pdi) => {
        const data =
          pdi.updatedAt ??
          pdi.createdAt;

        itens.push({
          id: `pdi-${pdi.id}`,
          data: formatarData(data),
          timestamp: timestamp(data),
          titulo: "PDI atualizado",
          descricao: `${pdi.titulo} — ${pdi.progresso}% de progresso.`,
          tipo: "PDI",
        });
      });

      feedbacks.forEach(
        (feedback) => {
          const data =
            feedback.data ??
            feedback.createdAt;

          itens.push({
            id: `feedback-${feedback.id}`,
            data: formatarData(data),
            timestamp: timestamp(data),
            titulo: feedback.titulo,
            descricao:
              feedback.conteudo,
            tipo: "Feedback",
          });
        },
      );

      return itens.sort(
        (a, b) =>
          b.timestamp - a.timestamp,
      );
    }, [
      avaliacoes,
      pdis,
      feedbacks,
    ]);

  const cadastrarPDI = async () => {
    if (!novoPDI.objetivo.trim()) {
      setErro(
        "Informe o objetivo do PDI.",
      );
      return;
    }

    if (!novoPDI.prazo) {
      setErro(
        "Informe o prazo do PDI.",
      );
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const response =
        await fetch(
          `${API_URL}/pdis`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              titulo:
                novoPDI.objetivo.trim(),

              objetivo:
                novoPDI.objetivo.trim(),

              descricao:
                novoPDI.descricao.trim() ||
                null,

              prazo:
                `${novoPDI.prazo}T00:00:00.000Z`,

              progresso: 0,

              status:
                "NAO_INICIADO",

              responsavel:
                novoPDI.responsavel.trim() ||
                null,

              colaboradorId: id,
            }),
          },
        );

      if (!response.ok) {
        const resultado =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          resultado?.mensagem ??
            "Não foi possível cadastrar o PDI.",
        );
      }

      setNovoPDI({
        objetivo: "",
        descricao: "",
        prazo: "",
        responsavel: "",
      });

      setModalPDI(false);
      setAbaAtiva("pdi");

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao cadastrar PDI.",
      );
    } finally {
      setSalvando(false);
    }
  };

  const cadastrarFeedback =
    async () => {
      if (
        !novoFeedback.titulo.trim()
      ) {
        setErro(
          "Informe o título do feedback.",
        );
        return;
      }

      if (
        !novoFeedback.conteudo.trim()
      ) {
        setErro(
          "Digite o feedback.",
        );
        return;
      }

      try {
        setSalvando(true);
        setErro("");

        const response =
          await fetch(
            `${API_URL}/feedbacks`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                titulo:
                  novoFeedback.titulo.trim(),

                conteudo:
                  novoFeedback.conteudo.trim(),

                tipo:
                  novoFeedback.tipo,

                colaboradorId: id,

                autorId:
                  novoFeedback.autorId
                    ? Number(
                        novoFeedback.autorId,
                      )
                    : null,
              }),
            },
          );

        if (!response.ok) {
          const resultado =
            await response
              .json()
              .catch(() => null);

          throw new Error(
            resultado?.mensagem ??
              "Não foi possível cadastrar o feedback.",
          );
        }

        setNovoFeedback({
          titulo: "",
          tipo: "POSITIVO",
          conteudo: "",
          autorId: "",
        });

        setModalFeedback(false);
        setAbaAtiva("feedbacks");

        await carregarDados();
      } catch (error) {
        console.error(error);

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao cadastrar feedback.",
        );
      } finally {
        setSalvando(false);
      }
    };

  if (carregando) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

        <p className="text-sm text-slate-500">
          Carregando perfil...
        </p>
      </div>
    );
  }

  if (!colaborador) {
    return (
      <div className="p-4 sm:p-6">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/colaboradores",
            )
          }
          className="mb-6 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Voltar para colaboradores
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mb-3 text-5xl">
            👤
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Colaborador não encontrado
          </h2>
        </div>
      </div>
    );
  }

  /*
   * IMPORTANTE:
   * depois do if acima sabemos que colaborador existe.
   * Esta constante mantém essa garantia também
   * dentro da função renderAba().
   */
  const colaboradorSeguro:
    ColaboradorApi = colaborador;

  function renderAba() {
    if (
      abaAtiva === "avaliacoes"
    ) {
      return (
        <div className="space-y-4 sm:space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Avaliações
            </h3>

            <p className="text-sm text-slate-500">
              Avaliações vinculadas a este colaborador.
            </p>
          </div>

          {avaliacoesOrdenadas.length ===
          0 ? (
            <EmptyState
              icone="📝"
              titulo="Nenhuma avaliação"
              descricao="Este colaborador ainda não possui avaliações."
            />
          ) : (
            avaliacoesOrdenadas.map(
              (avaliacao) => (
                <div
                  key={avaliacao.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-800">
                          {avaliacao
                            .ciclo
                            ?.nome ??
                            "Avaliação de desempenho"}
                        </h3>

                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                          {statusAvaliacao(
                            avaliacao.status,
                          )}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {formatarData(
                          avaliacao.dataConclusao ??
                            avaliacao.createdAt,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Nota
                      </p>

                      <p className="text-2xl font-bold text-indigo-600 sm:text-3xl">
                        {typeof avaliacao.nota ===
                        "number"
                          ? avaliacao.nota
                              .toFixed(
                                1,
                              )
                              .replace(
                                ".",
                                ",",
                              )
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {avaliacao.comentario && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <p className="text-sm leading-6 text-slate-600">
                        {
                          avaliacao.comentario
                        }
                      </p>
                    </div>
                  )}
                </div>
              ),
            )
          )}
        </div>
      );
    }

    if (abaAtiva === "pdi") {
      return (
        <div className="space-y-4 sm:space-y-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Plano de Desenvolvimento Individual
              </h3>

              <p className="text-sm text-slate-500">
                Objetivos reais cadastrados para este colaborador.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setModalPDI(true)
              }
              className="min-h-11 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
            >
              + Novo objetivo
            </button>
          </div>

          {pdis.length === 0 ? (
            <EmptyState
              icone="🎯"
              titulo="Nenhum PDI"
              descricao="Este colaborador ainda não possui um plano de desenvolvimento."
            />
          ) : (
            pdis.map((item) => (
              <div
                key={item.id}
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-800">
                        {item.titulo}
                      </h3>

                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {statusPDI(
                          item.status,
                        )}
                      </span>
                    </div>

                    {item.descricao && (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.descricao}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-slate-500">
                    Prazo:{" "}
                    <strong className="text-slate-700">
                      {formatarData(
                        item.prazo,
                      )}
                    </strong>
                  </p>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      Progresso
                    </span>

                    <span className="font-bold text-indigo-600">
                      {item.progresso}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{
                        width: `${item.progresso}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      );
    }

    if (
      abaAtiva === "feedbacks"
    ) {
      return (
        <div className="space-y-4 sm:space-y-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Feedbacks
              </h3>

              <p className="text-sm text-slate-500">
                Feedbacks reais registrados para este colaborador.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setModalFeedback(true)
              }
              className="min-h-11 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 sm:w-auto"
            >
              + Registrar feedback
            </button>
          </div>

          {feedbacks.length === 0 ? (
            <EmptyState
              icone="💬"
              titulo="Nenhum feedback"
              descricao="Ainda não existem feedbacks registrados para este colaborador."
            />
          ) : (
            feedbacks.map(
              (feedback) => (
                <div
                  key={feedback.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
                >
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                      {feedback.tipo ===
                      "POSITIVO"
                        ? "👍"
                        : feedback.tipo ===
                            "RECONHECIMENTO"
                          ? "🏆"
                          : feedback.tipo ===
                              "DESENVOLVIMENTO"
                            ? "💡"
                            : "💬"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800">
                            {
                              feedback.titulo
                            }
                          </h4>

                          <p className="mt-1 break-words text-[10px] leading-4 text-slate-400 sm:text-xs">
                            Registrado por{" "}
                            <strong>
                              {feedback
                                .autor
                                ?.nome ??
                                "Não informado"}
                            </strong>
                          </p>

                          <span className="mt-2 inline-block text-xs font-semibold text-indigo-600">
                            {tipoFeedback(
                              feedback.tipo,
                            )}
                          </span>
                        </div>

                        <span className="text-xs text-slate-400">
                          {formatarData(
                            feedback.data ??
                              feedback.createdAt,
                          )}
                        </span>
                      </div>

                      <p className="mt-3 break-words text-sm leading-6 text-slate-600">
                        {
                          feedback.conteudo
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )
          )}
        </div>
      );
    }

    if (
      abaAtiva === "historico"
    ) {
      return (
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-lg font-bold text-slate-800">
            Histórico de evolução
          </h3>

          <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
            Movimentações reais registradas no SynerRH.
          </p>

          {historico.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              Nenhuma movimentação registrada.
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {historico.map(
                (item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 gap-3 sm:gap-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm">
                      {item.tipo ===
                      "Avaliação"
                        ? "📝"
                        : item.tipo ===
                            "PDI"
                          ? "🎯"
                          : "💬"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <h4 className="font-bold text-slate-800">
                          {item.titulo}
                        </h4>

                        <span className="text-xs text-slate-400">
                          {item.data}
                        </span>
                      </div>

                      <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
                        {
                          item.descricao
                        }
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="min-w-0 space-y-5 sm:space-y-6">
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <MetricCard
            titulo="Desempenho atual"
            valor={
              ultimaAvaliacaoComNota
                ? ultimaAvaliacaoComNota
                    .nota!
                    .toFixed(1)
                    .replace(".", ",")
                : "—"
            }
            descricao="Última avaliação com nota"
            icone="📊"
          />

          <MetricCard
            titulo="Evolução"
            valor={
              evolucao === null
                ? "—"
                : `${
                    evolucao >= 0
                      ? "+"
                      : ""
                  }${evolucao.toFixed(
                    0,
                  )}%`
            }
            descricao={
              evolucao === null
                ? "Dados insuficientes"
                : "Desde a primeira avaliação"
            }
            icone="📈"
          />

          <MetricCard
            titulo="PDIs ativos"
            valor={String(
              pdisAtivos,
            )}
            descricao={`${pdisConcluidos} concluído(s)`}
            icone="🎯"
          />

          <MetricCard
            titulo="Feedbacks"
            valor={String(
              feedbacks.length,
            )}
            descricao="Registrados"
            icone="💬"
          />
        </div>

        <div className="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-3">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h3 className="mb-5 text-lg font-bold text-slate-800">
              Informações do colaborador
            </h3>

            <div className="space-y-4">
              <InfoItem
                label="Matrícula"
                valor={
                  colaboradorSeguro.matricula ??
                  "Não informada"
                }
              />

              <InfoItem
                label="Cargo"
                valor={
                  colaboradorSeguro.cargo
                }
              />

              <InfoItem
                label="Departamento"
                valor={
                  colaboradorSeguro.departamento
                }
              />

              <InfoItem
                label="Status"
                valor={statusColaborador(
                  colaboradorSeguro.status,
                )}
              />

              <InfoItem
                label="Admissão"
                valor={formatarData(
                  colaboradorSeguro.dataAdmissao,
                )}
              />

              <InfoItem
                label="E-mail"
                valor={
                  colaboradorSeguro.email
                }
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex min-w-0 items-start justify-between gap-3 sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Desempenho atual
                </h3>

                <p className="text-sm text-slate-500">
                  Comparativo das avaliações com nota.
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-2xl font-bold text-indigo-600 sm:text-3xl">
                  {mediaAvaliacoes > 0
                    ? mediaAvaliacoes
                        .toFixed(1)
                        .replace(
                          ".",
                          ",",
                        )
                    : "—"}
                </span>

                <p className="text-xs text-slate-400">
                  média geral
                </p>
              </div>
            </div>

            {avaliacoesComNota.length ===
            0 ? (
              <div className="mt-6 rounded-xl bg-slate-50 p-5 text-center sm:mt-8 sm:p-8">
                <p className="text-sm text-slate-400">
                  Ainda não existem avaliações concluídas com nota.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
                {[
                  ...avaliacoesComNota,
                ]
                  .reverse()
                  .map(
                    (avaliacao) => (
                      <div
                        key={
                          avaliacao.id
                        }
                      >
                        <div className="mb-2 flex justify-between">
                          <span className="text-sm text-slate-500">
                            {formatarData(
                              avaliacao.dataConclusao ??
                                avaliacao.createdAt,
                            )}
                          </span>

                          <span className="font-bold text-slate-800">
                            {avaliacao
                              .nota!
                              .toFixed(
                                1,
                              )
                              .replace(
                                ".",
                                ",",
                              )}
                          </span>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{
                              width: `${avaliacao.nota! * 10}%`,
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex min-w-0 items-start justify-between gap-3 sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Última avaliação
              </h3>

              <p className="text-sm text-slate-500">
                {ultimaAvaliacao
                  ? `${
                      ultimaAvaliacao
                        .ciclo?.nome ??
                      "Avaliação"
                    } • ${formatarData(
                      ultimaAvaliacao.dataConclusao ??
                        ultimaAvaliacao.createdAt,
                    )}`
                  : "Nenhuma avaliação registrada"}
              </p>
            </div>

            {ultimaAvaliacao && (
              <button
                type="button"
                onClick={() =>
                  setAbaAtiva(
                    "avaliacoes",
                  )
                }
                className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 sm:text-sm"
              >
                Ver avaliações →
              </button>
            )}
          </div>

          {ultimaAvaliacao ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-3.5 sm:mt-6 sm:p-4">
              <div className="flex min-w-0 items-start justify-between gap-3 sm:items-center">
                <span className="text-sm font-semibold text-slate-700">
                  Status
                </span>

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {statusAvaliacao(
                    ultimaAvaliacao.status,
                  )}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Comentário
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {ultimaAvaliacao.comentario ??
                    "Nenhum comentário registrado nesta avaliação."}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-400">
              O colaborador ainda não possui avaliações.
            </p>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex min-w-0 items-start justify-between gap-3 sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Plano de Desenvolvimento Individual
              </h3>

              <p className="text-sm text-slate-500">
                Principais objetivos do colaborador.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setModalPDI(true)
              }
              className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 sm:text-sm"
            >
              + Novo objetivo
            </button>
          </div>

          {pdis.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">
              Nenhum PDI cadastrado.
            </p>
          ) : (
            <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
              {pdis
                .slice(0, 2)
                .map((item) => (
                  <div key={item.id}>
                    <div className="mb-2 flex justify-between gap-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {item.titulo}
                      </span>

                      <span className="text-xs font-bold text-indigo-600">
                        {
                          item.progresso
                        }
                        %
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{
                          width: `${item.progresso}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex min-w-0 items-start justify-between gap-3 sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Feedbacks recentes
              </h3>

              <p className="text-sm text-slate-500">
                Últimas interações.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setModalFeedback(
                  true,
                )
              }
              className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 sm:text-sm"
            >
              + Novo feedback
            </button>
          </div>

          {feedbacks.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">
              Nenhum feedback registrado.
            </p>
          ) : (
            <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
              {feedbacks
                .slice(0, 2)
                .map(
                  (feedback) => (
                    <div
                      key={
                        feedback.id
                      }
                      className="rounded-xl bg-slate-50 p-3.5 sm:p-4"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3 sm:items-center">
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {feedback
                              .autor
                              ?.nome ??
                              "Não informado"}
                          </p>

                          <p className="text-xs text-slate-400">
                            {formatarData(
                              feedback.data ??
                                feedback.createdAt,
                            )}
                          </p>
                        </div>

                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
                          {tipoFeedback(
                            feedback.tipo,
                          )}
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        {
                          feedback.titulo
                        }
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {
                          feedback.conteudo
                        }
                      </p>
                    </div>
                  ),
                )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="min-w-0 space-y-5 overflow-x-hidden pb-4 sm:space-y-6 sm:pb-0">
      <div>
        <button
          type="button"
          onClick={() =>
            navigate(
              "/colaboradores",
            )
          }
          className="mb-4 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          ← Voltar para colaboradores
        </button>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-lg font-bold text-indigo-700 sm:h-16 sm:w-16 sm:text-xl">
                {colaboradorSeguro.avatar ||
                  iniciais(
                    colaboradorSeguro.nome,
                  )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <h1 className="break-words text-xl font-bold leading-tight text-slate-800 sm:text-2xl">
                    {
                      colaboradorSeguro.nome
                    }
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${classeStatusColaborador(
                      colaboradorSeguro.status,
                    )}`}
                  >
                    ●{" "}
                    {statusColaborador(
                      colaboradorSeguro.status,
                    )}
                  </span>
                </div>

                <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
                  Matrícula{" "}
                  {colaboradorSeguro.matricula ??
                    "não informada"}{" "}
                  •{" "}
                  {
                    colaboradorSeguro.cargo
                  }{" "}
                  •{" "}
                  {
                    colaboradorSeguro.departamento
                  }
                </p>
              </div>
            </div>

            <span className="self-start rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:px-4 sm:py-2.5 sm:text-sm">
              ✓ Dados da API
            </span>
          </div>
        </div>
      </div>

      {erro && (
        <div className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{erro}</span>

          <button
            type="button"
            onClick={() =>
              setErro("")
            }
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="-mx-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm sm:mx-0">
        <div className="flex min-w-max snap-x snap-mandatory">
          <TabButton
            ativo={
              abaAtiva ===
              "visao-geral"
            }
            onClick={() =>
              setAbaAtiva(
                "visao-geral",
              )
            }
            icon="📊"
            label="Visão Geral"
          />

          <TabButton
            ativo={
              abaAtiva ===
              "avaliacoes"
            }
            onClick={() =>
              setAbaAtiva(
                "avaliacoes",
              )
            }
            icon="📝"
            label="Avaliações"
          />

          <TabButton
            ativo={
              abaAtiva === "pdi"
            }
            onClick={() =>
              setAbaAtiva("pdi")
            }
            icon="🎯"
            label="PDI"
          />

          <TabButton
            ativo={
              abaAtiva ===
              "feedbacks"
            }
            onClick={() =>
              setAbaAtiva(
                "feedbacks",
              )
            }
            icon="💬"
            label="Feedbacks"
          />

          <TabButton
            ativo={
              abaAtiva ===
              "historico"
            }
            onClick={() =>
              setAbaAtiva(
                "historico",
              )
            }
            icon="📈"
            label="Histórico"
          />
        </div>
      </div>

      {renderAba()}

      {modalPDI && (
        <Modal
          titulo="Novo objetivo de desenvolvimento"
          onClose={() =>
            setModalPDI(false)
          }
        >
          <div className="space-y-4 sm:space-y-5">
            <Input
              label="Objetivo *"
              value={
                novoPDI.objetivo
              }
              onChange={(value) =>
                setNovoPDI({
                  ...novoPDI,
                  objetivo: value,
                })
              }
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Descrição
              </label>

              <textarea
                value={
                  novoPDI.descricao
                }
                onChange={(event) =>
                  setNovoPDI({
                    ...novoPDI,
                    descricao:
                      event.target.value,
                  })
                }
                rows={4}
                className="min-h-11 w-full rounded-xl border border-slate-200 px-4 py-3 text-base sm:text-sm"
              />
            </div>

            <Input
              label="Responsável"
              value={
                novoPDI.responsavel
              }
              onChange={(value) =>
                setNovoPDI({
                  ...novoPDI,
                  responsavel:
                    value,
                })
              }
            />

            <Input
              label="Prazo *"
              type="date"
              value={
                novoPDI.prazo
              }
              onChange={(value) =>
                setNovoPDI({
                  ...novoPDI,
                  prazo: value,
                })
              }
            />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  setModalPDI(
                    false,
                  )
                }
                className="min-h-11 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 sm:w-auto"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  cadastrarPDI
                }
                disabled={salvando}
                className="min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
              >
                {salvando
                  ? "Salvando..."
                  : "Criar objetivo"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modalFeedback && (
        <Modal
          titulo="Registrar novo feedback"
          onClose={() =>
            setModalFeedback(
              false,
            )
          }
        >
          <div className="space-y-4 sm:space-y-5">
            <Input
              label="Título *"
              value={
                novoFeedback.titulo
              }
              onChange={(value) =>
                setNovoFeedback({
                  ...novoFeedback,
                  titulo: value,
                })
              }
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Registrado por
              </label>

              <select
                value={
                  novoFeedback.autorId
                }
                onChange={(event) =>
                  setNovoFeedback({
                    ...novoFeedback,
                    autorId:
                      event.target.value,
                  })
                }
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base sm:text-sm"
              >
                <option value="">
                  Não informar autor
                </option>

                {colaboradores.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.nome} —{" "}
                      {item.cargo}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tipo
              </label>

              <select
                value={
                  novoFeedback.tipo
                }
                onChange={(event) =>
                  setNovoFeedback({
                    ...novoFeedback,
                    tipo:
                      event.target.value as TipoFeedbackBackend,
                  })
                }
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base sm:text-sm"
              >
                <option value="POSITIVO">
                  Positivo
                </option>

                <option value="DESENVOLVIMENTO">
                  Desenvolvimento
                </option>

                <option value="RECONHECIMENTO">
                  Reconhecimento
                </option>

                <option value="OUTRO">
                  Outro
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Feedback *
              </label>

              <textarea
                value={
                  novoFeedback.conteudo
                }
                onChange={(event) =>
                  setNovoFeedback({
                    ...novoFeedback,
                    conteudo:
                      event.target.value,
                  })
                }
                rows={5}
                placeholder="Digite o feedback..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-base sm:text-sm"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  setModalFeedback(
                    false,
                  )
                }
                className="min-h-11 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 sm:w-auto"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  cadastrarFeedback
                }
                disabled={salvando}
                className="min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
              >
                {salvando
                  ? "Salvando..."
                  : "Salvar feedback"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

function MetricCard({
  titulo,
  valor,
  descricao,
  icone,
}: {
  titulo: string;
  valor: string;
  descricao: string;
  icone: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
            {titulo}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            {valor}
          </p>

          <p className="mt-1 break-words text-[10px] leading-4 text-slate-400 sm:text-xs">
            {descricao}
          </p>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base sm:h-11 sm:w-11 sm:text-lg">
          {icone}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  valor,
}: {
  label: string;
  valor: string;
}) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {valor}
      </p>
    </div>
  );
}

function TabButton({
  ativo,
  onClick,
  icon,
  label,
}: {
  ativo: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 snap-start items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3.5 text-xs font-semibold transition sm:gap-2 sm:px-5 sm:py-4 sm:text-sm ${
        ativo
          ? "border-indigo-600 bg-indigo-50/50 text-indigo-700"
          : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function Modal({
  titulo,
  children,
  onClose,
}: {
  titulo: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-bold text-slate-800">
            {titulo}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

function EmptyState({
  icone,
  titulo,
  descricao,
}: {
  icone: string;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
      <div className="mb-3 text-4xl">
        {icone}
      </div>

      <h3 className="font-bold text-slate-800">
        {titulo}
      </h3>

      <p className="mt-1 break-words text-xs leading-5 text-slate-500 sm:text-sm">
        {descricao}
      </p>
    </div>
  );
}