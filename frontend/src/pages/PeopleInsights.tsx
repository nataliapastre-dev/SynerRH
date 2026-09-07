import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type ColaboradorApi = {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  status: "ATIVO" | "FERIAS" | "AFASTADO" | "INATIVO";
};

type AvaliacaoApi = {
  id: number;
  nota: number | null;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
  colaboradorId: number;
  cicloId: number;
  colaborador?: {
    id: number;
    nome: string;
    cargo: string;
    departamento: string;
  };
};

type PdiApi = {
  id: number;
  titulo: string;
  descricao?: string | null;
  objetivo?: string | null;
  prazo?: string | null;
  progresso: number;
  status:
    | "NAO_INICIADO"
    | "EM_ANDAMENTO"
    | "CONCLUIDO"
    | "ATRASADO";
  responsavel?: string | null;
  colaboradorId: number;
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
  data: string | null;
  colaboradorId: number;
  autorId?: number | null;
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

type InsightNivel =
  | "CRITICO"
  | "ATENCAO"
  | "POSITIVO"
  | "INFORMATIVO";

type Insight = {
  id: string;
  nivel: InsightNivel;
  titulo: string;
  descricao: string;
  recomendacao: string;
  icone: string;
};

type PessoaDestaque = {
  id: number;
  nome: string;
  cargo: string;
  departamento: string;
  media: number;
};

type AreaResumo = {
  departamento: string;
  media: number;
  quantidade: number;
};

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://localhost:3333";

const FETCH_OPTIONS: RequestInit = {
  cache: "no-store",
};

function formatarNota(valor: number) {
  return valor.toFixed(1).replace(".", ",");
}

function obterVisualInsight(nivel: InsightNivel) {
  switch (nivel) {
    case "CRITICO":
      return {
        container: "border-red-200 bg-red-50",
        badge: "bg-red-100 text-red-700",
        icon: "bg-red-100 text-red-700",
        titulo: "text-red-900",
        texto: "text-red-700",
      };

    case "ATENCAO":
      return {
        container: "border-amber-200 bg-amber-50",
        badge: "bg-amber-100 text-amber-700",
        icon: "bg-amber-100 text-amber-700",
        titulo: "text-amber-900",
        texto: "text-amber-700",
      };

    case "POSITIVO":
      return {
        container: "border-emerald-200 bg-emerald-50",
        badge: "bg-emerald-100 text-emerald-700",
        icon: "bg-emerald-100 text-emerald-700",
        titulo: "text-emerald-900",
        texto: "text-emerald-700",
      };

    default:
      return {
        container: "border-blue-200 bg-blue-50",
        badge: "bg-blue-100 text-blue-700",
        icon: "bg-blue-100 text-blue-700",
        titulo: "text-blue-900",
        texto: "text-blue-700",
      };
  }
}

function nomeNivel(nivel: InsightNivel) {
  switch (nivel) {
    case "CRITICO":
      return "Crítico";
    case "ATENCAO":
      return "Atenção";
    case "POSITIVO":
      return "Positivo";
    default:
      return "Informativo";
  }
}

export default function PeopleInsights() {
  const [colaboradores, setColaboradores] = useState<
    ColaboradorApi[]
  >([]);

  const [avaliacoes, setAvaliacoes] = useState<
    AvaliacaoApi[]
  >([]);

  const [pdis, setPdis] = useState<PdiApi[]>([]);

  const [feedbacks, setFeedbacks] = useState<
    FeedbackApi[]
  >([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [filtroNivel, setFiltroNivel] = useState<
    "TODOS" | InsightNivel
  >("TODOS");

  const carregarDados = useCallback(async () => {
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
          "Não foi possível carregar os dados para análise.",
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

      setColaboradores(
        Array.isArray(colaboradoresData)
          ? colaboradoresData
          : [],
      );

      setAvaliacoes(
        Array.isArray(avaliacoesData) ? avaliacoesData : [],
      );

      setPdis(Array.isArray(pdisData) ? pdisData : []);

      setFeedbacks(
        Array.isArray(feedbacksData) ? feedbacksData : [],
      );
    } catch (error) {
      console.error("Erro no People Insights:", error);

      setErro(
        "Não foi possível carregar os dados do People Insights.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const colaboradorPorId = useCallback(
    (id: number) =>
      colaboradores.find(
        (colaborador) => colaborador.id === id,
      ),
    [colaboradores],
  );

  const avaliacoesConcluidas = useMemo(
    () =>
      avaliacoes.filter(
        (avaliacao) => avaliacao.status === "CONCLUIDA",
      ),
    [avaliacoes],
  );

  const avaliacoesPendentes = useMemo(
    () =>
      avaliacoes.filter(
        (avaliacao) => avaliacao.status === "PENDENTE",
      ),
    [avaliacoes],
  );

  const avaliacoesEmAndamento = useMemo(
    () =>
      avaliacoes.filter(
        (avaliacao) => avaliacao.status === "EM_ANDAMENTO",
      ),
    [avaliacoes],
  );

  const pdisAtrasados = useMemo(
    () => pdis.filter((pdi) => pdi.status === "ATRASADO"),
    [pdis],
  );

  const pdisConcluidos = useMemo(
    () => pdis.filter((pdi) => pdi.status === "CONCLUIDO"),
    [pdis],
  );

  const feedbacksDesenvolvimento = useMemo(
    () =>
      feedbacks.filter(
        (feedback) => feedback.tipo === "DESENVOLVIMENTO",
      ),
    [feedbacks],
  );

  const feedbacksPositivos = useMemo(
    () =>
      feedbacks.filter(
        (feedback) =>
          feedback.tipo === "POSITIVO" ||
          feedback.tipo === "RECONHECIMENTO",
      ),
    [feedbacks],
  );

  const desempenhoMedio = useMemo(() => {
    const avaliacoesComNota = avaliacoes.filter(
      (avaliacao) => typeof avaliacao.nota === "number",
    );

    if (avaliacoesComNota.length === 0) {
      return 0;
    }

    return (
      avaliacoesComNota.reduce(
        (total, avaliacao) =>
          total + Number(avaliacao.nota),
        0,
      ) / avaliacoesComNota.length
    );
  }, [avaliacoes]);

  const pessoasDestaque = useMemo<PessoaDestaque[]>(() => {
    const notasPorPessoa = new Map<number, number[]>();

    avaliacoes.forEach((avaliacao) => {
      if (typeof avaliacao.nota !== "number") {
        return;
      }

      const notas =
        notasPorPessoa.get(avaliacao.colaboradorId) ?? [];

      notas.push(avaliacao.nota);

      notasPorPessoa.set(avaliacao.colaboradorId, notas);
    });

    return Array.from(notasPorPessoa.entries())
      .map(([colaboradorId, notas]) => {
        const colaborador = colaboradores.find(
          (item) => item.id === colaboradorId,
        );

        if (!colaborador) {
          return null;
        }

        const media =
          notas.reduce((total, nota) => total + nota, 0) /
          notas.length;

        return {
          id: colaborador.id,
          nome: colaborador.nome,
          cargo: colaborador.cargo,
          departamento: colaborador.departamento,
          media,
        };
      })
      .filter(
        (item): item is PessoaDestaque => item !== null,
      )
      .sort((a, b) => b.media - a.media)
      .slice(0, 5);
  }, [avaliacoes, colaboradores]);

  const desempenhoPorArea = useMemo<AreaResumo[]>(() => {
    const areas = new Map<string, number[]>();

    avaliacoes.forEach((avaliacao) => {
      if (typeof avaliacao.nota !== "number") {
        return;
      }

      const colaborador =
        avaliacao.colaborador ??
        colaboradores.find(
          (item) => item.id === avaliacao.colaboradorId,
        );

      if (!colaborador) {
        return;
      }

      const notas =
        areas.get(colaborador.departamento) ?? [];

      notas.push(avaliacao.nota);

      areas.set(colaborador.departamento, notas);
    });

    return Array.from(areas.entries())
      .map(([departamento, notas]) => ({
        departamento,
        media:
          notas.reduce((total, nota) => total + nota, 0) /
          notas.length,
        quantidade: notas.length,
      }))
      .sort((a, b) => b.media - a.media);
  }, [avaliacoes, colaboradores]);

  const insights = useMemo<Insight[]>(() => {
    const resultado: Insight[] = [];

    if (pdisAtrasados.length > 0) {
      const nomes = pdisAtrasados
        .slice(0, 3)
        .map(
          (pdi) =>
            pdi.colaborador?.nome ??
            colaboradorPorId(pdi.colaboradorId)?.nome ??
            "Colaborador",
        )
        .join(", ");

      resultado.push({
        id: "pdis-atrasados",
        nivel: "CRITICO",
        titulo: `${pdisAtrasados.length} PDIs estão atrasados`,
        descricao: `Os planos atrasados exigem acompanhamento prioritário. Entre os colaboradores impactados estão ${nomes}.`,
        recomendacao:
          "Revisar prazos, remover bloqueios e combinar uma nova data de acompanhamento com os responsáveis.",
        icone: "🎯",
      });
    }

    if (avaliacoesPendentes.length > 0) {
      resultado.push({
        id: "avaliacoes-pendentes",
        nivel: "ATENCAO",
        titulo: `${avaliacoesPendentes.length} avaliações ainda não foram iniciadas`,
        descricao:
          "Parte do ciclo ainda aguarda início, o que pode reduzir a participação final caso não haja acompanhamento.",
        recomendacao:
          "Priorizar a comunicação com colaboradores e gestores que ainda possuem avaliações pendentes.",
        icone: "📋",
      });
    }

    if (avaliacoesEmAndamento.length > 0) {
      resultado.push({
        id: "avaliacoes-andamento",
        nivel: "INFORMATIVO",
        titulo: `${avaliacoesEmAndamento.length} avaliações estão em andamento`,
        descricao:
          "Existem avaliações já iniciadas que ainda precisam ser concluídas dentro do ciclo.",
        recomendacao:
          "Acompanhar a evolução e reforçar o prazo de conclusão do ciclo.",
        icone: "↗",
      });
    }

    if (feedbacksDesenvolvimento.length > 0) {
      const pessoas = Array.from(
        new Set(
          feedbacksDesenvolvimento.map(
            (feedback) =>
              feedback.colaborador?.nome ??
              colaboradorPorId(feedback.colaboradorId)?.nome ??
              "Colaborador",
          ),
        ),
      );

      resultado.push({
        id: "feedback-desenvolvimento",
        nivel: "ATENCAO",
        titulo: `${feedbacksDesenvolvimento.length} feedbacks de desenvolvimento registrados`,
        descricao: `Os feedbacks de desenvolvimento estão concentrados em ${pessoas.length} colaborador(es), indicando oportunidades claras de evolução.`,
        recomendacao:
          "Transformar os pontos recorrentes em ações de PDI e acompanhar a evolução nos próximos feedbacks.",
        icone: "💬",
      });
    }

    if (feedbacksPositivos.length > 0) {
      resultado.push({
        id: "feedbacks-positivos",
        nivel: "POSITIVO",
        titulo: `${feedbacksPositivos.length} feedbacks positivos ou reconhecimentos`,
        descricao:
          "Há sinais de reconhecimento e reforço positivo registrados no período.",
        recomendacao:
          "Manter a frequência de reconhecimento e aproveitar os destaques como referência de boas práticas.",
        icone: "✨",
      });
    }

    if (
      pessoasDestaque.length > 0 &&
      pessoasDestaque[0].media >= 9
    ) {
      const destaque = pessoasDestaque[0];

      resultado.push({
        id: "destaque-desempenho",
        nivel: "POSITIVO",
        titulo: `${destaque.nome} aparece como destaque de desempenho`,
        descricao: `A média atual é ${formatarNota(
          destaque.media,
        )}, uma das maiores entre as avaliações registradas.`,
        recomendacao:
          "Reconhecer o resultado e avaliar oportunidades de novos desafios, protagonismo ou compartilhamento de conhecimento.",
        icone: "🏆",
      });
    }

    const areaMenorMedia =
      desempenhoPorArea.length > 0
        ? desempenhoPorArea[desempenhoPorArea.length - 1]
        : null;

    if (
      areaMenorMedia &&
      areaMenorMedia.media < desempenhoMedio
    ) {
      resultado.push({
        id: "area-atencao",
        nivel: "ATENCAO",
        titulo: `${areaMenorMedia.departamento} está abaixo da média geral`,
        descricao: `A área apresenta média ${formatarNota(
          areaMenorMedia.media,
        )}, enquanto a média geral atual é ${formatarNota(
          desempenhoMedio,
        )}.`,
        recomendacao:
          "Analisar o contexto, feedbacks e PDIs da área antes de definir qualquer ação de desenvolvimento.",
        icone: "📊",
      });
    }

    if (pdisConcluidos.length > 0) {
      resultado.push({
        id: "pdis-concluidos",
        nivel: "POSITIVO",
        titulo: `${pdisConcluidos.length} PDIs já foram concluídos`,
        descricao:
          "Há planos de desenvolvimento finalizados, demonstrando avanço concreto nas ações propostas.",
        recomendacao:
          "Registrar aprendizados e definir próximos desafios para manter a evolução contínua.",
        icone: "✅",
      });
    }

    return resultado;
  }, [
    pdisAtrasados,
    pdisConcluidos,
    avaliacoesPendentes,
    avaliacoesEmAndamento,
    feedbacksDesenvolvimento,
    feedbacksPositivos,
    pessoasDestaque,
    desempenhoPorArea,
    desempenhoMedio,
    colaboradorPorId,
  ]);

  const insightsFiltrados = useMemo(
    () =>
      filtroNivel === "TODOS"
        ? insights
        : insights.filter(
            (insight) => insight.nivel === filtroNivel,
          ),
    [insights, filtroNivel],
  );

  const totalCriticos = insights.filter(
    (insight) => insight.nivel === "CRITICO",
  ).length;

  const totalAtencao = insights.filter(
    (insight) => insight.nivel === "ATENCAO",
  ).length;

  const totalPositivos = insights.filter(
    (insight) => insight.nivel === "POSITIVO",
  ).length;

  const participacao =
    avaliacoes.length > 0
      ? Math.round(
          (avaliacoesConcluidas.length / avaliacoes.length) *
            100,
        )
      : 0;

  return (
    <section className="min-h-screen min-w-0 overflow-x-hidden bg-slate-50/50 pb-4">
      {/* CABEÇALHO */}
      <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Inteligência de pessoas
            </span>

            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              Dados reais
            </span>

            {carregando && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                Analisando...
              </span>
            )}
          </div>

          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
            People Insights
          </h1>

          <p className="mt-2 max-w-3xl text-[13px] leading-5 text-slate-500 sm:text-sm sm:leading-6">
            Transforme dados de avaliações, PDIs e feedbacks em
            sinais de atenção, destaques e recomendações para
            apoiar decisões de RH e liderança.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarDados}
          disabled={carregando}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          ↻ Atualizar análises
        </button>
      </div>

      {/* ERRO */}
      {erro && (
        <div className="mb-5 min-w-0 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 sm:mb-6 sm:px-4">
          <p className="text-sm font-medium text-red-800">
            {erro}
          </p>

          <p className="mt-1 text-xs text-red-600">
            Confirme se o backend está rodando em {API_URL}.
          </p>
        </div>
      )}

      {/* MÉTRICAS */}
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">
          <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
            Dados analisados
          </p>

          <div className="mt-2 flex min-w-0 items-center justify-between gap-2 sm:mt-3">
            <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {carregando
                ? "..."
                : avaliacoes.length +
                  pdis.length +
                  feedbacks.length}
            </p>

            <span className="shrink-0 text-lg sm:text-2xl">✦</span>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-slate-500 sm:mt-3 sm:text-xs">
            {avaliacoes.length} avaliações · {pdis.length} PDIs ·{" "}
            {feedbacks.length} feedbacks
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-red-200 bg-white p-3.5 shadow-sm sm:p-5">
          <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
            Pontos críticos
          </p>

          <div className="mt-2 flex min-w-0 items-center justify-between gap-2 sm:mt-3">
            <p className="text-2xl font-bold text-red-600 sm:text-3xl">
              {carregando ? "..." : totalCriticos}
            </p>

            <span className="shrink-0 text-lg sm:text-2xl">⚠️</span>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-red-600 sm:mt-3 sm:text-xs">
            Exigem prioridade de acompanhamento
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-amber-200 bg-white p-3.5 shadow-sm sm:p-5">
          <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
            Pontos de atenção
          </p>

          <div className="mt-2 flex min-w-0 items-center justify-between gap-2 sm:mt-3">
            <p className="text-2xl font-bold text-amber-600 sm:text-3xl">
              {carregando ? "..." : totalAtencao}
            </p>

            <span className="shrink-0 text-lg sm:text-2xl">👀</span>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-amber-600 sm:mt-3 sm:text-xs">
            Merecem acompanhamento do gestor
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-emerald-200 bg-white p-3.5 shadow-sm sm:p-5">
          <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
            Sinais positivos
          </p>

          <div className="mt-2 flex min-w-0 items-center justify-between gap-2 sm:mt-3">
            <p className="text-2xl font-bold text-emerald-600 sm:text-3xl">
              {carregando ? "..." : totalPositivos}
            </p>

            <span className="shrink-0 text-lg sm:text-2xl">🚀</span>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-emerald-600 sm:mt-3 sm:text-xs">
            Destaques e avanços identificados
          </p>
        </div>
      </div>

      {/* RESUMO */}
      <div className="mt-4 grid min-w-0 grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-4">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
          <p className="text-[10px] font-semibold uppercase leading-4 tracking-wide text-slate-400 sm:text-xs sm:font-medium">
            Média geral
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            {desempenhoMedio > 0
              ? formatarNota(desempenhoMedio)
              : "—"}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
          <p className="text-[10px] font-semibold uppercase leading-4 tracking-wide text-slate-400 sm:text-xs sm:font-medium">
            Participação
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            {participacao}%
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
          <p className="text-[10px] font-semibold uppercase leading-4 tracking-wide text-slate-400 sm:text-xs sm:font-medium">
            PDIs atrasados
          </p>
          <p className="mt-2 text-xl font-bold text-red-600 sm:text-2xl">
            {pdisAtrasados.length}
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
          <p className="text-[10px] font-semibold uppercase leading-4 tracking-wide text-slate-400 sm:text-xs sm:font-medium">
            Feedbacks positivos
          </p>
          <p className="mt-2 text-xl font-bold text-emerald-600 sm:text-2xl">
            {feedbacksPositivos.length}
          </p>
        </div>
      </div>

      {/* INSIGHTS + DESTAQUES */}
      <div className="mt-5 grid min-w-0 gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex min-w-0 flex-col gap-3 border-b border-slate-100 pb-4 sm:gap-4 sm:pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Insights gerados
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recomendações calculadas automaticamente a partir
                dos dados atuais.
              </p>
            </div>

            <select
              value={filtroNivel}
              onChange={(event) =>
                setFiltroNivel(
                  event.target.value as
                    | "TODOS"
                    | InsightNivel,
                )
              }
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-auto sm:text-sm"
            >
              <option value="TODOS">
                Todos os insights
              </option>
              <option value="CRITICO">Críticos</option>
              <option value="ATENCAO">Atenção</option>
              <option value="POSITIVO">Positivos</option>
              <option value="INFORMATIVO">
                Informativos
              </option>
            </select>
          </div>

          <div className="mt-4 min-w-0 space-y-3 sm:mt-5 sm:space-y-4">
            {carregando ? (
              <div className="rounded-xl bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">
                  Analisando dados...
                </p>
              </div>
            ) : insightsFiltrados.length > 0 ? (
              insightsFiltrados.map((insight) => {
                const visual = obterVisualInsight(
                  insight.nivel,
                );

                return (
                  <article
                    key={insight.id}
                    className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${visual.container}`}
                  >
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base sm:h-11 sm:w-11 sm:text-lg ${visual.icon}`}
                      >
                        {insight.icone}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                          <h3
                            className={`break-words font-semibold leading-5 ${visual.titulo}`}
                          >
                            {insight.titulo}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${visual.badge}`}
                          >
                            {nomeNivel(insight.nivel)}
                          </span>
                        </div>

                        <p
                          className={`mt-2 break-words text-sm leading-6 ${visual.texto}`}
                        >
                          {insight.descricao}
                        </p>

                        <div className="mt-3 min-w-0 rounded-xl border border-white/70 bg-white/70 p-3.5 sm:mt-4 sm:p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Recomendação
                          </p>

                          <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                            {insight.recomendacao}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-xl bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">
                  Nenhum insight encontrado para esse filtro.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* DESTAQUES */}
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="font-semibold text-slate-900">
              🏆 Destaques
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Maiores médias entre as avaliações registradas.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {pessoasDestaque.length > 0 ? (
              pessoasDestaque.map((pessoa, index) => (
                <div
                  key={pessoa.id}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5 sm:p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {pessoa.nome}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {pessoa.cargo}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {pessoa.departamento}
                    </p>
                  </div>

                  <span className="rounded-lg bg-emerald-100 px-2.5 py-1.5 text-sm font-bold text-emerald-700">
                    {formatarNota(pessoa.media)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">
                Ainda não existem avaliações com nota.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* DESEMPENHO POR ÁREA */}
      <div className="mt-5 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="font-semibold text-slate-900">
            📊 Leitura por departamento
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Comparação das médias atuais entre as áreas.
          </p>
        </div>

        <div className="mt-4 grid min-w-0 gap-3 sm:mt-5 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {desempenhoPorArea.map((area) => (
            <div
              key={area.departamento}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex min-w-0 items-start justify-between gap-3 sm:items-center">
                <div>
                  <p className="break-words font-semibold leading-5 text-slate-800">
                    {area.departamento}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {area.quantidade} avaliação(ões) com nota
                  </p>
                </div>

                <span className="text-xl font-bold text-blue-600">
                  {formatarNota(area.media)}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{
                    width: `${Math.min(
                      100,
                      area.media * 10,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NOTA SOBRE A ANÁLISE */}
      <div className="mt-5 min-w-0 rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-blue-50 p-4 shadow-sm sm:mt-6 sm:p-6">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-lg text-white sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
            🤖
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              People Insights — análise inteligente
            </h2>

            <p className="mt-2 max-w-4xl break-words text-sm leading-6 text-slate-600">
              Esta versão analisa automaticamente os dados reais do
              SynerRH e transforma indicadores de avaliações, PDIs e
              feedbacks em alertas e recomendações. Os insights servem
              como apoio à decisão e não substituem a análise humana
              de RH e gestores.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}