import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

type StatusApi =
  | "ATIVO"
  | "FERIAS"
  | "AFASTADO"
  | "INATIVO";

type StatusExibicao =
  | "Ativo"
  | "Férias"
  | "Afastado"
  | "Inativo";

type StatusAvaliacaoApi =
  | "PENDENTE"
  | "EM_ANDAMENTO"
  | "CONCLUIDA";

type StatusPdiApi =
  | "NAO_INICIADO"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "ATRASADO";

type PdiStatus =
  | "Em andamento"
  | "Concluído"
  | "Atrasado"
  | "Não iniciado";

type ColaboradorApi = {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  status: StatusApi;
  dataAdmissao: string;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
};

type AvaliacaoApi = {
  id: number;
  nota: number | null;
  status: StatusAvaliacaoApi;
  colaboradorId: number;
};

type PdiApi = {
  id: number;
  colaboradorId: number;
  titulo: string;
  progresso: number;
  status: StatusPdiApi;
};

type Colaborador = {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  status: StatusExibicao;
  desempenho: number | null;
  pdi: PdiStatus;
};

type NovoColaborador = {
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
};

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://localhost:3333";

const FETCH_OPTIONS: RequestInit = {
  cache: "no-store",
};

function converterStatus(
  status: StatusApi,
): StatusExibicao {
  const mapa: Record<
    StatusApi,
    StatusExibicao
  > = {
    ATIVO: "Ativo",
    FERIAS: "Férias",
    AFASTADO: "Afastado",
    INATIVO: "Inativo",
  };

  return mapa[status];
}

function obterStatusPdi(
  pdis: PdiApi[],
): PdiStatus {
  if (pdis.length === 0) {
    return "Não iniciado";
  }

  if (
    pdis.some(
      (pdi) =>
        pdi.status === "ATRASADO",
    )
  ) {
    return "Atrasado";
  }

  if (
    pdis.some(
      (pdi) =>
        pdi.status ===
          "EM_ANDAMENTO" ||
        (pdi.progresso > 0 &&
          pdi.progresso < 100),
    )
  ) {
    return "Em andamento";
  }

  if (
    pdis.some(
      (pdi) =>
        pdi.status === "CONCLUIDO" ||
        pdi.progresso >= 100,
    )
  ) {
    return "Concluído";
  }

  return "Não iniciado";
}

function transformarColaborador(
  colaborador: ColaboradorApi,
  avaliacoes: AvaliacaoApi[],
  pdis: PdiApi[],
): Colaborador {
  const avaliacoesColaborador =
    avaliacoes.filter(
      (avaliacao) =>
        avaliacao.colaboradorId ===
          colaborador.id &&
        avaliacao.nota !== null,
    );

  const notas =
    avaliacoesColaborador.map(
      (avaliacao) =>
        Number(avaliacao.nota),
    );

  const desempenho =
    notas.length > 0
      ? notas.reduce(
          (total, nota) =>
            total + nota,
          0,
        ) / notas.length
      : null;

  const pdisColaborador =
    pdis.filter(
      (pdi) =>
        pdi.colaboradorId ===
        colaborador.id,
    );

  return {
    id: colaborador.id,
    nome: colaborador.nome,
    email: colaborador.email,
    cargo: colaborador.cargo,
    departamento:
      colaborador.departamento,
    status: converterStatus(
      colaborador.status,
    ),
    desempenho,
    pdi: obterStatusPdi(
      pdisColaborador,
    ),
  };
}

function getStatusClasses(
  status: Colaborador["status"],
) {
  if (status === "Ativo") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
  }

  if (status === "Férias") {
    return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
  }

  if (status === "Inativo") {
    return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  }

  return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
}

function getStatusDot(
  status: Colaborador["status"],
) {
  if (status === "Ativo") {
    return "bg-emerald-500";
  }

  if (status === "Férias") {
    return "bg-blue-500";
  }

  if (status === "Inativo") {
    return "bg-slate-400";
  }

  return "bg-amber-500";
}

function getPdiClasses(
  pdi: Colaborador["pdi"],
) {
  if (pdi === "Concluído") {
    return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
  }

  if (pdi === "Em andamento") {
    return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
  }

  if (pdi === "Atrasado") {
    return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
  }

  return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
}

function getIniciais(nome: string) {
  return nome
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((item) => item[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAvatarClass(id: number) {
  const classes = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];

  return classes[
    (id - 1) % classes.length
  ];
}

function getDesempenhoClass(
  desempenho: number,
) {
  if (desempenho >= 9) {
    return "text-emerald-700";
  }

  if (desempenho >= 8) {
    return "text-blue-700";
  }

  return "text-amber-700";
}

function getDataAtual() {
  const hoje = new Date();

  const ano = hoje.getFullYear();

  const mes = String(
    hoje.getMonth() + 1,
  ).padStart(2, "0");

  const dia = String(
    hoje.getDate(),
  ).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export default function Colaboradores() {
  const navigate = useNavigate();

  const [
    colaboradores,
    setColaboradores,
  ] = useState<Colaborador[]>([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [erro, setErro] =
    useState("");

  const [busca, setBusca] =
    useState("");

  const [
    departamento,
    setDepartamento,
  ] = useState("Todos");

  const [status, setStatus] =
    useState("Todos");

  const [
    paginaAtual,
    setPaginaAtual,
  ] = useState(1);

  const [
    modalNovo,
    setModalNovo,
  ] = useState(false);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    mensagemSucesso,
    setMensagemSucesso,
  ] = useState("");

  const [
    novoNome,
    setNovoNome,
  ] = useState("");

  const [
    novoEmail,
    setNovoEmail,
  ] = useState("");

  const [
    novoCargo,
    setNovoCargo,
  ] = useState("");

  const [
    novoDepartamento,
    setNovoDepartamento,
  ] = useState("Administrativo");

  const [
    novaDataAdmissao,
    setNovaDataAdmissao,
  ] = useState(getDataAtual());

  const itensPorPagina = 6;

  async function carregarColaboradores() {
    try {
      setCarregando(true);
      setErro("");

      const [
        colaboradoresResponse,
        avaliacoesResponse,
        pdisResponse,
      ] = await Promise.all([
        fetch(
          `${API_URL}/colaboradores`,
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
      ]);

      if (
        !colaboradoresResponse.ok
      ) {
        throw new Error(
          "Não foi possível carregar os colaboradores.",
        );
      }

      if (!avaliacoesResponse.ok) {
        throw new Error(
          "Não foi possível carregar as avaliações.",
        );
      }

      if (!pdisResponse.ok) {
        throw new Error(
          "Não foi possível carregar os PDIs.",
        );
      }

      const colaboradoresApi:
        ColaboradorApi[] =
        await colaboradoresResponse.json();

      const avaliacoesApi:
        AvaliacaoApi[] =
        await avaliacoesResponse.json();

      const pdisApi: PdiApi[] =
        await pdisResponse.json();

      const colaboradoresFormatados =
        colaboradoresApi.map(
          (colaborador) =>
            transformarColaborador(
              colaborador,
              avaliacoesApi,
              pdisApi,
            ),
        );

      setColaboradores(
        colaboradoresFormatados,
      );

      setPaginaAtual(1);
    } catch (error) {
      console.error(
        "Erro ao carregar colaboradores:",
        error,
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados dos colaboradores.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarColaboradores();
  }, []);

  const departamentos =
    useMemo(() => {
      return Array.from(
        new Set(
          colaboradores.map(
            (colaborador) =>
              colaborador.departamento,
          ),
        ),
      ).sort((a, b) =>
        a.localeCompare(
          b,
          "pt-BR",
        ),
      );
    }, [colaboradores]);

  const colaboradoresFiltrados =
    useMemo(() => {
      return colaboradores.filter(
        (colaborador) => {
          const termo = busca
            .toLowerCase()
            .trim();

          const correspondeBusca =
            colaborador.nome
              .toLowerCase()
              .includes(termo) ||
            colaborador.cargo
              .toLowerCase()
              .includes(termo) ||
            colaborador.departamento
              .toLowerCase()
              .includes(termo);

          const correspondeDepartamento =
            departamento ===
              "Todos" ||
            colaborador.departamento ===
              departamento;

          const correspondeStatus =
            status === "Todos" ||
            colaborador.status ===
              status;

          return (
            correspondeBusca &&
            correspondeDepartamento &&
            correspondeStatus
          );
        },
      );
    }, [
      busca,
      departamento,
      status,
      colaboradores,
    ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      colaboradoresFiltrados.length /
        itensPorPagina,
    ),
  );

  const paginaSegura =
    Math.min(
      paginaAtual,
      totalPaginas,
    );

  const indiceInicial =
    (paginaSegura - 1) *
    itensPorPagina;

  const colaboradoresPagina =
    colaboradoresFiltrados.slice(
      indiceInicial,
      indiceInicial +
        itensPorPagina,
    );

  const primeiraLinha =
    colaboradoresFiltrados.length ===
    0
      ? 0
      : indiceInicial + 1;

  const ultimaLinha = Math.min(
    indiceInicial +
      itensPorPagina,
    colaboradoresFiltrados.length,
  );

  const totalAtivos =
    colaboradores.filter(
      (colaborador) =>
        colaborador.status === "Ativo",
    ).length;

  const totalFerias =
    colaboradores.filter(
      (colaborador) =>
        colaborador.status ===
        "Férias",
    ).length;

  const totalAfastados =
    colaboradores.filter(
      (colaborador) =>
        colaborador.status ===
        "Afastado",
    ).length;

  const colaboradoresAvaliados =
    colaboradores.filter(
      (colaborador) =>
        colaborador.desempenho !==
        null,
    );

  const mediaDesempenho =
    colaboradoresAvaliados.length >
    0
      ? colaboradoresAvaliados.reduce(
          (
            total,
            colaborador,
          ) =>
            total +
            (colaborador.desempenho ??
              0),
          0,
        ) /
        colaboradoresAvaliados.length
      : 0;

  const percentualAtivos =
    colaboradores.length > 0
      ? Math.round(
          (totalAtivos /
            colaboradores.length) *
            100,
        )
      : 0;

  function alterarPagina(
    novaPagina: number,
  ) {
    if (
      novaPagina >= 1 &&
      novaPagina <= totalPaginas
    ) {
      setPaginaAtual(
        novaPagina,
      );
    }
  }

  function alterarBusca(
    valor: string,
  ) {
    setBusca(valor);
    setPaginaAtual(1);
  }

  function alterarDepartamento(
    valor: string,
  ) {
    setDepartamento(valor);
    setPaginaAtual(1);
  }

  function alterarStatus(
    valor: string,
  ) {
    setStatus(valor);
    setPaginaAtual(1);
  }

  function limparFiltros() {
    setBusca("");
    setDepartamento("Todos");
    setStatus("Todos");
    setPaginaAtual(1);
  }

  function abrirNovoColaborador() {
    setNovoNome("");
    setNovoEmail("");
    setNovoCargo("");

    setNovoDepartamento(
      departamentos[0] ??
        "Administrativo",
    );

    setNovaDataAdmissao(
      getDataAtual(),
    );

    setModalNovo(true);
  }

  function fecharModal() {
    if (!salvando) {
      setModalNovo(false);
    }
  }

  async function cadastrarColaborador() {
    if (
      !novoNome.trim() ||
      !novoEmail.trim() ||
      !novoCargo.trim() ||
      !novoDepartamento ||
      !novaDataAdmissao
    ) {
      setErro(
        "Preencha todos os campos obrigatórios.",
      );

      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const novoColaborador:
        NovoColaborador = {
        nome: novoNome.trim(),
        email: novoEmail.trim(),
        cargo: novoCargo.trim(),
        departamento:
          novoDepartamento,
        dataAdmissao:
          novaDataAdmissao,
      };

      const response = await fetch(
        `${API_URL}/colaboradores`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            novoColaborador,
          ),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.mensagem ??
            "Não foi possível cadastrar o colaborador.",
        );
      }

      await carregarColaboradores();

      setBusca("");
      setDepartamento("Todos");
      setStatus("Todos");

      setModalNovo(false);

      setMensagemSucesso(
        `${data.nome} foi cadastrado com sucesso.`,
      );

      setNovoNome("");
      setNovoEmail("");
      setNovoCargo("");

      setTimeout(() => {
        setMensagemSucesso("");
      }, 4000);
    } catch (error) {
      console.error(
        "Erro ao cadastrar colaborador:",
        error,
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o colaborador.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="min-w-0 space-y-5 overflow-x-hidden pb-4 sm:space-y-6 sm:pb-0">
      {/* CABEÇALHO */}

      <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Gestão de pessoas
            </span>
          </div>

          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-slate-900 md:text-3xl">
            Colaboradores
          </h1>

          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-slate-500 sm:text-sm sm:leading-6">
            Gerencie pessoas,
            acompanhe desempenho e
            desenvolvimento
            profissional em um único
            lugar.
          </p>
        </div>

        <button
          type="button"
          onClick={
            abrirNovoColaborador
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
        >
          <span className="text-lg">
            +
          </span>

          Novo colaborador
        </button>
      </div>

      {/* SUCESSO */}

      {mensagemSucesso && (
        <div className="flex min-w-0 items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 sm:items-center">
          <span>✓</span>

          <span>
            {mensagemSucesso}
          </span>
        </div>
      )}

      {/* ERRO */}

      {erro && (
        <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 sm:flex-row sm:items-start">
          <span className="font-bold">
            !
          </span>

          <div className="flex-1">
            <p className="font-semibold">
              Erro de comunicação com
              a API
            </p>

            <p className="mt-1">
              {erro}
            </p>
          </div>

          <button
            type="button"
            onClick={
              carregarColaboradores
            }
            className="min-h-11 w-full rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 ring-1 ring-red-200 sm:min-h-0 sm:w-auto"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* INDICADORES */}

      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
                Total de
                colaboradores
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:mt-3 sm:text-3xl">
                {carregando
                  ? "..."
                  : colaboradores.length}
              </p>
            </div>

            <div className="shrink-0 text-xl sm:text-2xl">
              👥
            </div>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-slate-400 sm:mt-3 sm:text-xs">
            Pessoas cadastradas
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
                Colaboradores ativos
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:mt-3 sm:text-3xl">
                {carregando
                  ? "..."
                  : totalAtivos}
              </p>
            </div>

            <div className="shrink-0 text-xl sm:text-2xl">
              ✓
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 sm:mt-3">
            <span className="text-xs font-semibold text-emerald-600">
              {percentualAtivos}%
            </span>

            <span className="text-xs text-slate-400">
              da equipe
            </span>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
                Ausências
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:mt-3 sm:text-3xl">
                {carregando
                  ? "..."
                  : totalFerias +
                    totalAfastados}
              </p>
            </div>

            <div className="shrink-0 text-xl sm:text-2xl">
              📅
            </div>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-slate-400 sm:mt-3 sm:text-xs">
            {totalFerias} em férias ·{" "}
            {totalAfastados}{" "}
            afastado
            {totalAfastados !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
                Média de desempenho
              </p>

              <p
                className={`mt-2 text-2xl font-bold sm:mt-3 sm:text-3xl ${getDesempenhoClass(
                  mediaDesempenho,
                )}`}
              >
                {carregando
                  ? "..."
                  : mediaDesempenho
                      .toFixed(1)
                      .replace(
                        ".",
                        ",",
                      )}
              </p>
            </div>

            <div className="shrink-0 text-xl sm:text-2xl">
              ⭐
            </div>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-slate-400 sm:mt-3 sm:text-xs">
            Escala de 0 a 10 ·{" "}
            {
              colaboradoresAvaliados.length
            }{" "}
            avaliados
          </p>
        </div>
      </div>

      {/* FILTROS */}

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Pesquisar
              colaboradores
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Filtre por nome, cargo,
              departamento ou status.
            </p>
          </div>

          {(busca ||
            departamento !==
              "Todos" ||
            status !== "Todos") && (
            <button
              type="button"
              onClick={
                limparFiltros
              }
              className="text-sm font-semibold text-blue-600"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Buscar colaborador
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={busca}
                onChange={(event) =>
                  alterarBusca(
                    event.target.value,
                  )
                }
                placeholder="Nome, cargo ou departamento..."
                className="min-h-11 w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-base outline-none focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Departamento
            </label>

            <select
              value={departamento}
              onChange={(event) =>
                alterarDepartamento(
                  event.target.value,
                )
              }
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base sm:text-sm"
            >
              <option value="Todos">
                Todos
              </option>

              {departamentos.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                alterarStatus(
                  event.target.value,
                )
              }
              className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base sm:text-sm"
            >
              <option>Todos</option>
              <option>Ativo</option>
              <option>Férias</option>
              <option>
                Afastado
              </option>
              <option>Inativo</option>
            </select>
          </div>
        </div>
      </div>

      {/* LISTA */}

      <div className="flex min-w-0 items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">
            Lista de colaboradores
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {carregando
              ? "Carregando colaboradores..."
              : `${colaboradoresFiltrados.length} colaboradores encontrados`}
          </p>
        </div>

        <div className="hidden text-xs text-slate-400 sm:block">
          Dados carregados da API
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-100 md:hidden">
          {carregando ? (
            <div className="px-4 py-14 text-center text-sm text-slate-500">
              Carregando colaboradores...
            </div>
          ) : colaboradoresPagina.length > 0 ? (
            colaboradoresPagina.map(
              (colaborador) => (
                <article
                  key={colaborador.id}
                  className="p-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${getAvatarClass(
                        colaborador.id,
                      )}`}
                    >
                      {getIniciais(
                        colaborador.nome,
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-900">
                            {colaborador.nome}
                          </h3>

                          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                            {colaborador.cargo}
                          </p>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClasses(
                            colaborador.status,
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                              colaborador.status,
                            )}`}
                          />
                          {colaborador.status}
                        </span>
                      </div>

                      <p className="mt-1 break-all text-[11px] text-slate-400">
                        {colaborador.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Departamento
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                        {colaborador.departamento}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Desempenho
                      </p>
                      {colaborador.desempenho !==
                      null ? (
                        <p
                          className={`mt-1 text-sm font-bold ${getDesempenhoClass(
                            colaborador.desempenho,
                          )}`}
                        >
                          {colaborador.desempenho
                            .toFixed(1)
                            .replace(".", ",")}
                          <span className="ml-1 text-[10px] font-medium text-slate-400">
                            / 10
                          </span>
                        </p>
                      ) : (
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          Não avaliado
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        PDI
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getPdiClasses(
                          colaborador.pdi,
                        )}`}
                      >
                        {colaborador.pdi}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/colaboradores/${colaborador.id}`,
                        )
                      }
                      className="min-h-11 shrink-0 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 transition active:bg-blue-100"
                    >
                      Ver perfil →
                    </button>
                  </div>
                </article>
              ),
            )
          ) : (
            <div className="px-4 py-14 text-center text-sm text-slate-500">
              Nenhum colaborador encontrado.
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Colaborador
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Departamento
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Desempenho
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  PDI
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {carregando ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center"
                  >
                    Carregando
                    colaboradores...
                  </td>
                </tr>
              ) : colaboradoresPagina.length >
                0 ? (
                colaboradoresPagina.map(
                  (colaborador) => (
                    <tr
                      key={
                        colaborador.id
                      }
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${getAvatarClass(
                              colaborador.id,
                            )}`}
                          >
                            {getIniciais(
                              colaborador.nome,
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {
                                colaborador.nome
                              }
                            </p>

                            <p className="text-xs text-slate-500">
                              {
                                colaborador.cargo
                              }
                            </p>

                            <p className="text-xs text-slate-400">
                              {
                                colaborador.email
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {
                          colaborador.departamento
                        }
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                            colaborador.status,
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                              colaborador.status,
                            )}`}
                          />

                          {
                            colaborador.status
                          }
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {colaborador.desempenho !==
                        null ? (
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-bold ${getDesempenhoClass(
                                colaborador.desempenho,
                              )}`}
                            >
                              {colaborador.desempenho
                                .toFixed(
                                  1,
                                )
                                .replace(
                                  ".",
                                  ",",
                                )}
                            </span>

                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full ${
                                  colaborador.desempenho >=
                                  9
                                    ? "bg-emerald-500"
                                    : colaborador.desempenho >=
                                        8
                                      ? "bg-blue-500"
                                      : "bg-amber-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    colaborador.desempenho *
                                      10,
                                    100,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Ainda não
                            avaliado
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getPdiClasses(
                            colaborador.pdi,
                          )}`}
                        >
                          {
                            colaborador.pdi
                          }
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/colaboradores/${colaborador.id}`,
                            )
                          }
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                        >
                          Ver perfil →
                        </button>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-20 text-center text-slate-500"
                  >
                    Nenhum colaborador
                    encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {colaboradoresFiltrados.length >
          0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-500">
              Exibindo{" "}
              <strong>
                {primeiraLinha}-
                {ultimaLinha}
              </strong>{" "}
              de{" "}
              <strong>
                {
                  colaboradoresFiltrados.length
                }
              </strong>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <button
                type="button"
                disabled={
                  paginaSegura === 1
                }
                onClick={() =>
                  alterarPagina(
                    paginaSegura - 1,
                  )
                }
                className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:opacity-40 sm:text-sm"
              >
                ← Anterior
              </button>

              {Array.from(
                {
                  length:
                    totalPaginas,
                },
                (_, index) =>
                  index + 1,
              ).map((pagina) => (
                <button
                  key={pagina}
                  type="button"
                  onClick={() =>
                    alterarPagina(
                      pagina,
                    )
                  }
                  className={`h-10 w-10 rounded-lg text-sm font-semibold ${
                    paginaSegura ===
                    pagina
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pagina}
                </button>
              ))}

              <button
                type="button"
                disabled={
                  paginaSegura ===
                  totalPaginas
                }
                onClick={() =>
                  alterarPagina(
                    paginaSegura + 1,
                  )
                }
                className="min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:opacity-40 sm:text-sm"
              >
                Próximo →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}

      {modalNovo && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/50 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              fecharModal();
            }
          }}
        >
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Novo colaborador
                </h2>

                <p className="text-sm text-slate-500">
                  Cadastre uma nova
                  pessoa.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  fecharModal
                }
                disabled={
                  salvando
                }
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Nome completo
                </label>

                <input
                  type="text"
                  value={novoNome}
                  onChange={(
                    event,
                  ) =>
                    setNovoNome(
                      event.target
                        .value,
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  E-mail
                </label>

                <input
                  type="email"
                  value={novoEmail}
                  onChange={(
                    event,
                  ) =>
                    setNovoEmail(
                      event.target
                        .value,
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Cargo
                </label>

                <input
                  type="text"
                  value={novoCargo}
                  onChange={(
                    event,
                  ) =>
                    setNovoCargo(
                      event.target
                        .value,
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-base sm:text-sm"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Departamento
                </label>

                <select
                  value={
                    novoDepartamento
                  }
                  onChange={(
                    event,
                  ) =>
                    setNovoDepartamento(
                      event.target
                        .value,
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-base sm:text-sm"
                >
                  {departamentos.map(
                    (item) => (
                      <option
                        key={item}
                      >
                        {item}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Data de admissão
                </label>

                <input
                  type="date"
                  value={
                    novaDataAdmissao
                  }
                  onChange={(
                    event,
                  ) =>
                    setNovaDataAdmissao(
                      event.target
                        .value,
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-3 text-base sm:text-sm"
                />
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
              <button
                type="button"
                onClick={
                  fecharModal
                }
                disabled={
                  salvando
                }
                className="min-h-11 w-full rounded-xl border border-slate-300 px-4 py-2.5 sm:w-auto"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  cadastrarColaborador
                }
                disabled={
                  salvando ||
                  !novoNome.trim() ||
                  !novoEmail.trim() ||
                  !novoCargo.trim() ||
                  !novaDataAdmissao
                }
                className="min-h-11 w-full rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50 sm:w-auto"
              >
                {salvando
                  ? "Salvando..."
                  : "Cadastrar colaborador"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}