import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import synerhLogo from "../assets/synerh-logo.png";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ColaboradorApi = {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;

  status:
    | "ATIVO"
    | "FERIAS"
    | "AFASTADO"
    | "INATIVO";

  dataAdmissao: string;

  avatar?:
    | string
    | null;
};

type CicloApi = {
  id: number;
  nome: string;

  descricao?:
    | string
    | null;

  dataInicio: string;
  dataFim: string;
  ativo: boolean;
};

type AvaliacaoApi = {
  id: number;

  nota:
    | number
    | null;

  status:
    | "PENDENTE"
    | "EM_ANDAMENTO"
    | "CONCLUIDA";

  comentario?:
    | string
    | null;

  dataConclusao?:
    | string
    | null;

  colaboradorId: number;
  cicloId: number;

  createdAt: string;
  updatedAt: string;

  colaborador?: {
    id: number;
    nome: string;
    email?: string;
    cargo: string;
    departamento: string;
    status?: string;
  };

  ciclo?: {
    id: number;
    nome: string;

    descricao?:
      | string
      | null;

    dataInicio: string;
    dataFim: string;
    ativo: boolean;
  };
};

type PdiApi = {
  id: number;
  titulo: string;

  descricao?:
    | string
    | null;

  objetivo?:
    | string
    | null;

  prazo?:
    | string
    | null;

  progresso: number;

  status:
    | "NAO_INICIADO"
    | "EM_ANDAMENTO"
    | "CONCLUIDO"
    | "ATRASADO";

  responsavel?:
    | string
    | null;

  colaboradorId: number;

  createdAt:
    | string
    | null;

  updatedAt:
    | string
    | null;

  colaborador?: {
    id: number;
    nome: string;
    cargo?: string;
    departamento?: string;
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

  data:
    | string
    | null;

  colaboradorId: number;

  autorId?:
    | number
    | null;

  createdAt:
    | string
    | null;

  updatedAt:
    | string
    | null;

  colaborador?: {
    id: number;
    nome: string;
    cargo?: string;
    departamento?: string;
  };

  autor?: {
    id: number;
    nome: string;
    cargo?: string;
  } | null;
};

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: string;
  iconClass: string;
  accentClass: string;

  descriptionClass?:
    string;
};

type AlertItem = {
  title: string;
  description: string;
  className: string;
  titleClass: string;
  descriptionClass: string;
  icon: string;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  date: number;
  icon: string;
  iconClass: string;
};


type ParticipationData = {
  name: string;
  value: number;
};

type DepartmentPerformanceData = {
  name: string;
  desempenho: number;
};

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://localhost:3333";

const FETCH_OPTIONS: RequestInit = {
  cache: "no-store",
};

const pieColors = [
  "#10b981",
  "#dbeafe",
];

function formatarNumero(
  valor: number,
) {
  return valor.toLocaleString(
    "pt-BR",
  );
}

function formatarData(
  data: string,
) {
  if (!data) {
    return "Data não informada";
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
    return "Data não informada";
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

function formatarDataHora(
  data:
    | string
    | null
    | undefined,
) {
  if (!data) {
    return "Agora";
  }

  const agora =
    new Date();

  const dataEvento =
    new Date(data);

  if (
    Number.isNaN(
      dataEvento.getTime(),
    )
  ) {
    return "";
  }

  const diferencaMs =
    agora.getTime() -
    dataEvento.getTime();

  const diferencaMinutos =
    Math.floor(
      diferencaMs /
        (1000 * 60),
    );

  if (
    diferencaMinutos <
    1
  ) {
    return "Agora";
  }

  if (
    diferencaMinutos <
    60
  ) {
    return `Há ${diferencaMinutos} min`;
  }

  const diferencaHoras =
    Math.floor(
      diferencaMinutos /
        60,
    );

  if (
    diferencaHoras <
    24
  ) {
    return `Há ${diferencaHoras}h`;
  }

  const diferencaDias =
    Math.floor(
      diferencaHoras /
        24,
    );

  if (
    diferencaDias ===
    1
  ) {
    return "Ontem";
  }

  return `Há ${diferencaDias} dias`;
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

function MetricCard({
  title,
  value,
  description,
  icon,
  iconClass,
  accentClass,
  descriptionClass = "text-slate-500",
}: MetricCardProps) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${accentClass}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.08em] text-slate-400 sm:text-sm sm:normal-case sm:tracking-normal">
            {title}
          </p>

          <p className="mt-1.5 text-2xl font-black tracking-tight text-slate-900 sm:mt-3 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ring-1 ring-inset ring-white/60 sm:h-11 sm:w-11 sm:text-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <p
        className={`mt-2 min-h-8 break-words text-[10px] font-semibold leading-4 sm:mt-3 sm:text-xs ${descriptionClass}`}
      >
        {description}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [
    colaboradores,
    setColaboradores,
  ] =
    useState<
      ColaboradorApi[]
    >([]);

  const [
    avaliacoes,
    setAvaliacoes,
  ] =
    useState<
      AvaliacaoApi[]
    >([]);

  const [
    ciclos,
    setCiclos,
  ] =
    useState<
      CicloApi[]
    >([]);

  const [
    pdis,
    setPdis,
  ] =
    useState<
      PdiApi[]
    >([]);

  const [
    feedbacks,
    setFeedbacks,
  ] =
    useState<
      FeedbackApi[]
    >([]);

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

  const currentDate =
    new Intl.DateTimeFormat(
      "pt-BR",
      {
        weekday:
          "long",

        day:
          "2-digit",

        month:
          "long",

        year:
          "numeric",
      },
    ).format(
      new Date(),
    );

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregando(
          true,
        );

        setErro("");

        const [
          colaboradoresResponse,
          avaliacoesResponse,
          ciclosResponse,
          pdisResponse,
          feedbacksResponse,
        ] =
          await Promise.all([
            fetch(
              `${API_URL}/colaboradores`,
              FETCH_OPTIONS,
            ),

            fetch(
              `${API_URL}/avaliacoes`,
              FETCH_OPTIONS,
            ),

            fetch(
              `${API_URL}/ciclos`,
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
          !colaboradoresResponse.ok ||
          !avaliacoesResponse.ok ||
          !ciclosResponse.ok ||
          !pdisResponse.ok ||
          !feedbacksResponse.ok
        ) {
          throw new Error(
            "Não foi possível carregar os dados do Dashboard.",
          );
        }

        const [
          colaboradoresData,
          avaliacoesData,
          ciclosData,
          pdisData,
          feedbacksData,
        ] =
          await Promise.all([
            colaboradoresResponse.json(),
            avaliacoesResponse.json(),
            ciclosResponse.json(),
            pdisResponse.json(),
            feedbacksResponse.json(),
          ]);

        setColaboradores(
          Array.isArray(
            colaboradoresData,
          )
            ? colaboradoresData
            : [],
        );

        setAvaliacoes(
          Array.isArray(
            avaliacoesData,
          )
            ? avaliacoesData
            : [],
        );

        setCiclos(
          Array.isArray(
            ciclosData,
          )
            ? ciclosData
            : [],
        );

        setPdis(
          Array.isArray(
            pdisData,
          )
            ? pdisData
            : [],
        );

        setFeedbacks(
          Array.isArray(
            feedbacksData,
          )
            ? feedbacksData
            : [],
        );
      } catch (
        error
      ) {
        console.error(
          "Erro ao carregar Dashboard:",
          error,
        );

        setErro(
          "Não foi possível carregar os dados da API.",
        );
      } finally {
        setCarregando(
          false,
        );
      }
    }

    carregarDashboard();
  }, []);

  const cicloAtivo =
    useMemo(() => {
      return (
        ciclos.find(
          (
            ciclo,
          ) =>
            ciclo.ativo,
        ) ??
        ciclos[0] ??
        null
      );
    }, [
      ciclos,
    ]);

  const avaliacoesConcluidas =
    useMemo(() => {
      return avaliacoes.filter(
        (
          avaliacao,
        ) =>
          avaliacao.status ===
          "CONCLUIDA",
      );
    }, [
      avaliacoes,
    ]);

  const avaliacoesPendentes =
    useMemo(() => {
      return avaliacoes.filter(
        (
          avaliacao,
        ) =>
          avaliacao.status ===
          "PENDENTE",
      );
    }, [
      avaliacoes,
    ]);

  const avaliacoesEmAndamento =
    useMemo(() => {
      return avaliacoes.filter(
        (
          avaliacao,
        ) =>
          avaliacao.status ===
          "EM_ANDAMENTO",
      );
    }, [
      avaliacoes,
    ]);

  const avaliacoesComNota =
    useMemo(() => {
      return avaliacoes.filter(
        (
          avaliacao,
        ) =>
          avaliacao.nota !==
            null &&
          typeof avaliacao.nota ===
            "number",
      );
    }, [
      avaliacoes,
    ]);

  const pdisAtivos =
    useMemo(() => {
      return pdis.filter(
        (
          pdi,
        ) =>
          pdi.status !==
          "CONCLUIDO",
      );
    }, [
      pdis,
    ]);

  const pdisEmAndamento =
    useMemo(() => {
      return pdis.filter(
        (
          pdi,
        ) =>
          pdi.status ===
          "EM_ANDAMENTO",
      );
    }, [
      pdis,
    ]);

  const pdisAtrasados =
    useMemo(() => {
      return pdis.filter(
        (
          pdi,
        ) =>
          pdi.status ===
          "ATRASADO",
      );
    }, [
      pdis,
    ]);

const feedbacksPositivos =
    useMemo(() => {
      return feedbacks.filter(
        (
          feedback,
        ) =>
          feedback.tipo ===
          "POSITIVO",
      );
    }, [
      feedbacks,
    ]);

  const feedbacksDesenvolvimento =
    useMemo(() => {
      return feedbacks.filter(
        (
          feedback,
        ) =>
          feedback.tipo ===
          "DESENVOLVIMENTO",
      );
    }, [
      feedbacks,
    ]);

  const desempenhoMedio =
    useMemo(() => {
      if (
        avaliacoesComNota.length ===
        0
      ) {
        return 0;
      }

      const soma =
        avaliacoesComNota.reduce(
          (
            total,
            avaliacao,
          ) =>
            total +
            Number(
              avaliacao.nota,
            ),
          0,
        );

      return (
        soma /
        avaliacoesComNota.length
      );
    }, [
      avaliacoesComNota,
    ]);

  const participacaoPercentual =
    useMemo(() => {
      if (
        avaliacoes.length ===
        0
      ) {
        return 0;
      }

      return Math.round(
        (
          avaliacoesConcluidas.length /
          avaliacoes.length
        ) *
          100,
      );
    }, [
      avaliacoes.length,
      avaliacoesConcluidas.length,
    ]);

  const progressoCiclo =
    useMemo(() => {
      if (
        !cicloAtivo
      ) {
        return 0;
      }

      const avaliacoesDoCiclo =
        avaliacoes.filter(
          (
            avaliacao,
          ) =>
            avaliacao.cicloId ===
            cicloAtivo.id,
        );

      if (
        avaliacoesDoCiclo.length ===
        0
      ) {
        return 0;
      }

      const concluidas =
        avaliacoesDoCiclo.filter(
          (
            avaliacao,
          ) =>
            avaliacao.status ===
            "CONCLUIDA",
        ).length;

      return Math.round(
        (
          concluidas /
          avaliacoesDoCiclo.length
        ) *
          100,
      );
    }, [
      avaliacoes,
      cicloAtivo,
    ]);

  const participationData =
    useMemo<
      ParticipationData[]
    >(() => {
      return [
        {
          name:
            "Concluídas",

          value:
            avaliacoesConcluidas.length,
        },

        {
          name:
            "Pendentes",

          value:
            avaliacoes.length -
            avaliacoesConcluidas.length,
        },
      ];
    }, [
      avaliacoes.length,
      avaliacoesConcluidas.length,
    ]);

  const departmentPerformance =
    useMemo<
      DepartmentPerformanceData[]
    >(() => {
      const departamentos =
        new Map<
          string,
          number[]
        >();

      avaliacoesComNota.forEach(
        (
          avaliacao,
        ) => {
          const colaborador =
            avaliacao.colaborador ??
            colaboradores.find(
              (
                item,
              ) =>
                item.id ===
                avaliacao.colaboradorId,
            );

          if (
            !colaborador
          ) {
            return;
          }

          const departamento =
            colaborador.departamento;

          const notas =
            departamentos.get(
              departamento,
            ) ??
            [];

          notas.push(
            Number(
              avaliacao.nota,
            ),
          );

          departamentos.set(
            departamento,
            notas,
          );
        },
      );

      return Array.from(
        departamentos.entries(),
      )
        .map(
          ([
            name,
            notas,
          ]) => {
            const media =
              notas.reduce(
                (
                  total,
                  nota,
                ) =>
                  total +
                  nota,
                0,
              ) /
              notas.length;

            return {
              name,

              desempenho:
                Math.round(
                  media *
                    10,
                ) /
                10,
            };
          },
        )
        .sort(
          (
            a,
            b,
          ) =>
            b.desempenho -
            a.desempenho,
        )
        .slice(
          0,
          6,
        );
    }, [
      avaliacoesComNota,
      colaboradores,
    ]);

  const activities =
    useMemo<
      ActivityItem[]
    >(() => {
      const atividades:
        ActivityItem[] =
        [];

      avaliacoes.forEach(
        (
          avaliacao,
        ) => {
          const colaborador =
            avaliacao.colaborador ??
            colaboradores.find(
              (
                item,
              ) =>
                item.id ===
                avaliacao.colaboradorId,
            );

          const nome =
            colaborador?.nome ??
            "Colaborador";

          const data =
            avaliacao.updatedAt ??
            avaliacao.createdAt;

          if (
            avaliacao.status ===
            "CONCLUIDA"
          ) {
            atividades.push({
              id:
                `avaliacao-${avaliacao.id}`,

              title:
                "Avaliação concluída",

              description:
                `${nome} concluiu uma avaliação de desempenho.`,

              time:
                formatarDataHora(
                  data,
                ),

              date:
                obterTimestamp(
                  data,
                ),

              icon:
                "✓",

              iconClass:
                "bg-emerald-100 text-emerald-700",
            });

            return;
          }

          if (
            avaliacao.status ===
            "EM_ANDAMENTO"
          ) {
            atividades.push({
              id:
                `avaliacao-${avaliacao.id}`,

              title:
                "Avaliação em andamento",

              description:
                `${nome} iniciou uma avaliação de desempenho.`,

              time:
                formatarDataHora(
                  data,
                ),

              date:
                obterTimestamp(
                  data,
                ),

              icon:
                "↗",

              iconClass:
                "bg-blue-100 text-blue-700",
            });

            return;
          }

          atividades.push({
            id:
              `avaliacao-${avaliacao.id}`,

            title:
              "Avaliação registrada",

            description:
              `Uma avaliação foi registrada para ${nome}.`,

            time:
              formatarDataHora(
                avaliacao.createdAt,
              ),

            date:
              obterTimestamp(
                avaliacao.createdAt,
              ),

            icon:
              "📋",

            iconClass:
              "bg-violet-100 text-violet-700",
          });
        },
      );

      pdis.forEach(
        (
          pdi,
        ) => {
          const nome =
            pdi.colaborador
              ?.nome ??
            "Colaborador";

          const data =
            pdi.updatedAt ??
            pdi.createdAt;

          atividades.push({
            id:
              `pdi-${pdi.id}`,

            title:
              pdi.status ===
              "CONCLUIDO"
                ? "PDI concluído"
                : "PDI atualizado",

            description:
              `${nome}: ${pdi.titulo} — ${pdi.progresso ?? 0}% de progresso.`,

            time:
              formatarDataHora(
                data,
              ),

            date:
              obterTimestamp(
                data,
              ),

            icon:
              "🎯",

            iconClass:
              pdi.status ===
              "CONCLUIDO"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700",
          });
        },
      );

      feedbacks.forEach(
        (
          feedback,
        ) => {
          const nome =
            feedback.colaborador
              ?.nome ??
            "Colaborador";

          const data =
            feedback.data ??
            feedback.createdAt;

          atividades.push({
            id:
              `feedback-${feedback.id}`,

            title:
              "Novo feedback",

            description:
              `${feedback.titulo} — ${nome}.`,

            time:
              formatarDataHora(
                data,
              ),

            date:
              obterTimestamp(
                data,
              ),

            icon:
              "💬",

            iconClass:
              feedback.tipo ===
              "POSITIVO"
                ? "bg-emerald-100 text-emerald-700"
                : feedback.tipo ===
                    "RECONHECIMENTO"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-orange-100 text-orange-700",
          });
        },
      );

      return atividades
        .sort(
          (
            a,
            b,
          ) =>
            b.date -
            a.date,
        )
        .slice(
          0,
          5,
        );
    }, [
      avaliacoes,
      pdis,
      feedbacks,
      colaboradores,
    ]);

  const alerts =
    useMemo<
      AlertItem[]
    >(() => {
      const resultado:
        AlertItem[] =
        [];

      if (
        avaliacoesPendentes.length >
        0
      ) {
        resultado.push({
          title:
            `${avaliacoesPendentes.length} avaliações pendentes`,

          description:
            "Existem avaliações aguardando início ou resposta.",

          icon:
            "!",

          className:
            "border-amber-200 bg-amber-50",

          titleClass:
            "text-amber-900",

          descriptionClass:
            "text-amber-700",
        });
      }

      if (
        avaliacoesEmAndamento.length >
        0
      ) {
        resultado.push({
          title:
            `${avaliacoesEmAndamento.length} avaliações em andamento`,

          description:
            "Existem avaliações que já foram iniciadas.",

          icon:
            "↗",

          className:
            "border-blue-200 bg-blue-50",

          titleClass:
            "text-blue-900",

          descriptionClass:
            "text-blue-700",
        });
      }

      if (
        pdisAtrasados.length >
        0
      ) {
        resultado.push({
          title:
            `${pdisAtrasados.length} PDIs atrasados`,

          description:
            "Existem planos de desenvolvimento que precisam de acompanhamento.",

          icon:
            "🎯",

          className:
            "border-red-200 bg-red-50",

          titleClass:
            "text-red-900",

          descriptionClass:
            "text-red-700",
        });
      }

      if (
        resultado.length ===
        0
      ) {
        resultado.push({
          title:
            "Tudo em dia",

          description:
            "Não existem pendências críticas no momento.",

          icon:
            "✓",

          className:
            "border-emerald-200 bg-emerald-50",

          titleClass:
            "text-emerald-900",

          descriptionClass:
            "text-emerald-700",
        });
      }

      return resultado;
    }, [
      avaliacoesPendentes.length,
      avaliacoesEmAndamento.length,
      pdisAtrasados.length,
    ]);

  const percentualDesempenho =
    Math.min(
      Math.max(
        Math.round(
          desempenhoMedio *
            10,
        ),
        0,
      ),
      100,
    );

  const quantidadeColaboradoresAtivos =
    colaboradores.filter(
      (
        colaborador,
      ) =>
        colaborador.status ===
        "ATIVO",
    ).length;

  const tituloCiclo =
    cicloAtivo?.nome ??
    "Nenhum ciclo ativo";

  const descricaoCiclo =
    cicloAtivo
      ? `${formatarData(
          cicloAtivo.dataInicio,
        )} até ${formatarData(
          cicloAtivo.dataFim,
        )}`
      : "Cadastre um ciclo de avaliação para começar.";

  const metrics:
    MetricCardProps[] =
    [
      {
        title:
          "Colaboradores",

        value:
          carregando
            ? "..."
            : formatarNumero(
                colaboradores.length,
              ),

        description:
          quantidadeColaboradoresAtivos >
          0
            ? `${quantidadeColaboradoresAtivos} ativos`
            : "Nenhum colaborador ativo",

        icon:
          "👥",

        iconClass:
          "bg-blue-100 text-blue-700",

        accentClass:
          "bg-gradient-to-r from-blue-500 to-cyan-400",

        descriptionClass:
          "text-emerald-600",
      },

      {
        title:
          "Avaliações",

        value:
          carregando
            ? "..."
            : formatarNumero(
                avaliacoes.length,
              ),

        description:
          avaliacoesPendentes.length >
          0
            ? `${avaliacoesPendentes.length} pendentes`
            : "Nenhuma pendente",

        icon:
          "📋",

        iconClass:
          "bg-violet-100 text-violet-700",

        accentClass:
          "bg-gradient-to-r from-violet-500 to-fuchsia-400",

        descriptionClass:
          avaliacoesPendentes.length >
          0
            ? "text-amber-600"
            : "text-emerald-600",
      },

      {
        title:
          "PDIs ativos",

        value:
          carregando
            ? "..."
            : formatarNumero(
                pdisAtivos.length,
              ),

        description:
          pdisAtrasados.length >
          0
            ? `${pdisAtrasados.length} atrasado(s)`
            : pdisEmAndamento.length >
                0
              ? `${pdisEmAndamento.length} em andamento`
              : pdis.length >
                  0
                ? "Nenhum PDI atrasado"
                : "Nenhum PDI cadastrado",

        icon:
          "🎯",

        iconClass:
          "bg-emerald-100 text-emerald-700",

        accentClass:
          "bg-gradient-to-r from-emerald-500 to-teal-400",

        descriptionClass:
          pdisAtrasados.length >
          0
            ? "text-red-600"
            : "text-emerald-600",
      },

      {
        title:
          "Feedbacks",

        value:
          carregando
            ? "..."
            : formatarNumero(
                feedbacks.length,
              ),

        description:
          feedbacks.length >
          0
            ? `${feedbacksPositivos.length} positivos · ${feedbacksDesenvolvimento.length} desenvolvimento`
            : "Nenhum feedback cadastrado",

        icon:
          "💬",

        iconClass:
          "bg-orange-100 text-orange-700",

        accentClass:
          "bg-gradient-to-r from-orange-500 to-amber-400",

        descriptionClass:
          feedbacks.length >
          0
            ? "text-blue-600"
            : "text-slate-500",
      },
    ];

  const totalPendencias =
    avaliacoesPendentes.length +
    avaliacoesEmAndamento.length +
    pdisAtrasados.length;

  return (
    <section className="min-h-screen min-w-0 overflow-x-hidden rounded-none bg-[#f7f9ff] pb-4 sm:rounded-3xl sm:pb-0">

      {/* CABEÇALHO */}
      <div className="mb-5 overflow-hidden rounded-[22px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/80 to-violet-50 shadow-[0_14px_35px_rgba(37,99,235,0.10)] sm:mb-8 sm:rounded-[28px] sm:shadow-[0_20px_55px_rgba(37,99,235,0.10)]">
        <div className="relative overflow-hidden p-4 sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-300/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative grid gap-6 xl:grid-cols-[1.25fr_0.75fr] xl:items-center">
            <div className="min-w-0">
              <div className="mb-4 flex w-full max-w-[235px] rounded-2xl border border-white/80 bg-white/90 p-2.5 shadow-sm backdrop-blur sm:mb-5 sm:inline-flex sm:w-auto sm:max-w-none sm:p-3">
                <img
                  src={synerhLogo}
                  alt="SynerRH — Gestão e desenvolvimento de colaboradores"
                  className="h-auto w-full max-w-[210px] object-contain sm:w-[285px] sm:max-w-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                  Visão geral
                </span>

                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  ● Dados atualizados
                </span>

                {carregando && (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    Atualizando...
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-[28px] font-black leading-[1.08] tracking-tight text-slate-950 sm:text-4xl lg:text-[42px]">
                Visão geral da sua equipe
              </h1>

              <p className="mt-3 max-w-2xl text-[13px] leading-5 text-slate-600 sm:text-base sm:leading-6">
                Acompanhe desempenho, desenvolvimento e os principais indicadores de pessoas em um só lugar.
              </p>

              <p className="mt-3 text-[13px] font-semibold text-blue-700 sm:mt-4 sm:text-sm">
                Pessoas no centro. Dados para decisões melhores.
              </p>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="min-w-0 rounded-2xl border border-blue-100 bg-white/90 p-3.5 shadow-sm backdrop-blur sm:p-4">
                <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Última atualização
                    </p>
                    <p className="mt-1 text-sm font-bold capitalize text-slate-800">
                      {currentDate}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-xl">
                    ↻
                  </div>
                </div>
              </div>

              <div className="min-w-0 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-3.5 text-white shadow-lg shadow-blue-600/15 sm:p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">
                  Equipe monitorada
                </p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3 sm:gap-4">
                  <div>
                    <p className="text-3xl font-black">{colaboradores.length}</p>
                    <p className="mt-1 text-xs text-blue-100">colaboradores cadastrados</p>
                  </div>
                  <div className="rounded-xl bg-white/15 px-3 py-2 text-xs font-bold backdrop-blur">
                    {quantidadeColaboradoresAtivos} ativos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ERRO */}

      {erro && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

          <p className="text-sm font-medium text-red-800">
            {erro}
          </p>

          <p className="mt-1 text-xs text-red-600">
            Verifique se o backend do SynerRH está
            rodando em http://localhost:3333.
          </p>

        </div>
      )}

      {/* CARDS */}

      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">

        {metrics.map(
          (
            metric,
          ) => (
            <MetricCard
              key={
                metric.title
              }
              {...metric}
            />
          ),
        )}

      </div>

      {/* INDICADORES */}

      <div className="mt-4 grid min-w-0 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">

        {/* DESEMPENHO */}

        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">

          <div className="flex items-start justify-between">

            <div>

              <h2 className="font-semibold text-slate-900">
                Desempenho médio
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Avaliações com nota registrada
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
              📈
            </div>

          </div>

          <div className="mt-7 flex items-end gap-3">

            <span className="text-4xl font-bold tracking-tight text-slate-900">

              {desempenhoMedio >
              0
                ? desempenhoMedio
                    .toFixed(
                      1,
                    )
                    .replace(
                      ".",
                      ",",
                    )
                : "—"}

            </span>

          </div>

          <div className="mt-6">

            <div className="mb-2 flex justify-between text-xs text-slate-400">

              <span>
                Resultado
              </span>

              <span>

                {desempenhoMedio >
                0
                  ? `${percentualDesempenho}%`
                  : "Sem notas"}

              </span>

            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-700"
                style={{
                  width:
                    `${percentualDesempenho}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* PARTICIPAÇÃO */}

        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">

          <div className="flex items-start justify-between">

            <div>

              <h2 className="font-semibold text-slate-900">
                Participação
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Avaliações respondidas
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              📊
            </div>

          </div>

          <div className="mt-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">

            <div className="h-28 w-28 shrink-0 sm:h-32 sm:w-32">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={
                      participationData
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius={
                      38
                    }
                    outerRadius={
                      55
                    }
                    paddingAngle={
                      3
                    }
                  >

                    {participationData.map(
                      (
                        entry,
                        index,
                      ) => (
                        <Cell
                          key={`cell-${entry.name}-${index}`}
                          fill={
                            pieColors[
                              index
                            ]
                          }
                        />
                      ),
                    )}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                    }}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

            <div>

              <span className="text-3xl font-bold tracking-tight text-slate-900">

                {avaliacoes.length >
                0
                  ? `${participacaoPercentual}%`
                  : "—"}

              </span>

              <p className="mt-2 text-sm leading-5 text-slate-500">

                {avaliacoes.length >
                0
                  ? `${avaliacoesConcluidas.length} de ${avaliacoes.length} avaliações concluídas.`
                  : "Nenhuma avaliação registrada."}

              </p>

            </div>

          </div>

        </div>

        {/* CICLO */}

        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">

          <div className="flex items-start justify-between">

            <div>

              <h2 className="font-semibold text-slate-900">
                Ciclo atual
              </h2>

              <p className="mt-1 text-sm text-slate-500">

                {cicloAtivo
                  ? "Ciclo ativo de avaliação"
                  : "Nenhum ciclo ativo"}

              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg">
              🏆
            </div>

          </div>

          <div className="mt-6">

            <p className="text-lg font-bold text-slate-900">
              {tituloCiclo}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {descricaoCiclo}
            </p>

          </div>

          <div className="mt-6">

            <div className="mb-2 flex justify-between text-xs text-slate-400">

              <span>
                Progresso
              </span>

              <span>
                {progressoCiclo}%
              </span>

            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700"
                style={{
                  width:
                    `${progressoCiclo}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>

      {/* GRÁFICOS */}

      <div className="mt-4 grid min-w-0 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-3">

        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Status das avaliações
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Distribuição do ciclo de avaliação atual.
              </p>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {avaliacoes.length} avaliações
            </span>
          </div>

          <div className="mt-5 grid min-w-0 items-center gap-4 sm:gap-6 md:grid-cols-[240px_1fr]">
            <div className="relative mx-auto h-48 w-full max-w-[210px] sm:h-56 sm:max-w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Concluídas", value: avaliacoesConcluidas.length },
                      { name: "Em andamento", value: avaliacoesEmAndamento.length },
                      { name: "Pendentes", value: avaliacoesPendentes.length },
                    ]}
                    cx="50%"
                    cy="50%"
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#cbd5e1" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900">
                  {avaliacoes.length}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  avaliações
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Concluídas", value: avaliacoesConcluidas.length, color: "bg-emerald-500" },
                { label: "Em andamento", value: avaliacoesEmAndamento.length, color: "bg-blue-500" },
                { label: "Pendentes", value: avaliacoesPendentes.length, color: "bg-slate-300" },
              ].map((item) => {
                const percentual = avaliacoes.length > 0
                  ? Math.round((item.value / avaliacoes.length) * 100)
                  : 0;

                return (
                  <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                        <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{percentual}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percentual}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* DESEMPENHO POR ÁREA */}

        <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">

          <div className="border-b border-slate-100 pb-5">

            <h2 className="font-semibold text-slate-900">
              Desempenho por área
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Média atual por departamento.
            </p>

          </div>

          <div className="mt-5 h-72 min-w-0 sm:mt-6 sm:h-64">

            {departmentPerformance.length >
            0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    departmentPerformance
                  }
                  layout="vertical"
                  margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                >
                  <defs>
                    <linearGradient
                      id="departamentoGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={
                      false
                    }
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    type="number"
                    domain={[
                      0,
                      10,
                    ]}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={
                      72
                    }
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="desempenho"
                    name="Média"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                    fill="url(#departamentoGradient)"
                    maxBarSize={
                      24
                    }
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 px-4 text-center">

                <p className="text-sm text-slate-400">
                  Ainda não existem avaliações com notas suficientes para calcular o desempenho por área.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

      {/* ALERTAS */}

      <div className="mt-4 min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">

        <div className="flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-4 sm:items-center sm:pb-5">

          <div>

            <h2 className="font-semibold text-slate-900">
              Atenção necessária
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pendências que precisam de acompanhamento.
            </p>

          </div>

          <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-red-50 px-2 text-xs font-bold text-red-600">
            {totalPendencias}
          </span>

        </div>

        <div className="mt-4 grid min-w-0 gap-3 sm:mt-5 sm:grid-cols-2 lg:grid-cols-3">

          {alerts.map(
            (
              alert,
            ) => (

              <div
                key={
                  alert.title
                }
                className={`flex min-w-0 gap-3 rounded-xl border p-3.5 sm:p-4 ${alert.className}`}
              >

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold shadow-sm">
                  {alert.icon}
                </div>

                <div>

                  <p
                    className={`text-sm font-semibold ${alert.titleClass}`}
                  >
                    {alert.title}
                  </p>

                  <p
                    className={`mt-1 text-xs leading-5 ${alert.descriptionClass}`}
                  >
                    {
                      alert.description
                    }
                  </p>

                </div>

              </div>

            ),
          )}

        </div>

      </div>

      {/* ATIVIDADES */}

      <div className="mt-4 grid min-w-0 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-3">

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:col-span-2">

          <div className="border-b border-slate-100 pb-5">

            <h2 className="font-semibold text-slate-900">
              Atividades recentes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Últimas movimentações registradas no SynerRH.
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {activities.length >
            0 ? (

              activities.map(
                (
                  activity,
                ) => (

                  <div
                    key={
                      activity.id
                    }
                    className="flex min-w-0 items-start gap-3 py-4 sm:gap-4"
                  >

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${activity.iconClass}`}
                    >
                      {
                        activity.icon
                      }
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold text-slate-800">
                        {
                          activity.title
                        }
                      </p>

                      <p className="mt-1 break-words text-[13px] leading-5 text-slate-500 sm:text-sm">
                        {
                          activity.description
                        }
                      </p>

                      <span className="mt-1.5 block text-[11px] font-medium text-slate-400 sm:hidden">
                        {
                          activity.time
                        }
                      </span>

                    </div>

                    <span className="hidden whitespace-nowrap text-xs text-slate-400 sm:block">
                      {
                        activity.time
                      }
                    </span>

                  </div>

                ),
              )

            ) : (

              <div className="py-8 text-center">

                <p className="text-sm text-slate-400">
                  Nenhuma atividade registrada ainda.
                </p>

              </div>

            )}

          </div>

        </div>

        {/* RESUMO */}

        <div className="min-w-0 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-lg sm:p-6">

          <div className="flex items-center justify-between">

            <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200">
              Ciclo atual
            </span>

            <span className="text-xl">
              🏆
            </span>

          </div>

          <h2 className="mt-6 text-xl font-bold">
            {cicloAtivo?.nome ??
              "Nenhum ciclo ativo"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-300">

            {cicloAtivo
              ? `Período: ${formatarData(
                  cicloAtivo.dataInicio,
                )} até ${formatarData(
                  cicloAtivo.dataFim,
                )}.`
              : "Cadastre um ciclo de avaliação para começar."}

          </p>

          <div className="mt-6">

            <div className="flex items-center justify-between text-sm">

              <span className="text-slate-300">
                Progresso
              </span>

              <span className="font-semibold">
                {progressoCiclo}%
              </span>

            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{
                  width:
                    `${progressoCiclo}%`,
                }}
              />

            </div>

          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-white/5 p-4">

              <p className="text-2xl font-bold">
                {
                  avaliacoesConcluidas.length
                }
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Concluídas
              </p>

            </div>

            <div className="rounded-xl bg-white/5 p-4">

              <p className="text-2xl font-bold">
                {
                  avaliacoesPendentes.length
                }
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Pendentes
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* PEOPLE INSIGHTS */}

      <div className="mt-4 min-w-0 overflow-hidden rounded-[22px] border border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-violet-50 shadow-[0_14px_35px_rgba(79,70,229,0.10)] sm:mt-6 sm:rounded-3xl sm:shadow-[0_18px_45px_rgba(79,70,229,0.10)]">

        <div className="p-4 sm:p-6">

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-sm">
              ✦
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

                <h2 className="font-bold text-slate-900">
                  People Insights
                </h2>

                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  Dados integrados
                </span>

              </div>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Os dados reais de avaliações, feedbacks e PDIs já estão integrados e alimentam automaticamente o módulo de People Insights com alertas, destaques e recomendações para gestores e RH.
              </p>

              <div className="mt-4">
                <Link
                  to="/people-insights"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md sm:min-h-0 sm:w-auto sm:py-2.5"
                >
                  Ver People Insights →
                </Link>
              </div>

            </div>

          </div>

          <div className="mt-5 grid min-w-0 gap-3 border-t border-blue-100 pt-5 sm:mt-6 sm:gap-4 sm:pt-6 md:grid-cols-3">

            <div className="rounded-xl border border-emerald-100 bg-white/80 p-4">

              <p className="text-sm font-semibold text-slate-800">
                📈 Avaliações
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {avaliacoes.length} avaliação(ões) disponível(is) para análise.
              </p>

            </div>

            <div className="rounded-xl border border-amber-100 bg-white/80 p-4">

              <p className="text-sm font-semibold text-slate-800">
                🎯 Desenvolvimento
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {pdis.length} PDI(s) disponível(is) para análise.
              </p>

            </div>

            <div className="rounded-xl border border-violet-100 bg-white/80 p-4">

              <p className="text-sm font-semibold text-slate-800">
                💬 Feedbacks
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {feedbacks.length} feedback(s) disponível(is) para análise.
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}