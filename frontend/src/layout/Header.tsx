type HeaderProps = {
  onAbrirMenu: () => void;
};

export default function Header({
  onAbrirMenu,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-blue-100/80 bg-white/95 px-4 shadow-sm shadow-blue-950/[0.03] backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onAbrirMenu}
          aria-label="Abrir menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-xl text-blue-700 transition hover:bg-blue-100 lg:hidden"
        >
          ☰
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800 sm:text-base">
            Painel de Gestão
          </p>
          <p className="hidden text-xs text-slate-400 sm:block">
            Gestão e desenvolvimento de colaboradores
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-right sm:block">
          <p className="text-xs font-bold text-slate-700">Usuário</p>
          <p className="text-[11px] text-slate-400">Gestor</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 font-bold text-white shadow-md shadow-blue-600/20">
          U
        </div>
      </div>
    </header>
  );
}
