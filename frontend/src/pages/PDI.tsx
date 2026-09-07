
import { useEffect, useMemo, useState } from "react";

type StatusPDI =
  | "A iniciar"
  | "Em andamento"
  | "Concluído"
  | "Atrasado";

type StatusPDIBackend =
  | "NAO_INICIADO"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "ATRASADO";

type Colaborador = {
  id: number;
  nome: string;
  cargo: string;
  departamento: string;
};

type PDIItem = {
  id: number;
  colaboradorId: number;
  colaborador: string;
  cargo: string;
  objetivo: string;
  descricao: string;
  prazo: string;
  progresso: number;
  status: StatusPDI;
  responsavel: string;
};

type NovoPDI = {
  colaboradorId: string;
  objetivo: string;
  descricao: string;
  prazo: string;
  responsavel: string;
};

type SelectOption = {
  value: string;
  label: string;
};

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://localhost:3333";

const statusToBackend: Record<
  StatusPDI,
  StatusPDIBackend
> = {
  "A iniciar": "NAO_INICIADO",
  "Em andamento": "EM_ANDAMENTO",
  Concluído: "CONCLUIDO",
  Atrasado: "ATRASADO",
};

const formatarData = (
  data: string | null | undefined,
) => {
  if (!data) return "Sem prazo";

  const dataSomente = data.slice(0, 10);
  const [ano, mes, dia] = dataSomente
    .split("-")
    .map(Number);

  if (!ano || !mes || !dia) {
    return "Sem prazo";
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
};

const obterStatus = (
  progresso: number,
  statusBackend: StatusPDIBackend,
): StatusPDI => {
  if (statusBackend === "ATRASADO") {
    return "Atrasado";
  }

  if (
    statusBackend === "CONCLUIDO" ||
    progresso >= 100
  ) {
    return "Concluído";
  }

  if (
    statusBackend === "EM_ANDAMENTO" ||
    progresso > 0
  ) {
    return "Em andamento";
  }

  return "A iniciar";
};

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
  options: SelectOption[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
      >
        <option value="">
          {placeholder ?? "Selecione uma opção"}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PDI() {
  const [pdiItens, setPdiItens] =
    useState<PDIItem[]>([]);

  const [colaboradores, setColaboradores] =
    useState<Colaborador[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [busca, setBusca] =
    useState("");

  const [filtroStatus, setFiltroStatus] =
    useState("Todos");

  const [
    filtroResponsavel,
    setFiltroResponsavel,
  ] = useState("Todos");

  const [
    modalNovoPDI,
    setModalNovoPDI,
  ] = useState(false);

  const [
    modalDetalhes,
    setModalDetalhes,
  ] = useState(false);

  const [
    pdiSelecionado,
    setPdiSelecionado,
  ] = useState<PDIItem | null>(null);

  const [novoPDI, setNovoPDI] =
    useState<NovoPDI>({
      colaboradorId: "",
      objetivo: "",
      descricao: "",
      prazo: "",
      responsavel: "",
    });

  const [salvando, setSalvando] =
    useState(false);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setErro("");

      const [
        pdisResponse,
        colaboradoresResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/pdis`),
        fetch(`${API_URL}/colaboradores`),
      ]);

      if (!pdisResponse.ok) {
        throw new Error(
          "Erro ao buscar PDIs.",
        );
      }

      if (!colaboradoresResponse.ok) {
        throw new Error(
          "Erro ao buscar colaboradores.",
        );
      }

      const pdisApi =
        await pdisResponse.json();

      const colaboradoresApi =
        await colaboradoresResponse.json();

      const colaboradoresFormatados: Colaborador[] =
        colaboradoresApi.map(
          (colaborador: Colaborador) => ({
            id: colaborador.id,
            nome: colaborador.nome,
            cargo: colaborador.cargo,
            departamento:
              colaborador.departamento,
          }),
        );

      const pdisFormatados: PDIItem[] =
        pdisApi.map(
          (pdi: {
            id: number;
            titulo: string;
            descricao: string | null;
            objetivo: string | null;
            prazo: string | null;
            progresso: number;
            status: StatusPDIBackend;
            responsavel: string | null;
            colaboradorId: number;
            colaborador?: {
              id: number;
              nome: string;
              cargo: string;
            };
          }) => ({
            id: pdi.id,

            colaboradorId:
              pdi.colaboradorId,

            colaborador:
              pdi.colaborador?.nome ??
              colaboradoresFormatados.find(
                (colaborador) =>
                  colaborador.id ===
                  pdi.colaboradorId,
              )?.nome ??
              "Colaborador não encontrado",

            cargo:
              pdi.colaborador?.cargo ??
              colaboradoresFormatados.find(
                (colaborador) =>
                  colaborador.id ===
                  pdi.colaboradorId,
              )?.cargo ??
              "Cargo não informado",

            objetivo:
              pdi.objetivo ?? "",

            descricao:
              pdi.descricao ?? "",

            prazo:
              formatarData(pdi.prazo),

            progresso:
              pdi.progresso,

            status:
              obterStatus(
                pdi.progresso,
                pdi.status,
              ),

            responsavel:
              pdi.responsavel ??
              "Não informado",
          }),
        );

      setColaboradores(
        colaboradoresFormatados,
      );

      setPdiItens(
        pdisFormatados,
      );
    } catch (error) {
      console.error(error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados.",
      );
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const colaboradoresOptions:
    SelectOption[] = useMemo(
    () =>
      colaboradores.map(
        (colaborador) => ({
          value:
            String(colaborador.id),

          label:
            `${colaborador.nome} — ${colaborador.cargo}`,
        }),
      ),
    [colaboradores],
  );

  const responsaveisOptions:
    SelectOption[] = useMemo(
    () =>
      Array.from(
        new Set(
          pdiItens
            .map(
              (pdi) =>
                pdi.responsavel,
            )
            .filter(
              (responsavel) =>
                responsavel &&
                responsavel !==
                  "Não informado",
            ),
        ),
      ).map(
        (responsavel) => ({
          value: responsavel,
          label: responsavel,
        }),
      ),
    [pdiItens],
  );

  const pdisFiltrados =
    useMemo(() => {
      return pdiItens.filter(
        (pdi) => {
          const termo =
            busca.toLowerCase();

          const correspondeBusca =
            pdi.colaborador
              .toLowerCase()
              .includes(termo) ||
            pdi.objetivo
              .toLowerCase()
              .includes(termo) ||
            pdi.descricao
              .toLowerCase()
              .includes(termo);

          const correspondeStatus =
            filtroStatus ===
              "Todos" ||
            pdi.status ===
              filtroStatus;

          const correspondeResponsavel =
            filtroResponsavel ===
              "Todos" ||
            pdi.responsavel ===
              filtroResponsavel;

          return (
            correspondeBusca &&
            correspondeStatus &&
            correspondeResponsavel
          );
        },
      );
    }, [
      pdiItens,
      busca,
      filtroStatus,
      filtroResponsavel,
    ]);

  const totalPDIs =
    pdiItens.length;

  const pdIsEmAndamento =
    pdiItens.filter(
      (pdi) =>
        pdi.status ===
        "Em andamento",
    ).length;

  const pdIsConcluidos =
    pdiItens.filter(
      (pdi) =>
        pdi.status ===
        "Concluído",
    ).length;

  const pdIsAtrasados =
    pdiItens.filter(
      (pdi) =>
        pdi.status ===
        "Atrasado",
    ).length;

  const progressoMedio =
    totalPDIs > 0
      ? Math.round(
          pdiItens.reduce(
            (total, pdi) =>
              total +
              pdi.progresso,
            0,
          ) / totalPDIs,
        )
      : 0;

  const cadastrarPDI =
    async () => {
      if (
        !novoPDI.colaboradorId ||
        !novoPDI.objetivo ||
        !novoPDI.prazo
      ) {
        setErro(
          "Preencha colaborador, objetivo e prazo para cadastrar o PDI.",
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

              body:
                JSON.stringify({
                  titulo:
                    novoPDI.objetivo,

                  objetivo:
                    novoPDI.objetivo,

                  descricao:
                    novoPDI.descricao ||
                    null,

                  prazo:
                    novoPDI.prazo
                      ? `${novoPDI.prazo}T00:00:00.000Z`
                      : null,

                  progresso: 0,

                  status:
                    "NAO_INICIADO",

                  responsavel:
                    novoPDI.responsavel.trim() ||
                    null,

                  colaboradorId:
                    Number(
                      novoPDI.colaboradorId,
                    ),
                }),
            },
          );

        if (!response.ok) {
          const resultado =
            await response
              .json()
              .catch(
                () => null,
              );

          throw new Error(
            resultado?.mensagem ??
              "Não foi possível cadastrar o PDI.",
          );
        }

        await carregarDados();

        setNovoPDI({
          colaboradorId: "",
          objetivo: "",
          descricao: "",
          prazo: "",
          responsavel: "",
        });

        setModalNovoPDI(
          false,
        );
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

  const excluirPDI =
    async (
      id: number,
    ) => {
      const confirmar =
        window.confirm(
          "Tem certeza que deseja excluir este PDI?",
        );

      if (!confirmar) {
        return;
      }

      try {
        setErro("");

        const response =
          await fetch(
            `${API_URL}/pdis/${id}`,
            {
              method:
                "DELETE",
            },
          );

        if (!response.ok) {
          const resultado =
            await response
              .json()
              .catch(
                () => null,
              );

          throw new Error(
            resultado?.mensagem ??
              "Não foi possível excluir o PDI.",
          );
        }

        setPdiItens(
          (pdis) =>
            pdis.filter(
              (pdi) =>
                pdi.id !== id,
            ),
        );

        if (
          pdiSelecionado?.id ===
          id
        ) {
          setPdiSelecionado(
            null,
          );

          setModalDetalhes(
            false,
          );
        }
      } catch (error) {
        console.error(error);

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao excluir PDI.",
        );
      }
    };

  const atualizarProgresso =
    async (
      id: number,
      progresso: number,
    ) => {
      console.log(
        "TESTE PROGRESSO:",
        id,
        progresso,
      );

      const pdiAtual =
        pdiItens.find(
          (pdi) =>
            pdi.id === id,
        );

      if (!pdiAtual) {
        return;
      }

      let novoStatus:
        StatusPDI =
        pdiAtual.status;

      if (
        progresso >= 100
      ) {
        novoStatus =
          "Concluído";
      } else if (
        progresso > 0
      ) {
        novoStatus =
          "Em andamento";
      } else {
        novoStatus =
          "A iniciar";
      }

      try {
        setErro("");

        console.log(
          "ENVIANDO PUT:",
          {
            id,
            progresso,
            status:
              statusToBackend[
                novoStatus
              ],
          },
        );

        const response =
          await fetch(
            `${API_URL}/pdis/${id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  progresso,

                  status:
                    statusToBackend[
                      novoStatus
                    ],
                }),
            },
          );

        console.log(
          "RESPOSTA PUT:",
          response.status,
        );

        if (!response.ok) {
          const resultado =
            await response
              .json()
              .catch(
                () => null,
              );

          throw new Error(
            resultado?.mensagem ??
              "Não foi possível atualizar o progresso.",
          );
        }

        setPdiItens(
          (pdis) =>
            pdis.map(
              (pdi) =>
                pdi.id ===
                id
                  ? {
                      ...pdi,
                      progresso,
                      status:
                        novoStatus,
                    }
                  : pdi,
            ),
        );

        setPdiSelecionado(
          (pdi) =>
            pdi &&
            pdi.id === id
              ? {
                  ...pdi,
                  progresso,
                  status:
                    novoStatus,
                }
              : pdi,
        );
      } catch (error) {
        console.error(error);

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao atualizar progresso.",
        );
      }
    };

  const abrirDetalhes =
    (pdi: PDIItem) => {
      setPdiSelecionado(
        pdi,
      );

      setModalDetalhes(
        true,
      );
    };

  const limparFiltros =
    () => {
      setBusca("");

      setFiltroStatus(
        "Todos",
      );

      setFiltroResponsavel(
        "Todos",
      );
    };

  const getStatusClasses =
    (
      status: StatusPDI,
    ) => {
      switch (status) {
        case "Concluído":
          return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "Em andamento":
          return "bg-blue-50 text-blue-700 border-blue-200";

        case "Atrasado":
          return "bg-red-50 text-red-700 border-red-200";

        default:
          return "bg-amber-50 text-amber-700 border-amber-200";
      }
    };

  const getProgressClasses =
    (
      status: StatusPDI,
    ) => {
      switch (status) {
        case "Concluído":
          return "bg-emerald-500";

        case "Atrasado":
          return "bg-red-500";

        case "Em andamento":
          return "bg-blue-500";

        default:
          return "bg-amber-500";
      }
    };

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden pb-4 sm:space-y-6 sm:pb-0">

      {/* CABEÇALHO */}

      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-slate-900 sm:text-3xl">
            Plano de Desenvolvimento Individual
          </h1>

          <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-sm">
            Acompanhe o desenvolvimento e evolução dos colaboradores.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErro("");
            setModalNovoPDI(true);
          }}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
        >
          <span className="text-lg">
            +
          </span>

          Novo PDI
        </button>
      </div>

      {/* ERRO */}

      {erro && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>
            {erro}
          </span>

          <button
            type="button"
            onClick={() =>
              setErro("")
            }
            className="font-semibold text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* MÉTRICAS */}

      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-2 sm:items-center">
            <div>
              <p className="text-[11px] leading-4 text-slate-500 sm:text-sm">
                Total de PDIs
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {carregando
                  ? "—"
                  : totalPDIs}
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base sm:h-11 sm:w-11 sm:text-xl">
              🎯
            </div>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-slate-500 sm:mt-3 sm:text-xs">
            Planos cadastrados
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-2 sm:items-center">
            <div>
              <p className="text-[11px] leading-4 text-slate-500 sm:text-sm">
                Em andamento
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {carregando
                  ? "—"
                  : pdIsEmAndamento}
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base sm:h-11 sm:w-11 sm:text-xl">
              📈
            </div>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-slate-500 sm:mt-3 sm:text-xs">
            PDIs em desenvolvimento
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-2 sm:items-center">
            <div>
              <p className="text-[11px] leading-4 text-slate-500 sm:text-sm">
                Concluídos
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {carregando
                  ? "—"
                  : pdIsConcluidos}
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-base sm:h-11 sm:w-11 sm:text-xl">
              ✓
            </div>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-slate-500 sm:mt-3 sm:text-xs">
            Desenvolvimento finalizado
          </p>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-2 sm:items-center">
            <div>
              <p className="text-[11px] leading-4 text-slate-500 sm:text-sm">
                Progresso médio
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {carregando
                  ? "—"
                  : `${progressoMedio}%`}
              </p>
            </div>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-base sm:h-11 sm:w-11 sm:text-xl">
              🚀
            </div>
          </div>

          <p className="mt-2 break-words text-[10px] leading-4 text-slate-500 sm:mt-3 sm:text-xs">
            Média geral dos PDIs
          </p>
        </div>
      </div>

      {/* ATRASADOS */}

      {!carregando &&
        pdIsAtrasados >
          0 && (
          <div className="min-w-0 rounded-2xl border border-red-200 bg-red-50 p-3.5 sm:p-4">
            <div className="flex min-w-0 items-start gap-3 sm:items-center">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                ⚠️
              </div>

              <div>
                <p className="font-semibold text-red-800">
                  {
                    pdIsAtrasados
                  }{" "}
                  PDI
                  {pdIsAtrasados !==
                  1
                    ? "s"
                    : ""}{" "}
                  atrasado
                  {pdIsAtrasados !==
                  1
                    ? "s"
                    : ""}
                </p>

                <p className="text-sm text-red-700">
                  Verifique os prazos dos planos de desenvolvimento.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* FILTROS */}

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

        <div className="mb-4 flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="break-words font-semibold leading-5 text-slate-900">
              PDIs cadastrados
            </h2>

            <p className="text-[11px] leading-4 text-slate-500 sm:text-sm">
              Pesquise e filtre os planos de desenvolvimento.
            </p>
          </div>

          {(busca ||
            filtroStatus !==
              "Todos" ||
            filtroResponsavel !==
              "Todos") && (
            <button
              type="button"
              onClick={
                limparFiltros
              }
              className="self-start text-xs font-medium text-indigo-600 hover:text-indigo-800 sm:text-sm"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-3">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Buscar
            </label>

            <div className="relative">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={busca}
                onChange={(
                  event,
                ) =>
                  setBusca(
                    event
                      .target
                      .value,
                  )
                }
                placeholder="Colaborador ou objetivo..."
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-base text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
              />

            </div>
          </div>

          <SelectInput
            label="Status"
            value={
              filtroStatus
            }
            onChange={
              setFiltroStatus
            }
            options={[
              {
                value:
                  "Todos",
                label:
                  "Todos os status",
              },
              {
                value:
                  "A iniciar",
                label:
                  "A iniciar",
              },
              {
                value:
                  "Em andamento",
                label:
                  "Em andamento",
              },
              {
                value:
                  "Concluído",
                label:
                  "Concluído",
              },
              {
                value:
                  "Atrasado",
                label:
                  "Atrasado",
              },
            ]}
          />

          <SelectInput
            label="Responsável"
            value={
              filtroResponsavel
            }
            onChange={
              setFiltroResponsavel
            }
            options={[
              {
                value:
                  "Todos",
                label:
                  "Todos os responsáveis",
              },
              ...responsaveisOptions,
            ]}
          />
        </div>
      </div>

      {/* LISTA */}

      <div className="space-y-4">

        {carregando ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">

            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

            <p className="text-[11px] leading-4 text-slate-500 sm:text-sm">
              Carregando PDIs...
            </p>

          </div>
        ) : pdisFiltrados.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center sm:p-10">

            <div className="text-4xl">
              🎯
            </div>

            <h3 className="mt-3 font-semibold text-slate-900">
              Nenhum PDI encontrado
            </h3>

            <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-sm">
              {pdiItens.length ===
              0
                ? "Ainda não existem PDIs cadastrados."
                : "Tente alterar os filtros da pesquisa."}
            </p>

          </div>
        ) : (
          pdisFiltrados.map(
            (pdi) => (
              <div
                key={
                  pdi.id
                }
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >
                <div className="flex min-w-0 flex-col gap-4 sm:gap-5 xl:flex-row xl:items-center xl:justify-between">

                  <div className="min-w-0 flex-1">

                    <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                      <h3 className="break-words font-semibold leading-5 text-slate-900">
                        {pdi.objetivo ||
                          "PDI sem objetivo"}
                      </h3>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          pdi.status,
                        )}`}
                      >
                        {
                          pdi.status
                        }
                      </span>

                    </div>

                    <div className="mt-2 grid gap-1.5 text-xs leading-5 text-slate-500 sm:flex sm:flex-wrap sm:gap-x-5 sm:gap-y-1 sm:text-sm">

                      <span>
                        👤{" "}
                        {
                          pdi.colaborador
                        }
                      </span>

                      <span>
                        💼{" "}
                        {
                          pdi.cargo
                        }
                      </span>

                      <span>
                        📅 Prazo:{" "}
                        {
                          pdi.prazo
                        }
                      </span>

                      <span>
                        👨‍💼{" "}
                        {
                          pdi.responsavel
                        }
                      </span>

                    </div>

                    {pdi.descricao && (
                      <p className="mt-3 line-clamp-2 break-words text-sm leading-5 text-slate-500">
                        {
                          pdi.descricao
                        }
                      </p>
                    )}

                    <div className="mt-4 max-w-2xl">

                      <div className="mb-2 flex items-center justify-between text-xs">

                        <span className="font-medium text-slate-600">
                          Progresso
                        </span>

                        <span className="font-semibold text-slate-800">
                          {
                            pdi.progresso
                          }
                          %
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className={`h-full rounded-full transition-all ${getProgressClasses(
                            pdi.status,
                          )}`}
                          style={{
                            width:
                              `${pdi.progresso}%`,
                          }}
                        />

                      </div>
                    </div>
                  </div>

                  <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:items-center">

                    <button
                      type="button"
                      onClick={() =>
                        abrirDetalhes(
                          pdi,
                        )
                      }
                      className="min-h-11 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:px-4 sm:text-sm"
                    >
                      Ver detalhes
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        excluirPDI(
                          pdi.id,
                        )
                      }
                      className="min-h-11 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50 sm:px-4 sm:text-sm"
                    >
                      Excluir
                    </button>

                  </div>

                </div>
              </div>
            ),
          )
        )}

      </div>

      {/* MODAL NOVO PDI */}

      {modalNovoPDI && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/50 p-0 sm:items-center sm:p-4">

          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">

            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:items-center sm:px-6 sm:py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Novo PDI
                </h2>

                <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-sm">
                  Cadastre um novo plano de desenvolvimento.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalNovoPDI(
                    false,
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">

              <SelectInput
                label="Colaborador"
                value={
                  novoPDI.colaboradorId
                }
                onChange={(
                  value,
                ) =>
                  setNovoPDI(
                    (
                      atual: NovoPDI,
                    ) => ({
                      ...atual,

                      colaboradorId:
                        value,
                    }),
                  )
                }
                options={
                  colaboradoresOptions
                }
                placeholder="Selecione o colaborador"
              />

              <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Objetivo
                  </label>

                  <input
                    type="text"
                    value={
                      novoPDI.objetivo
                    }
                    onChange={(
                      event,
                    ) =>
                      setNovoPDI(
                        (
                          atual: NovoPDI,
                        ) => ({
                          ...atual,

                          objetivo:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="Ex.: Desenvolver liderança"
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Prazo
                  </label>

                  <input
                    type="date"
                    value={
                      novoPDI.prazo
                    }
                    onChange={(
                      event,
                    ) =>
                      setNovoPDI(
                        (
                          atual: NovoPDI,
                        ) => ({
                          ...atual,

                          prazo:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                  />
                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Responsável
                </label>

                <input
                  type="text"
                  value={
                    novoPDI.responsavel
                  }
                  onChange={(
                    event,
                  ) =>
                    setNovoPDI(
                      (
                        atual: NovoPDI,
                      ) => ({
                        ...atual,

                        responsavel:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  placeholder="Ex.: Gestor direto"
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Descrição
                </label>

                <textarea
                  value={
                    novoPDI.descricao
                  }
                  onChange={(
                    event,
                  ) =>
                    setNovoPDI(
                      (
                        atual: NovoPDI,
                      ) => ({
                        ...atual,

                        descricao:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  rows={4}
                  placeholder="Descreva as ações, competências ou atividades que serão desenvolvidas..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                />

              </div>

            </div>

            <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6 sm:py-5">

              <button
                type="button"
                onClick={() =>
                  setModalNovoPDI(
                    false,
                  )
                }
                className="min-h-11 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={
                  cadastrarPDI
                }
                disabled={
                  salvando
                }
                className="min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {salvando
                  ? "Salvando..."
                  : "Cadastrar PDI"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* MODAL DETALHES */}

      {modalDetalhes &&
        pdiSelecionado && (
          <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/50 p-0 sm:items-center sm:p-4">

            <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">

              <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">

                <div>

                  <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                    <h2 className="text-lg font-bold text-slate-900">
                      Detalhes do PDI
                    </h2>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                        pdiSelecionado.status,
                      )}`}
                    >
                      {
                        pdiSelecionado.status
                      }
                    </span>

                  </div>

                  <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-sm">
                    {
                      pdiSelecionado.colaborador
                    }
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setModalDetalhes(
                      false,
                    )
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>

              </div>

              <div className="min-w-0 space-y-5 p-4 sm:space-y-6 sm:p-6">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Objetivo
                  </p>

                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {
                      pdiSelecionado.objetivo ||
                      "Objetivo não informado"
                    }
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Descrição
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {
                      pdiSelecionado.descricao ||
                      "Nenhuma descrição informada."
                    }
                  </p>

                </div>

                <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">

                  <div className="min-w-0 rounded-xl bg-slate-50 p-3.5 sm:p-4">

                    <p className="text-xs text-slate-500">
                      Colaborador
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold text-slate-800 sm:text-base">
                      {
                        pdiSelecionado.colaborador
                      }
                    </p>

                  </div>

                  <div className="min-w-0 rounded-xl bg-slate-50 p-3.5 sm:p-4">

                    <p className="text-xs text-slate-500">
                      Cargo
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold text-slate-800 sm:text-base">
                      {
                        pdiSelecionado.cargo
                      }
                    </p>

                  </div>

                  <div className="min-w-0 rounded-xl bg-slate-50 p-3.5 sm:p-4">

                    <p className="text-xs text-slate-500">
                      Prazo
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold text-slate-800 sm:text-base">
                      {
                        pdiSelecionado.prazo
                      }
                    </p>

                  </div>

                </div>

                <div>

                  <div className="mb-3 flex items-center justify-between">

                    <div>

                      <p className="text-sm font-semibold text-slate-800">
                        Progresso
                      </p>

                      <p className="text-xs text-slate-500">
                        Atualize o andamento do plano.
                      </p>

                    </div>

                    <span className="text-lg font-bold text-indigo-600">
                      {
                        pdiSelecionado.progresso
                      }
                      %
                    </span>

                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={
                      pdiSelecionado.progresso
                    }
                    onChange={(
                      event,
                    ) =>
                      atualizarProgresso(
                        pdiSelecionado.id,

                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    className="w-full cursor-pointer accent-indigo-600"
                  />

                  <div className="mt-2 flex justify-between text-xs text-slate-400">

                    <span>
                      0%
                    </span>

                    <span>
                      25%
                    </span>

                    <span>
                      50%
                    </span>

                    <span>
                      75%
                    </span>

                    <span>
                      100%
                    </span>

                  </div>

                </div>

                <div className="min-w-0 rounded-xl border border-indigo-100 bg-indigo-50 p-3.5 sm:p-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    Responsável
                  </p>

                  <p className="mt-1 font-semibold text-indigo-900">
                    {
                      pdiSelecionado.responsavel
                    }
                  </p>

                </div>

              </div>

              <div className="sticky bottom-0 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:flex sm:justify-between sm:px-6 sm:py-5">

                <button
                  type="button"
                  onClick={() =>
                    excluirPDI(
                      pdiSelecionado.id,
                    )
                  }
                  className="min-h-11 rounded-xl border border-red-200 px-3 py-3 text-xs font-medium text-red-600 hover:bg-red-50 sm:px-5 sm:text-sm"
                >
                  Excluir PDI
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setModalDetalhes(
                      false,
                    )
                  }
                  className="min-h-11 rounded-xl bg-slate-900 px-3 py-3 text-xs font-semibold text-white hover:bg-slate-800 sm:px-5 sm:text-sm"
                >
                  Fechar
                </button>

              </div>

            </div>
          </div>
        )}

    </div>
  );
}