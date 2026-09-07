
import { useEffect, useMemo, useState } from "react";

type StatusAvaliacao =
  | "Concluída"
  | "Em andamento"
  | "Agendada";

type TipoAvaliacao =
  | "Avaliação de Desempenho"
  | "Avaliação 360º"
  | "Autoavaliação";

type StatusAvaliacaoApi =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "CONCLUIDA";

type AvaliacaoApi = {
  id: number;
  nota: number | null;
  status: StatusAvaliacaoApi;
  comentario: string | null;
  dataConclusao: string | null;
  colaboradorId: number;
  cicloId: number;
  createdAt: string;
  updatedAt: string;
  colaborador: {
    id: number;
    nome: string;
    email: string;
    cargo: string;
    departamento: string;
    status: string;
    dataAdmissao: string;
    avatar: string | null;
  };
  ciclo: {
    id: number;
    nome: string;
    descricao: string | null;
    dataInicio: string;
    dataFim: string;
    ativo: boolean;
  };
};

type ColaboradorApi = {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
};

type CicloApi = {
  id: number;
  nome: string;
  descricao: string | null;
  dataInicio: string;
  dataFim: string;
  ativo: boolean;
};

type Avaliacao = {
  id: number;
  colaboradorId: number;
  cicloId: number;
  colaborador: string;
  cargo: string;
  tipo: TipoAvaliacao;
  data: string;
  nota: number | null;
  status: StatusAvaliacao;
  avaliador: string;
  pontosFortes: string[];
  desenvolvimento: string[];
};

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://localhost:3333";

const FETCH_OPTIONS: RequestInit = {
  cache: "no-store",
};

function converterStatus(
  status: StatusAvaliacaoApi,
): StatusAvaliacao {
  if (status === "CONCLUIDA") {
    return "Concluída";
  }

  if (status === "EM_ANDAMENTO") {
    return "Em andamento";
  }

  return "Agendada";
}

function converterStatusParaApi(
  status: StatusAvaliacao,
): StatusAvaliacaoApi {
  if (status === "Concluída") {
    return "CONCLUIDA";
  }

  if (status === "Em andamento") {
    return "EM_ANDAMENTO";
  }

  return "PENDENTE";
}

function formatarData(data: string) {
  if (!data) {
    return "-";
  }

  const dataSomente = data.slice(0, 10);
  const [ano, mes, dia] = dataSomente
    .split("-")
    .map(Number);

  if (!ano || !mes || !dia) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(ano, mes - 1, dia),
  );
}

function transformarAvaliacao(
  avaliacao: AvaliacaoApi,
): Avaliacao {
  return {
    id: avaliacao.id,
    colaboradorId: avaliacao.colaboradorId,
    cicloId: avaliacao.cicloId,
    colaborador: avaliacao.colaborador.nome,
    cargo: avaliacao.colaborador.cargo,
    tipo: "Avaliação de Desempenho",
    data: formatarData(avaliacao.ciclo.dataInicio),
    nota: avaliacao.nota,
    status: converterStatus(avaliacao.status),
    avaliador: "Gestor",
    pontosFortes: [],
    desenvolvimento: [],
  };
}

export default function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(
    [],
  );

  const [colaboradores, setColaboradores] = useState<
    ColaboradorApi[]
  >([]);

  const [ciclos, setCiclos] = useState<CicloApi[]>([]);

  const [filtroStatus, setFiltroStatus] = useState<
    "Todas" | StatusAvaliacao
  >("Todas");

  const [filtroTipo, setFiltroTipo] = useState<
    "Todos" | TipoAvaliacao
  >("Todos");

  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);

  const [modalEdicaoAberto, setModalEdicaoAberto] =
    useState(false);

  const [avaliacaoSelecionada, setAvaliacaoSelecionada] =
    useState<Avaliacao | null>(null);

  const [avaliacaoEditando, setAvaliacaoEditando] =
    useState<Avaliacao | null>(null);

  const [novaAvaliacao, setNovaAvaliacao] = useState({
    colaboradorId: "",
    tipo: "Avaliação de Desempenho" as TipoAvaliacao,
  });

  const [carregando, setCarregando] = useState(true);

  const [salvando, setSalvando] = useState(false);

  const cicloAtivo = useMemo(() => {
    return ciclos.find((ciclo) => ciclo.ativo) ?? null;
  }, [ciclos]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setCarregando(true);

      const [
        avaliacoesResponse,
        colaboradoresResponse,
        ciclosResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/avaliacoes`, FETCH_OPTIONS),
        fetch(`${API_URL}/colaboradores`, FETCH_OPTIONS),
        fetch(`${API_URL}/ciclos`, FETCH_OPTIONS),
      ]);

      if (!avaliacoesResponse.ok) {
        throw new Error("Erro ao buscar avaliações.");
      }

      if (!colaboradoresResponse.ok) {
        throw new Error("Erro ao buscar colaboradores.");
      }

      if (!ciclosResponse.ok) {
        throw new Error("Erro ao buscar ciclos.");
      }

      const avaliacoesApi: AvaliacaoApi[] =
        await avaliacoesResponse.json();

      const colaboradoresApi: ColaboradorApi[] =
        await colaboradoresResponse.json();

      const ciclosApi: CicloApi[] =
        await ciclosResponse.json();

      setAvaliacoes(
        avaliacoesApi.map(transformarAvaliacao),
      );

      setColaboradores(colaboradoresApi);
      setCiclos(ciclosApi);
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível carregar os dados da API.",
      );
    } finally {
      setCarregando(false);
    }
  }

  const avaliacoesFiltradas = useMemo(() => {
    return avaliacoes.filter((avaliacao) => {
      const correspondeStatus =
        filtroStatus === "Todas" ||
        avaliacao.status === filtroStatus;

      const correspondeTipo =
        filtroTipo === "Todos" ||
        avaliacao.tipo === filtroTipo;

      const termo = busca.toLowerCase().trim();

      const correspondeBusca =
        !termo ||
        avaliacao.colaborador
          .toLowerCase()
          .includes(termo) ||
        avaliacao.cargo
          .toLowerCase()
          .includes(termo);

      return (
        correspondeStatus &&
        correspondeTipo &&
        correspondeBusca
      );
    });
  }, [
    avaliacoes,
    filtroStatus,
    filtroTipo,
    busca,
  ]);

  const totalAvaliacoes = avaliacoes.length;

  const concluidas = avaliacoes.filter(
    (item) => item.status === "Concluída",
  ).length;

  const emAndamento = avaliacoes.filter(
    (item) => item.status === "Em andamento",
  ).length;

  const agendadas = avaliacoes.filter(
    (item) => item.status === "Agendada",
  ).length;

  const notas = avaliacoes
    .filter(
      (
        item,
      ): item is Avaliacao & { nota: number } =>
        item.nota !== null,
    )
    .map((item) => item.nota);

  const mediaGeral =
    notas.length > 0
      ? notas.reduce(
          (total, nota) => total + nota,
          0,
        ) / notas.length
      : 0;

  function abrirDetalhes(avaliacao: Avaliacao) {
    setAvaliacaoSelecionada(avaliacao);
  }

  function abrirNovaAvaliacao() {
    setNovaAvaliacao({
      colaboradorId: "",
      tipo: "Avaliação de Desempenho",
    });

    setModalAberto(true);
  }

  async function cadastrarAvaliacao() {
    if (!novaAvaliacao.colaboradorId) {
      alert("Selecione um colaborador.");
      return;
    }

    if (!cicloAtivo) {
      alert(
        "Não existe um ciclo de avaliação ativo.",
      );
      return;
    }

    try {
      setSalvando(true);

      const response = await fetch(
        `${API_URL}/avaliacoes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            colaboradorId: Number(
              novaAvaliacao.colaboradorId,
            ),
            cicloId: cicloAtivo.id,
            status: "PENDENTE",
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Erro ao cadastrar avaliação.",
        );
      }

      const avaliacaoApi: AvaliacaoApi =
        await response.json();

      const nova =
        transformarAvaliacao(avaliacaoApi);

      setAvaliacoes((atual) => [
        nova,
        ...atual,
      ]);

      setModalAberto(false);

      alert(
        "Avaliação cadastrada com sucesso!",
      );
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível cadastrar a avaliação.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirAvaliacao(id: number) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta avaliação?",
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/avaliacoes/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Erro ao excluir avaliação.",
        );
      }

      setAvaliacoes((atual) =>
        atual.filter((item) => item.id !== id),
      );

      if (avaliacaoSelecionada?.id === id) {
        setAvaliacaoSelecionada(null);
      }

      if (avaliacaoEditando?.id === id) {
        setAvaliacaoEditando(null);
        setModalEdicaoAberto(false);
      }

      alert(
        "Avaliação excluída com sucesso!",
      );
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível excluir a avaliação.",
      );
    }
  }

  async function iniciarAvaliacao(id: number) {
    try {
      const response = await fetch(
        `${API_URL}/avaliacoes/${id}/iniciar`,
        {
          method: "PATCH",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Erro ao iniciar avaliação.",
        );
      }

      const avaliacaoApi: AvaliacaoApi =
        await response.json();

      const atualizada =
        transformarAvaliacao(avaliacaoApi);

      setAvaliacoes((atual) =>
        atual.map((item) =>
          item.id === id
            ? atualizada
            : item,
        ),
      );

      if (avaliacaoSelecionada?.id === id) {
        setAvaliacaoSelecionada(
          atualizada,
        );
      }
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível iniciar a avaliação.",
      );
    }
  }

  function abrirEdicao(
    avaliacao: Avaliacao,
  ) {
    setAvaliacaoEditando({
      ...avaliacao,
    });

    setModalEdicaoAberto(true);
  }

  async function salvarEdicao() {
    if (!avaliacaoEditando) {
      return;
    }

    try {
      setSalvando(true);

      const response = await fetch(
        `${API_URL}/avaliacoes/${avaliacaoEditando.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nota: avaliacaoEditando.nota,
            status:
              converterStatusParaApi(
                avaliacaoEditando.status,
              ),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Erro ao atualizar avaliação.",
        );
      }

      const avaliacaoApi: AvaliacaoApi =
        await response.json();

      const atualizada =
        transformarAvaliacao(avaliacaoApi);

      setAvaliacoes((atual) =>
        atual.map((item) =>
          item.id === atualizada.id
            ? atualizada
            : item,
        ),
      );

      if (
        avaliacaoSelecionada?.id ===
        atualizada.id
      ) {
        setAvaliacaoSelecionada(
          atualizada,
        );
      }

      setModalEdicaoAberto(false);
      setAvaliacaoEditando(null);

      alert(
        "Avaliação atualizada com sucesso!",
      );
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível atualizar a avaliação.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function criarPDI(
    avaliacao: Avaliacao,
  ) {
    alert(
      `PDI iniciado para ${avaliacao.colaborador} com base nos pontos de desenvolvimento da avaliação.`,
    );
  }

  function classeStatus(
    status: StatusAvaliacao,
  ) {
    if (status === "Concluída") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }

    if (status === "Em andamento") {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }

    return "bg-indigo-50 text-indigo-700 border-indigo-100";
  }

  function classeNota(
    nota: number | null,
  ) {
    if (nota === null) {
      return "text-slate-400";
    }

    if (nota >= 8) {
      return "text-emerald-600";
    }

    if (nota >= 6) {
      return "text-amber-600";
    }

    return "text-red-600";
  }

  return (
    <section className="min-w-0 space-y-5 overflow-x-hidden pb-4 sm:space-y-6 sm:pb-0">
      {/* Cabeçalho */}
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600">
              Performance
            </span>

            <span className="text-xs text-slate-400">
              Gestão de pessoas
            </span>
          </div>

          <h2 className="text-[28px] font-bold leading-tight text-slate-800 sm:text-3xl">
            Avaliações
          </h2>

          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-slate-500 sm:text-sm sm:leading-6">
            Acompanhe o ciclo de avaliações,
            desempenho e oportunidades de
            desenvolvimento dos colaboradores.
          </p>
        </div>

        <button
          onClick={abrirNovaAvaliacao}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md sm:w-auto"
        >
          <span className="text-lg">+</span>
          Nova avaliação
        </button>
      </div>

      {/* Ciclo ativo */}
      {cicloAtivo && (
        <div className="min-w-0 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 sm:p-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                Ciclo ativo
              </p>

              <h3 className="mt-1 font-bold text-indigo-900">
                {cicloAtivo.nome}
              </h3>

              {cicloAtivo.descricao && (
                <p className="mt-1 text-sm text-indigo-700">
                  {cicloAtivo.descricao}
                </p>
              )}
            </div>

            <div className="w-full rounded-xl bg-white px-3.5 py-3 text-xs leading-5 text-indigo-700 shadow-sm sm:w-auto sm:px-4 sm:text-sm">
              <span className="font-semibold">
                Período:
              </span>{" "}
              {formatarData(
                cicloAtivo.dataInicio,
              )}{" "}
              até{" "}
              {formatarData(
                cicloAtivo.dataFim,
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indicadores */}
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <MetricCard
          titulo="Total"
          valor={String(totalAvaliacoes)}
          descricao="Avaliações cadastradas"
          icone="📝"
        />

        <MetricCard
          titulo="Concluídas"
          valor={String(concluidas)}
          descricao="Ciclos finalizados"
          icone="✓"
        />

        <MetricCard
          titulo="Em andamento"
          valor={String(emAndamento)}
          descricao="Avaliações em progresso"
          icone="◷"
        />

        <MetricCard
          titulo="Agendadas"
          valor={String(agendadas)}
          descricao="Próximas avaliações"
          icone="📅"
        />

        <MetricCard
          titulo="Média geral"
          valor={
            mediaGeral > 0
              ? mediaGeral.toFixed(1)
              : "-"
          }
          descricao="Entre concluídas"
          icone="★"
        />
      </div>

      {/* Filtros */}
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-1">
          <h3 className="font-bold text-slate-800">
            Filtros
          </h3>

          <p className="text-xs text-slate-400">
            Encontre rapidamente uma avaliação
            específica.
          </p>
        </div>

        <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Buscar colaborador
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
                placeholder="Nome ou cargo..."
                className="min-h-11 w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-base outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
              />
            </div>
          </div>

          <SelectInput
            label="Status"
            value={filtroStatus}
            onChange={(value) =>
              setFiltroStatus(
                value as
                  | "Todas"
                  | StatusAvaliacao,
              )
            }
            options={[
              "Todas",
              "Concluída",
              "Em andamento",
              "Agendada",
            ]}
          />

          <SelectInput
            label="Tipo"
            value={filtroTipo}
            onChange={(value) =>
              setFiltroTipo(
                value as
                  | "Todos"
                  | TipoAvaliacao,
              )
            }
            options={[
              "Todos",
              "Avaliação de Desempenho",
              "Avaliação 360º",
              "Autoavaliação",
            ]}
          />
        </div>
      </div>

      {/* Lista */}
      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-w-0 flex-col gap-2 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <h3 className="font-bold text-slate-800">
              Avaliações cadastradas
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {carregando
                ? "Carregando avaliações..."
                : `${avaliacoesFiltradas.length} avaliação(ões) encontrada(s).`}
            </p>
          </div>

          {(busca ||
            filtroStatus !== "Todas" ||
            filtroTipo !== "Todos") && (
            <button
              onClick={() => {
                setBusca("");
                setFiltroStatus("Todas");
                setFiltroTipo("Todos");
              }}
              className="self-start text-xs font-semibold text-indigo-600 hover:text-indigo-700 sm:text-sm"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {carregando ? (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
              ⏳
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Carregando avaliações
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Buscando os dados no banco de
              dados.
            </p>
          </div>
        ) : avaliacoesFiltradas.length === 0 ? (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🔎
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              Nenhuma avaliação encontrada
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Tente alterar os filtros ou
              cadastre uma nova avaliação.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {avaliacoesFiltradas.map(
              (avaliacao) => (
                <div
                  key={avaliacao.id}
                  className="p-4 transition hover:bg-slate-50/70 sm:p-6"
                >
                  <div className="flex min-w-0 flex-col gap-4 sm:gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 sm:h-12 sm:w-12 sm:text-base">
                        {avaliacao.colaborador
                          .split(" ")
                          .slice(0, 2)
                          .map(
                            (nome) => nome[0],
                          )
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                          <h4 className="break-words font-bold leading-5 text-slate-800">
                            {avaliacao.colaborador}
                          </h4>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${classeStatus(
                              avaliacao.status,
                            )}`}
                          >
                            {avaliacao.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {avaliacao.cargo}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] leading-4 text-slate-400 sm:gap-x-3 sm:text-xs">
                          <span>
                            {avaliacao.tipo}
                          </span>

                          <span>•</span>

                          <span>
                            {avaliacao.data}
                          </span>

                          <span>•</span>

                          <span>
                            Ciclo:{" "}
                            {cicloAtivo?.nome ??
                              "Não informado"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-left sm:block sm:px-5 sm:text-center">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Nota
                        </p>

                        <p
                          className={`mt-1 text-2xl font-bold ${classeNota(
                            avaliacao.nota,
                          )}`}
                        >
                          {avaliacao.nota !==
                          null
                            ? avaliacao.nota.toFixed(
                                1,
                              )
                            : "-"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        <button
                          onClick={() =>
                            abrirDetalhes(
                              avaliacao,
                            )
                          }
                          className="min-h-11 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:px-4 sm:text-sm"
                        >
                          Ver detalhes
                        </button>

                        {avaliacao.status ===
                          "Agendada" && (
                          <button
                            onClick={() =>
                              iniciarAvaliacao(
                                avaliacao.id,
                              )
                            }
                            className="min-h-11 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:px-4 sm:text-sm"
                          >
                            Iniciar
                          </button>
                        )}

                        <button
                          onClick={() =>
                            abrirEdicao(
                              avaliacao,
                            )
                          }
                          className="min-h-11 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                          title="Editar avaliação"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() =>
                            excluirAvaliacao(
                              avaliacao.id,
                            )
                          }
                          className="min-h-11 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          title="Excluir avaliação"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Modal nova avaliação */}
      {modalAberto && (
        <Modal
          titulo="Nova avaliação"
          subtitulo="Cadastre uma nova avaliação para o ciclo ativo."
          onClose={() => setModalAberto(false)}
        >
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Colaborador
              </label>

              <select
                value={novaAvaliacao.colaboradorId}
                onChange={(event) =>
                  setNovaAvaliacao({
                    ...novaAvaliacao,
                    colaboradorId:
                      event.target.value,
                  })
                }
                className="min-h-11 w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
              >
                <option value="">
                  Selecione um colaborador
                </option>

                {colaboradores.map(
                  (colaborador) => (
                    <option
                      key={colaborador.id}
                      value={colaborador.id}
                    >
                      {colaborador.nome} —{" "}
                      {colaborador.cargo}
                    </option>
                  ),
                )}
              </select>
            </div>

            <SelectInput
              label="Tipo de avaliação"
              value={novaAvaliacao.tipo}
              onChange={(value) =>
                setNovaAvaliacao({
                  ...novaAvaliacao,
                  tipo:
                    value as TipoAvaliacao,
                })
              }
              options={[
                "Avaliação de Desempenho",
                "Avaliação 360º",
                "Autoavaliação",
              ]}
            />

            {cicloAtivo ? (
              <div className="rounded-xl bg-indigo-50 p-4 text-sm text-indigo-700">
                <strong>
                  Ciclo ativo:
                </strong>{" "}
                {cicloAtivo.nome}.
                <br />

                <span className="text-xs">
                  Período de{" "}
                  {formatarData(
                    cicloAtivo.dataInicio,
                  )}{" "}
                  até{" "}
                  {formatarData(
                    cicloAtivo.dataFim,
                  )}
                  .
                </span>

                <br />

                <span className="mt-1 inline-block text-xs">
                  A avaliação será criada como{" "}
                  <strong>Pendente</strong> e
                  poderá ser iniciada
                  posteriormente.
                </span>
              </div>
            ) : (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                <strong>
                  Nenhum ciclo ativo encontrado.
                </strong>

                <br />

                <span className="text-xs">
                  Crie ou ative um ciclo antes
                  de cadastrar uma avaliação.
                </span>
              </div>
            )}

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
              O tipo da avaliação é utilizado
              atualmente pela interface. O
              backend ainda não possui um campo
              específico para armazená-lo.
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-5">
              <button
                onClick={() =>
                  setModalAberto(false)
                }
                className="min-h-11 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
              >
                Cancelar
              </button>

              <button
                onClick={cadastrarAvaliacao}
                disabled={
                  salvando || !cicloAtivo
                }
                className="min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {salvando
                  ? "Criando..."
                  : "Criar avaliação"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal edição */}
      {modalEdicaoAberto &&
        avaliacaoEditando && (
          <Modal
            titulo="Editar avaliação"
            subtitulo="Atualize o status e a nota da avaliação."
            onClose={() => {
              setModalEdicaoAberto(false);
              setAvaliacaoEditando(null);
            }}
          >
            <div className="space-y-4 sm:space-y-5">
              <Input
                label="Colaborador"
                value={
                  avaliacaoEditando.colaborador
                }
                onChange={() => {}}
              />

              <Input
                label="Cargo"
                value={avaliacaoEditando.cargo}
                onChange={() => {}}
              />

              <SelectInput
                label="Status"
                value={avaliacaoEditando.status}
                onChange={(value) =>
                  setAvaliacaoEditando({
                    ...avaliacaoEditando,
                    status:
                      value as StatusAvaliacao,
                  })
                }
                options={[
                  "Agendada",
                  "Em andamento",
                  "Concluída",
                ]}
              />

              <Input
                label="Nota"
                type="number"
                value={
                  avaliacaoEditando.nota !== null
                    ? String(
                        avaliacaoEditando.nota,
                      )
                    : ""
                }
                onChange={(value) =>
                  setAvaliacaoEditando({
                    ...avaliacaoEditando,
                    nota:
                      value === ""
                        ? null
                        : Number(value),
                  })
                }
                placeholder="Ex.: 8.5"
              />

              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
                O colaborador e o cargo são
                provenientes dos dados
                cadastrados no backend.
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-5">
                <button
                  onClick={() => {
                    setModalEdicaoAberto(false);
                    setAvaliacaoEditando(null);
                  }}
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 sm:w-auto"
                >
                  Cancelar
                </button>

                <button
                  onClick={salvarEdicao}
                  disabled={salvando}
                  className="min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {salvando
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>
              </div>
            </div>
          </Modal>
        )}

      {/* Modal detalhes */}
      {avaliacaoSelecionada && (
        <Modal
          titulo="Detalhes da avaliação"
          subtitulo="Visão geral do ciclo de avaliação."
          onClose={() =>
            setAvaliacaoSelecionada(null)
          }
        >
          <div className="min-w-0 space-y-5 sm:space-y-6">
            <div className="min-w-0 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-indigo-700 shadow-sm sm:h-14 sm:w-14 sm:text-base">
                    {avaliacaoSelecionada.colaborador
                      .split(" ")
                      .slice(0, 2)
                      .map(
                        (nome) => nome[0],
                      )
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div>
                    <h3 className="break-words text-lg font-bold leading-tight text-slate-800 sm:text-xl">
                      {
                        avaliacaoSelecionada.colaborador
                      }
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        avaliacaoSelecionada.cargo
                      }
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Nota final
                  </p>

                  <p
                    className={`text-3xl font-bold ${classeNota(
                      avaliacaoSelecionada.nota,
                    )}`}
                  >
                    {avaliacaoSelecionada.nota !==
                    null
                      ? avaliacaoSelecionada.nota.toFixed(
                          1,
                        )
                      : "Em aberto"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4">
              <InfoItem
                label="Tipo"
                valor={
                  avaliacaoSelecionada.tipo
                }
              />

              <InfoItem
                label="Ciclo"
                valor={
                  cicloAtivo?.nome ??
                  "Não informado"
                }
              />

              <InfoItem
                label="Data de início"
                valor={
                  avaliacaoSelecionada.data
                }
              />

              <InfoItem
                label="Status"
                valor={
                  avaliacaoSelecionada.status
                }
              />
            </div>

            {avaliacaoSelecionada.nota !==
              null && (
              <>
                <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                        ✓
                      </span>

                      <h4 className="font-bold text-emerald-800">
                        Pontos fortes
                      </h4>
                    </div>

                    {avaliacaoSelecionada
                      .pontosFortes
                      .length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        {avaliacaoSelecionada.pontosFortes.map(
                          (item) => (
                            <span
                              key={item}
                              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-emerald-700"
                            >
                              {item}
                            </span>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-emerald-700">
                        Nenhum ponto
                        registrado.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                        ↑
                      </span>

                      <h4 className="font-bold text-amber-800">
                        Desenvolvimento
                      </h4>
                    </div>

                    {avaliacaoSelecionada
                      .desenvolvimento
                      .length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        {avaliacaoSelecionada.desenvolvimento.map(
                          (item) => (
                            <span
                              key={item}
                              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-amber-700"
                            >
                              {item}
                            </span>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-amber-700">
                        Nenhum ponto
                        registrado.
                      </p>
                    )}
                  </div>
                </div>

                <div className="min-w-0 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-bold text-indigo-900">
                        Próximo passo recomendado
                      </h4>

                      <p className="mt-1 text-sm text-indigo-700">
                        Transforme os pontos de
                        desenvolvimento em um
                        plano de ação individual.
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        criarPDI(
                          avaliacaoSelecionada,
                        )
                      }
                      className="min-h-11 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:px-4 sm:text-sm"
                    >
                      Criar PDI
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 sm:flex sm:flex-wrap sm:justify-end sm:gap-3 sm:pt-5">
              <button
                onClick={() =>
                  abrirEdicao(
                    avaliacaoSelecionada,
                  )
                }
                className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                ✏️ Editar
              </button>

              <button
                onClick={() =>
                  setAvaliacaoSelecionada(null)
                }
                className="min-h-11 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Fechar
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
    <div className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
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

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base transition group-hover:bg-indigo-100 sm:h-11 sm:w-11 sm:text-lg">
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
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/50 p-3 sm:p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold text-slate-700 sm:text-sm">
        {valor}
      </p>
    </div>
  );
}

function Modal({
  titulo,
  subtitulo,
  children,
  onClose,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {titulo}
            </h2>

            {subtitulo && (
              <p className="mt-1 text-sm text-slate-500">
                {subtitulo}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-h-11 w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
      />
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-h-11 w-full rounded-xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
      >
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

