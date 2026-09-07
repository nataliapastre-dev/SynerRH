
import { useEffect, useMemo, useState } from "react";
type TipoFeedback =
  | "Positivo"
  | "Desenvolvimento"
  | "Reconhecimento"
  | "Outro";

type TipoFeedbackBackend =
  | "POSITIVO"
  | "DESENVOLVIMENTO"
  | "RECONHECIMENTO"
  | "OUTRO";

type Colaborador = {
  id: number;
  nome: string;
  cargo: string;
  departamento: string;
};

type Feedback = {
  id: number;
  colaboradorId: number;
  colaborador: string;
  autor: string;
  titulo: string;
  tipo: TipoFeedback;
  data: string;
  mensagem: string;
};

type NovoFeedback = {
  colaboradorId: string;
  autorId: string;
  titulo: string;
  tipo: TipoFeedback;
  mensagem: string;
};

const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://localhost:3333";

const FETCH_OPTIONS: RequestInit = {
  cache: "no-store",
};

const tipoToBackend: Record<
  TipoFeedback,
  TipoFeedbackBackend
> = {
  Positivo: "POSITIVO",
  Desenvolvimento: "DESENVOLVIMENTO",
  Reconhecimento: "RECONHECIMENTO",
  Outro: "OUTRO",
};

const tipoFromBackend = (
  tipo: TipoFeedbackBackend,
): TipoFeedback => {
  switch (tipo) {
    case "POSITIVO":
      return "Positivo";

    case "DESENVOLVIMENTO":
      return "Desenvolvimento";

    case "RECONHECIMENTO":
      return "Reconhecimento";

    case "OUTRO":
    default:
      return "Outro";
  }
};

const formatarData = (
  data: string | null | undefined,
) => {
  if (!data) {
    return "Data não informada";
  }

  const dataSomente = data.slice(0, 10);
  const [ano, mes, dia] = dataSomente
    .split("-")
    .map(Number);

  if (!ano || !mes || !dia) {
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
};

export default function Feedbacks() {
  const [
    feedbacks,
    setFeedbacks,
  ] = useState<Feedback[]>([]);

  const [
    colaboradores,
    setColaboradores,
  ] = useState<Colaborador[]>([]);

  const [
    filtroTipo,
    setFiltroTipo,
  ] = useState<
    "Todos" | TipoFeedback
  >("Todos");

  const [
    filtroColaborador,
    setFiltroColaborador,
  ] = useState("Todos");

  const [
    modalAberto,
    setModalAberto,
  ] = useState(false);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  const [
    erro,
    setErro,
  ] = useState("");

  const [
    novoFeedback,
    setNovoFeedback,
  ] = useState<NovoFeedback>({
    colaboradorId: "",
    autorId: "",
    titulo: "",
    tipo: "Positivo",
    mensagem: "",
  });

  const carregarDados =
    async () => {
      try {
        setCarregando(true);
        setErro("");

        const [
          feedbacksResponse,
          colaboradoresResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/feedbacks`,
            FETCH_OPTIONS,
          ),

          fetch(
            `${API_URL}/colaboradores`,
            FETCH_OPTIONS,
          ),
        ]);

        if (
          !feedbacksResponse.ok
        ) {
          throw new Error(
            "Erro ao buscar feedbacks.",
          );
        }

        if (
          !colaboradoresResponse.ok
        ) {
          throw new Error(
            "Erro ao buscar colaboradores.",
          );
        }

        const feedbacksApi =
          await feedbacksResponse.json();

        const colaboradoresApi =
          await colaboradoresResponse.json();

        const colaboradoresFormatados:
          Colaborador[] =
          colaboradoresApi.map(
            (
              colaborador: Colaborador,
            ) => ({
              id:
                colaborador.id,

              nome:
                colaborador.nome,

              cargo:
                colaborador.cargo,

              departamento:
                colaborador.departamento,
            }),
          );

        const feedbacksFormatados:
          Feedback[] =
          feedbacksApi.map(
            (feedback: {
              id: number;

              titulo: string;

              conteudo: string;

              tipo:
                TipoFeedbackBackend;

              data?:
                | string
                | null;

              createdAt?:
                | string
                | null;

              colaboradorId: number;

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
            }) => ({
              id:
                feedback.id,

              colaboradorId:
                feedback.colaboradorId,

              colaborador:
                feedback
                  .colaborador
                  ?.nome ??
                colaboradoresFormatados.find(
                  (
                    colaborador,
                  ) =>
                    colaborador.id ===
                    feedback.colaboradorId,
                )?.nome ??
                "Colaborador não encontrado",

              autor:
                feedback.autor?.nome ??
                "Não informado",

              titulo:
                feedback.titulo,

              tipo:
                tipoFromBackend(
                  feedback.tipo,
                ),

              data:
                formatarData(
                  feedback.data ??
                    feedback.createdAt,
                ),

              mensagem:
                feedback.conteudo,
            }),
          );

        setColaboradores(
          colaboradoresFormatados,
        );

        setFeedbacks(
          feedbacksFormatados,
        );
      } catch (error) {
        console.error(
          error,
        );

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

  const feedbacksFiltrados =
    useMemo(() => {
      return feedbacks.filter(
        (feedback) => {
          const correspondeTipo =
            filtroTipo ===
              "Todos" ||
            feedback.tipo ===
              filtroTipo;

          const correspondeColaborador =
            filtroColaborador ===
              "Todos" ||
            String(
              feedback.colaboradorId,
            ) ===
              filtroColaborador;

          return (
            correspondeTipo &&
            correspondeColaborador
          );
        },
      );
    }, [
      feedbacks,
      filtroTipo,
      filtroColaborador,
    ]);

  const totalPositivos =
    feedbacks.filter(
      (feedback) =>
        feedback.tipo ===
        "Positivo",
    ).length;

  const totalDesenvolvimento =
    feedbacks.filter(
      (feedback) =>
        feedback.tipo ===
        "Desenvolvimento",
    ).length;

  const totalReconhecimento =
    feedbacks.filter(
      (feedback) =>
        feedback.tipo ===
        "Reconhecimento",
    ).length;

  const abrirModal = () => {
    setErro("");

    setNovoFeedback({
      colaboradorId: "",
      autorId: "",
      titulo: "",
      tipo: "Positivo",
      mensagem: "",
    });

    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);

    setNovoFeedback({
      colaboradorId: "",
      autorId: "",
      titulo: "",
      tipo: "Positivo",
      mensagem: "",
    });
  };

  const cadastrarFeedback =
    async () => {
      if (
        !novoFeedback.colaboradorId
      ) {
        setErro(
          "Selecione um colaborador.",
        );

        return;
      }

      if (
        !novoFeedback.titulo.trim()
      ) {
        setErro(
          "Digite um título para o feedback.",
        );

        return;
      }

      if (
        !novoFeedback.mensagem.trim()
      ) {
        setErro(
          "Digite uma mensagem para o feedback.",
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

              body:
                JSON.stringify({
                  titulo:
                    novoFeedback.titulo.trim(),

                  conteudo:
                    novoFeedback.mensagem.trim(),

                  tipo:
                    tipoToBackend[
                      novoFeedback.tipo
                    ],

                  colaboradorId:
                    Number(
                      novoFeedback.colaboradorId,
                    ),

                  autorId:
                    novoFeedback.autorId
                      ? Number(
                          novoFeedback.autorId,
                        )
                      : null,
                }),
            },
          );

        if (
          !response.ok
        ) {
          const resultado =
            await response
              .json()
              .catch(
                () => null,
              );

          throw new Error(
            resultado?.mensagem ??
              "Não foi possível cadastrar o feedback.",
          );
        }

        await carregarDados();

        setNovoFeedback({
          colaboradorId: "",
          autorId: "",
          titulo: "",
          tipo: "Positivo",
          mensagem: "",
        });

        setModalAberto(
          false,
        );
      } catch (error) {
        console.error(
          error,
        );

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao cadastrar feedback.",
        );
      } finally {
        setSalvando(false);
      }
    };

  const excluirFeedback =
    async (
      id: number,
    ) => {
      const confirmar =
        window.confirm(
          "Tem certeza que deseja excluir este feedback?",
        );

      if (!confirmar) {
        return;
      }

      try {
        setErro("");

        const response =
          await fetch(
            `${API_URL}/feedbacks/${id}`,
            {
              method:
                "DELETE",
            },
          );

        if (
          !response.ok
        ) {
          const resultado =
            await response
              .json()
              .catch(
                () => null,
              );

          throw new Error(
            resultado?.mensagem ??
              "Não foi possível excluir o feedback.",
          );
        }

        setFeedbacks(
          (
            feedbacksAtuais,
          ) =>
            feedbacksAtuais.filter(
              (
                feedback,
              ) =>
                feedback.id !==
                id,
            ),
        );
      } catch (error) {
        console.error(
          error,
        );

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao excluir feedback.",
        );
      }
    };

  const limparFiltros =
    () => {
      setFiltroTipo(
        "Todos",
      );

      setFiltroColaborador(
        "Todos",
      );
    };

  const getTipoClasses =
    (
      tipo: TipoFeedback,
    ) => {
      switch (tipo) {
        case "Positivo":
          return "bg-emerald-50 text-emerald-700";

        case "Desenvolvimento":
          return "bg-amber-50 text-amber-700";

        case "Reconhecimento":
          return "bg-blue-50 text-blue-700";

        case "Outro":
        default:
          return "bg-slate-100 text-slate-700";
      }
    };

  const getTipoIcone =
    (
      tipo: TipoFeedback,
    ) => {
      switch (tipo) {
        case "Positivo":
          return "👍";

        case "Desenvolvimento":
          return "💡";

        case "Reconhecimento":
          return "🏆";

        case "Outro":
        default:
          return "💬";
      }
    };

  return (
    <section className="min-w-0 space-y-5 overflow-x-hidden pb-4 sm:space-y-6 sm:pb-0">

      {/* CABEÇALHO */}

      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <h2 className="text-[28px] font-bold leading-tight text-slate-800 sm:text-3xl">
            Feedbacks
          </h2>

          <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-sm">
            Registre, acompanhe e consulte os
            feedbacks relacionados ao desenvolvimento
            dos colaboradores.
          </p>

        </div>

        <button
          type="button"
          onClick={
            abrirModal
          }
          className="min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
        >
          + Novo feedback
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

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">

          <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
            Total de feedbacks
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            {carregando
              ? "—"
              : feedbacks.length}
          </p>

        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">

          <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
            Feedbacks positivos
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600 sm:text-3xl">
            {carregando
              ? "—"
              : totalPositivos}
          </p>

        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">

          <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
            Desenvolvimento
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-600 sm:text-3xl">
            {carregando
              ? "—"
              : totalDesenvolvimento}
          </p>

        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">

          <p className="text-[11px] font-semibold leading-4 text-slate-500 sm:text-sm sm:font-medium">
            Reconhecimentos
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600 sm:text-3xl">
            {carregando
              ? "—"
              : totalReconhecimento}
          </p>

        </div>

      </div>

      {/* FILTROS */}

      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-5">

        <div className="mb-4 flex min-w-0 items-start justify-between gap-3 sm:items-center">

          <div>

            <h3 className="font-semibold text-slate-800">
              Filtros
            </h3>

            <p className="text-sm text-slate-500">
              Refine os feedbacks exibidos.
            </p>

          </div>

          {(filtroTipo !==
            "Todos" ||
            filtroColaborador !==
              "Todos") && (
            <button
              type="button"
              onClick={
                limparFiltros
              }
              className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-800 sm:text-sm"
            >
              Limpar filtros
            </button>
          )}

        </div>

        <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2">

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Colaborador
            </label>

            <select
              value={
                filtroColaborador
              }
              onChange={(
                event,
              ) =>
                setFiltroColaborador(
                  event.target.value,
                )
              }
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
            >
              <option value="Todos">
                Todos os colaboradores
              </option>

              {colaboradores.map(
                (
                  colaborador,
                ) => (
                  <option
                    key={
                      colaborador.id
                    }
                    value={
                      String(
                        colaborador.id,
                      )
                    }
                  >
                    {
                      colaborador.nome
                    }{" "}
                    —{" "}
                    {
                      colaborador.cargo
                    }
                  </option>
                ),
              )}

            </select>

          </div>

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tipo de feedback
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
                    | TipoFeedback,
                )
              }
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
            >
              <option value="Todos">
                Todos os tipos
              </option>

              <option value="Positivo">
                Positivo
              </option>

              <option value="Desenvolvimento">
                Desenvolvimento
              </option>

              <option value="Reconhecimento">
                Reconhecimento
              </option>

              <option value="Outro">
                Outro
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
              Carregando feedbacks...
            </p>

          </div>

        ) : feedbacksFiltrados.length ===
          0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">

            <div className="mb-3 text-4xl">
              💬
            </div>

            <h3 className="break-words font-bold leading-5 text-slate-800">
              Nenhum feedback encontrado
            </h3>

            <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-sm">
              Tente alterar os filtros ou
              registre um novo feedback.
            </p>

          </div>

        ) : (

          feedbacksFiltrados.map(
            (
              feedback,
            ) => (

              <div
                key={
                  feedback.id
                }
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
              >

                <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between">

                  <div className="flex min-w-0 gap-3 sm:gap-4">

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base sm:h-12 sm:w-12 sm:text-lg ${getTipoClasses(
                        feedback.tipo,
                      )}`}
                    >
                      {getTipoIcone(
                        feedback.tipo,
                      )}
                    </div>

                    <div>

                      <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">

                        <h3 className="break-words font-bold leading-5 text-slate-800">
                          {
                            feedback.colaborador
                          }
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getTipoClasses(
                            feedback.tipo,
                          )}`}
                        >
                          {
                            feedback.tipo
                          }
                        </span>

                      </div>

                      <p className="mt-1 break-words text-sm font-semibold leading-5 text-slate-700">
                        {
                          feedback.titulo
                        }
                      </p>

                      <p className="mt-1 break-words text-[11px] leading-4 text-slate-400 sm:text-xs">
                        Registrado por{" "}
                        <span className="font-semibold">
                          {
                            feedback.autor
                          }
                        </span>
                      </p>

                    </div>

                  </div>

                  <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">

                    <span className="text-xs text-slate-400">
                      {
                        feedback.data
                      }
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        excluirFeedback(
                          feedback.id,
                        )
                      }
                      className="min-h-10 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Excluir
                    </button>

                  </div>

                </div>

                <div className="mt-4 min-w-0 rounded-xl bg-slate-50 p-3.5 sm:mt-5 sm:p-4">

                  <p className="break-words text-sm leading-6 text-slate-600">
                    {
                      feedback.mensagem
                    }
                  </p>

                </div>

              </div>

            ),
          )

        )}

      </div>

      {/* MODAL NOVO FEEDBACK */}

      {modalAberto && (

        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">

          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">

            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:items-center sm:px-6 sm:py-5">

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Registrar novo feedback
                </h2>

                <p className="mt-1 text-[13px] leading-5 text-slate-500 sm:text-sm">
                  Registre uma observação sobre
                  o desenvolvimento do colaborador.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  fecharModal
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">

              {/* COLABORADOR */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Colaborador *
                </label>

                <select
                  value={
                    novoFeedback.colaboradorId
                  }
                  onChange={(
                    event,
                  ) =>
                    setNovoFeedback(
                      (
                        atual: NovoFeedback,
                      ) => ({
                        ...atual,

                        colaboradorId:
                          event.target.value,
                      }),
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                >

                  <option value="">
                    Selecione um colaborador
                  </option>

                  {colaboradores.map(
                    (
                      colaborador,
                    ) => (

                      <option
                        key={
                          colaborador.id
                        }
                        value={
                          String(
                            colaborador.id,
                          )
                        }
                      >
                        {
                          colaborador.nome
                        }{" "}
                        —{" "}
                        {
                          colaborador.cargo
                        }
                      </option>

                    ),
                  )}

                </select>

              </div>

              {/* AUTOR */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Registrado por
                </label>

                <select
                  value={
                    novoFeedback.autorId
                  }
                  onChange={(
                    event,
                  ) =>
                    setNovoFeedback(
                      (
                        atual: NovoFeedback,
                      ) => ({
                        ...atual,

                        autorId:
                          event.target.value,
                      }),
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                >

                  <option value="">
                    Não informar autor
                  </option>

                  {colaboradores.map(
                    (
                      colaborador,
                    ) => (

                      <option
                        key={
                          colaborador.id
                        }
                        value={
                          String(
                            colaborador.id,
                          )
                        }
                      >
                        {
                          colaborador.nome
                        }{" "}
                        —{" "}
                        {
                          colaborador.cargo
                        }
                      </option>

                    ),
                  )}

                </select>

              </div>

              {/* TÍTULO */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Título *
                </label>

                <input
                  type="text"
                  value={
                    novoFeedback.titulo
                  }
                  onChange={(
                    event,
                  ) =>
                    setNovoFeedback(
                      (
                        atual: NovoFeedback,
                      ) => ({
                        ...atual,

                        titulo:
                          event.target.value,
                      }),
                    )
                  }
                  placeholder="Ex.: Excelente evolução no projeto"
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                />

              </div>

              {/* TIPO */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tipo de feedback *
                </label>

                <select
                  value={
                    novoFeedback.tipo
                  }
                  onChange={(
                    event,
                  ) =>
                    setNovoFeedback(
                      (
                        atual: NovoFeedback,
                      ) => ({
                        ...atual,

                        tipo:
                          event.target
                            .value as TipoFeedback,
                      }),
                    )
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                >

                  <option value="Positivo">
                    Positivo
                  </option>

                  <option value="Desenvolvimento">
                    Desenvolvimento
                  </option>

                  <option value="Reconhecimento">
                    Reconhecimento
                  </option>

                  <option value="Outro">
                    Outro
                  </option>

                </select>

              </div>

              {/* CONTEÚDO */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Feedback *
                </label>

                <textarea
                  value={
                    novoFeedback.mensagem
                  }
                  onChange={(
                    event,
                  ) =>
                    setNovoFeedback(
                      (
                        atual: NovoFeedback,
                      ) => ({
                        ...atual,

                        mensagem:
                          event.target.value,
                      }),
                    )
                  }
                  rows={6}
                  placeholder="Digite o feedback..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-sm"
                />

              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end sm:gap-3 sm:pt-5">

                <button
                  type="button"
                  onClick={
                    fecharModal
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={
                    cadastrarFeedback
                  }
                  disabled={
                    salvando
                  }
                  className="min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {salvando
                    ? "Salvando..."
                    : "Salvar feedback"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}