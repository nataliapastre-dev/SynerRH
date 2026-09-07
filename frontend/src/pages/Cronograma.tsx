import {
  useEffect,
  useMemo,
  useState,
} from "react";

type StatusAtividade =
  | "Planejada"
  | "Em andamento"
  | "Concluída";

type TipoAtividade =
  | "Avaliação"
  | "Feedback"
  | "PDI";

type Atividade = {
  id: string;
  titulo: string;
  tipo: TipoAtividade;
  responsavel: string;
  dataInicio: string;
  dataFim: string;
  status: StatusAtividade;
  descricao: string;
  origem: string;
};

type CicloApi = {
  id: number;
  nome: string;
  descricao?: string | null;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
  createdAt?: string;
};

type AvaliacaoApi = {
  id: number;
  nota?: number | null;
  status:
    | "PENDENTE"
    | "EM_ANDAMENTO"
    | "CONCLUIDA";
  comentario?: string | null;
  dataConclusao?: string | null;
  createdAt?: string | null;

  colaborador?: {
    id: number;
    nome: string;
    cargo?: string;
  };

  ciclo?: {
    id: number;
    nome: string;
    dataInicio?: string;
    dataFim?: string;
  };
};

type PdiApi = {
  id: number;
  titulo: string;
  descricao?: string | null;
  objetivo?: string | null;
  prazo?: string | null;
  progresso?: number;
  status:
    | "NAO_INICIADO"
    | "EM_ANDAMENTO"
    | "CONCLUIDO"
    | "ATRASADO";
  responsavel?: string | null;
  createdAt?: string | null;

  colaborador?: {
    id: number;
    nome: string;
    cargo?: string;
  };
};

type FeedbackApi = {
  id: number;
  titulo: string;
  conteudo: string;
  tipo:
    | "POSITIVO"
    | "DESENVOLVIMENTO"
    | "RECONHECIMENTO"
    | "OUTRO";
  data?: string | null;
  createdAt?: string | null;

  colaborador?: {
    id: number;
    nome: string;
    cargo?: string;
  };

  autor?: {
    id: number;
    nome: string;
    cargo?: string;
  } | null;
};

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://localhost:3333";

const FETCH_OPTIONS: RequestInit = {
  cache: "no-store",
};

function obterLista<T>(
  dados: unknown,
): T[] {
  if (Array.isArray(dados)) {
    return dados as T[];
  }

  return [];
}

function formatarData(
  data:
    | string
    | null
    | undefined,
) {
  if (!data) {
    return "Não informada";
  }

  const dataSomente =
    data.slice(0, 10);

  const [ano, mes, dia] =
    dataSomente
      .split("-")
      .map(Number);

  if (
    !ano ||
    !mes ||
    !dia
  ) {
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

function obterTimestamp(
  data:
    | string
    | null
    | undefined,
) {
  if (!data) {
    return 0;
  }

  const valor =
    new Date(data);

  if (
    Number.isNaN(
      valor.getTime(),
    )
  ) {
    return 0;
  }

  return valor.getTime();
}

function statusCiclo(
  ciclo: CicloApi,
): StatusAtividade {
  if (ciclo.ativo) {
    return "Em andamento";
  }

  const agora =
    new Date().getTime();

  const inicio =
    obterTimestamp(
      ciclo.dataInicio,
    );

  const fim =
    obterTimestamp(
      ciclo.dataFim,
    );

  if (
    fim &&
    fim < agora
  ) {
    return "Concluída";
  }

  if (
    inicio &&
    inicio <= agora &&
    fim &&
    fim >= agora
  ) {
    return "Em andamento";
  }

  return "Planejada";
}

function statusAvaliacao(
  status:
    AvaliacaoApi["status"],
): StatusAtividade {
  switch (status) {
    case "CONCLUIDA":
      return "Concluída";

    case "EM_ANDAMENTO":
      return "Em andamento";

    case "PENDENTE":
    default:
      return "Planejada";
  }
}

function statusPdi(
  status:
    PdiApi["status"],
): StatusAtividade {
  switch (status) {
    case "CONCLUIDO":
      return "Concluída";

    case "EM_ANDAMENTO":
    case "ATRASADO":
      return "Em andamento";

    case "NAO_INICIADO":
    default:
      return "Planejada";
  }
}

export default function Cronograma() {
  const [
    atividades,
    setAtividades,
  ] =
    useState<Atividade[]>(
      [],
    );

  const [
    filtroStatus,
    setFiltroStatus,
  ] =
    useState<
      | "Todos"
      | StatusAtividade
    >("Todos");

  const [
    filtroTipo,
    setFiltroTipo,
  ] =
    useState<
      | "Todos"
      | TipoAtividade
    >("Todos");

  const [
    carregando,
    setCarregando,
  ] =
    useState(true);

  const [
    erro,
    setErro,
  ] =
    useState("");

  const carregarCronograma =
    async () => {
      try {
        setCarregando(true);
        setErro("");

        const [
          ciclosResponse,
          avaliacoesResponse,
          pdisResponse,
          feedbacksResponse,
        ] =
          await Promise.all([
            fetch(
              `${API_URL}/ciclos`,
              FETCH_OPTIONS,
            ),

            fetch(
              `${API_URL}/avaliacoes`,
              FETCH_OPTIONS,
            ),

            fetch(
              `${API_URL}/pdis`,
              FETCH_OPTIONS,
            ),

            fetch(
              `${API_URL}/feedbacks`,
              FETCH_OPTIONS,
            ),
          ]);

        if (
          !ciclosResponse.ok
        ) {
          throw new Error(
            "Erro ao buscar ciclos.",
          );
        }

        if (
          !avaliacoesResponse.ok
        ) {
          throw new Error(
            "Erro ao buscar avaliações.",
          );
        }

        if (
          !pdisResponse.ok
        ) {
          throw new Error(
            "Erro ao buscar PDIs.",
          );
        }

        if (
          !feedbacksResponse.ok
        ) {
          throw new Error(
            "Erro ao buscar feedbacks.",
          );
        }

        const ciclosJson =
          await ciclosResponse.json();

        const avaliacoesJson =
          await avaliacoesResponse.json();

        const pdisJson =
          await pdisResponse.json();

        const feedbacksJson =
          await feedbacksResponse.json();

        const ciclos =
          obterLista<CicloApi>(
            ciclosJson,
          );

        const avaliacoes =
          obterLista<AvaliacaoApi>(
            avaliacoesJson,
          );

        const pdis =
          obterLista<PdiApi>(
            pdisJson,
          );

        const feedbacks =
          obterLista<FeedbackApi>(
            feedbacksJson,
          );

        const atividadesCiclos:
          Atividade[] =
          ciclos.map(
            (
              ciclo,
            ) => ({
              id:
                `ciclo-${ciclo.id}`,

              titulo:
                ciclo.nome,

              tipo:
                "Avaliação",

              responsavel:
                "RH",

              dataInicio:
                formatarData(
                  ciclo.dataInicio,
                ),

              dataFim:
                formatarData(
                  ciclo.dataFim,
                ),

              status:
                statusCiclo(
                  ciclo,
                ),

              descricao:
                ciclo.descricao ??
                "Ciclo de avaliação de desempenho.",

              origem:
                "Ciclo de avaliação",
            }),
          );

        const atividadesAvaliacoes:
          Atividade[] =
          avaliacoes.map(
            (
              avaliacao,
            ) => {
              const dataInicio =
                avaliacao
                  .ciclo
                  ?.dataInicio ??
                avaliacao.createdAt;

              const dataFim =
                avaliacao
                  .dataConclusao ??
                avaliacao
                  .ciclo
                  ?.dataFim ??
                dataInicio;

              return {
                id:
                  `avaliacao-${avaliacao.id}`,

                titulo:
                  `Avaliação — ${
                    avaliacao
                      .colaborador
                      ?.nome ??
                    "Colaborador"
                  }`,

                tipo:
                  "Avaliação",

                responsavel:
                  avaliacao
                    .colaborador
                    ?.nome ??
                  "Não informado",

                dataInicio:
                  formatarData(
                    dataInicio,
                  ),

                dataFim:
                  formatarData(
                    dataFim,
                  ),

                status:
                  statusAvaliacao(
                    avaliacao.status,
                  ),

                descricao:
                  avaliacao.comentario ??
                  `${
                    avaliacao
                      .ciclo
                      ?.nome
                      ? `Avaliação vinculada ao ciclo ${avaliacao.ciclo.nome}.`
                      : "Avaliação de desempenho."
                  }`,

                origem:
                  "Avaliação",
              };
            },
          );

        const atividadesPdis:
          Atividade[] =
          pdis.map(
            (
              pdi,
            ) => ({
              id:
                `pdi-${pdi.id}`,

              titulo:
                `PDI — ${pdi.titulo}`,

              tipo:
                "PDI",

              responsavel:
                pdi.responsavel ??
                pdi
                  .colaborador
                  ?.nome ??
                "Não informado",

              dataInicio:
                formatarData(
                  pdi.createdAt,
                ),

              dataFim:
                formatarData(
                  pdi.prazo ??
                    pdi.createdAt,
                ),

              status:
                statusPdi(
                  pdi.status,
                ),

              descricao:
                pdi.descricao ??
                pdi.objetivo ??
                "Plano de desenvolvimento individual.",

              origem:
                "PDI",
            }),
          );

        const atividadesFeedbacks:
          Atividade[] =
          feedbacks.map(
            (
              feedback,
            ) => {
              const data =
                feedback.data ??
                feedback.createdAt;

              return {
                id:
                  `feedback-${feedback.id}`,

                titulo:
                  `Feedback — ${feedback.titulo}`,

                tipo:
                  "Feedback",

                responsavel:
                  feedback.autor
                    ?.nome ??
                  "Não informado",

                dataInicio:
                  formatarData(
                    data,
                  ),

                dataFim:
                  formatarData(
                    data,
                  ),

                status:
                  "Concluída",

                descricao:
                  feedback.conteudo,

                origem:
                  feedback
                    .colaborador
                    ?.nome
                    ? `Feedback para ${feedback.colaborador.nome}`
                    : "Feedback",
              };
            },
          );

        const todasAtividades =
          [
            ...atividadesCiclos,
            ...atividadesAvaliacoes,
            ...atividadesPdis,
            ...atividadesFeedbacks,
          ];

        setAtividades(
          todasAtividades,
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );

        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o cronograma.",
        );
      } finally {
        setCarregando(
          false,
        );
      }
    };

  useEffect(() => {
    carregarCronograma();
  }, []);

  const atividadesFiltradas =
    useMemo(() => {
      return atividades.filter(
        (
          atividade,
        ) => {
          const correspondeStatus =
            filtroStatus ===
              "Todos" ||
            atividade.status ===
              filtroStatus;

          const correspondeTipo =
            filtroTipo ===
              "Todos" ||
            atividade.tipo ===
              filtroTipo;

          return (
            correspondeStatus &&
            correspondeTipo
          );
        },
      );
    }, [
      atividades,
      filtroStatus,
      filtroTipo,
    ]);

  const totalAtividades =
    atividades.length;

  const atividadesConcluidas =
    atividades.filter(
      (
        atividade,
      ) =>
        atividade.status ===
        "Concluída",
    ).length;

  const atividadesAndamento =
    atividades.filter(
      (
        atividade,
      ) =>
        atividade.status ===
        "Em andamento",
    ).length;

  const atividadesPlanejadas =
    atividades.filter(
      (
        atividade,
      ) =>
        atividade.status ===
        "Planejada",
    ).length;

  function corStatus(
    status:
      StatusAtividade,
  ) {
    if (
      status ===
      "Concluída"
    ) {
      return "bg-emerald-50 text-emerald-700";
    }

    if (
      status ===
      "Em andamento"
    ) {
      return "bg-indigo-50 text-indigo-700";
    }

    return "bg-amber-50 text-amber-700";
  }

  function iconeTipo(
    tipo:
      TipoAtividade,
  ) {
    if (
      tipo ===
      "Avaliação"
    ) {
      return "📝";
    }

    if (
      tipo ===
      "Feedback"
    ) {
      return "💬";
    }

    return "🎯";
  }

  return (
    <section className="min-w-0 space-y-5 overflow-x-hidden pb-4 sm:space-y-6 sm:pb-0">

      {/* CABEÇALHO */}

      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <h2 className="text-[28px] font-bold leading-tight text-slate-800 sm:text-3xl">
            Cronograma
          </h2>

          <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-sm">
            Acompanhe as etapas,
            períodos e prazos de
            avaliação, feedback e
            desenvolvimento dos
            colaboradores.
          </p>

        </div>

        <button
          type="button"
          onClick={
            carregarCronograma
          }
          disabled={
            carregando
          }
          className="min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {carregando
            ? "Atualizando..."
            : "↻ Atualizar cronograma"}
        </button>

      </div>

      {/* ERRO */}

      {erro && (
        <div className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 sm:px-4">

          <span>
            {erro}
          </span>

          <button
            type="button"
            onClick={() =>
              setErro("")
            }
            className="font-bold text-red-700 hover:text-red-900"
          >
            ×
          </button>

        </div>
      )}

      {/* INDICADORES */}

      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">

        <MetricCard
          titulo="Total de atividades"
          valor={
            carregando
              ? "—"
              : totalAtividades
          }
          icone="📅"
        />

        <MetricCard
          titulo="Concluídas"
          valor={
            carregando
              ? "—"
              : atividadesConcluidas
          }
          icone="✅"
        />

        <MetricCard
          titulo="Em andamento"
          valor={
            carregando
              ? "—"
              : atividadesAndamento
          }
          icone="🔄"
        />

        <MetricCard
          titulo="Planejadas"
          valor={
            carregando
              ? "—"
              : atividadesPlanejadas
          }
          icone="📌"
        />

      </div>

      {/* FILTROS */}

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

        <div className="mb-4">

          <h3 className="font-semibold text-slate-800">
            Filtros
          </h3>

          <p className="text-sm text-slate-500">
            Refine as atividades
            exibidas no cronograma.
          </p>

        </div>

        <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>

            <select
              value={
                filtroStatus
              }
              onChange={(
                event,
              ) =>
                setFiltroStatus(
                  event.target
                    .value as
                    | "Todos"
                    | StatusAtividade,
                )
              }
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
            >

              <option value="Todos">
                Todos os status
              </option>

              <option value="Planejada">
                Planejada
              </option>

              <option value="Em andamento">
                Em andamento
              </option>

              <option value="Concluída">
                Concluída
              </option>

            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tipo
            </label>

            <select
              value={
                filtroTipo
              }
              onChange={(
                event,
              ) =>
                setFiltroTipo(
                  event.target
                    .value as
                    | "Todos"
                    | TipoAtividade,
                )
              }
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
            >

              <option value="Todos">
                Todos os tipos
              </option>

              <option value="Avaliação">
                Avaliação
              </option>

              <option value="Feedback">
                Feedback
              </option>

              <option value="PDI">
                PDI
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* LISTA */}

      <div className="min-w-0 space-y-3 sm:space-y-4">

        {carregando ? (

          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">

            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

            <p className="text-sm text-slate-500">
              Carregando cronograma...
            </p>

          </div>

        ) : atividadesFiltradas.length ===
          0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">

            <div className="mb-3 text-4xl">
              📅
            </div>

            <h3 className="break-words font-bold leading-5 text-slate-800">
              Nenhuma atividade encontrada
            </h3>

            <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-sm">
              Não existem atividades
              para os filtros
              selecionados.
            </p>

          </div>

        ) : (

          atividadesFiltradas.map(
            (
              atividade,
            ) => (

              <div
                key={
                  atividade.id
                }
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
              >

                <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">

                  <div className="flex min-w-0 gap-3 sm:gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base sm:h-12 sm:w-12 sm:text-xl">
                      {iconeTipo(
                        atividade.tipo,
                      )}
                    </div>

                    <div>

                      <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                        <h3 className="break-words font-bold leading-5 text-slate-800">
                          {
                            atividade.titulo
                          }
                        </h3>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {
                            atividade.tipo
                          }
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${corStatus(
                            atividade.status,
                          )}`}
                        >
                          {
                            atividade.status
                          }
                        </span>

                      </div>

                      <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-500">
                        {
                          atividade.descricao
                        }
                      </p>

                      <div className="mt-4 grid gap-2 text-xs leading-5 text-slate-500 sm:flex sm:flex-wrap sm:gap-4">

                        <span>
                          👤{" "}
                          <strong className="text-slate-700">
                            {
                              atividade.responsavel
                            }
                          </strong>
                        </span>

                        <span>
                          📅{" "}
                          <strong className="text-slate-700">
                            {
                              atividade.dataInicio
                            }
                          </strong>

                          {" → "}

                          <strong className="text-slate-700">
                            {
                              atividade.dataFim
                            }
                          </strong>
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="shrink-0 self-start">

                    <span className="inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      {
                        atividade.origem
                      }
                    </span>

                  </div>

                </div>

              </div>

            ),
          )

        )}

      </div>

    </section>
  );
}

function MetricCard({
  titulo,
  valor,
  icone,
}: {
  titulo: string;
  valor:
    | number
    | string;
  icone: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

      <div className="flex min-w-0 items-start justify-between gap-2">

        <div>

          <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
            {titulo}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            {valor}
          </p>

        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base sm:h-11 sm:w-11 sm:text-lg">
          {icone}
        </div>

      </div>

    </div>
  );
}