import { NavLink } from "react-router-dom";
import synerhLogo from "../assets/synerh-logo.png";

type SidebarProps = {
  aberto: boolean;
  onFechar: () => void;
};

export default function Sidebar({
  aberto,
  onFechar,
}: SidebarProps) {
  const menuItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: "⌂",
    },
    {
      label: "Cronograma",
      path: "/cronograma",
      icon: "▣",
    },
    {
      label: "Avaliações",
      path: "/avaliacoes",
      icon: "✓",
    },
    {
      label: "PDI",
      path: "/pdi",
      icon: "◎",
    },
    {
      label: "Feedbacks",
      path: "/feedbacks",
      icon: "◌",
    },
    {
      label: "Colaboradores",
      path: "/colaboradores",
      icon: "◉",
    },
    {
      label: "People Insights",
      path: "/people-insights",
      icon: "✦",
    },
  ];

  return (
    <>
      {aberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onFechar}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-72
          overflow-y-auto border-r border-blue-100 bg-white p-4
          shadow-2xl shadow-blue-950/10 transition-transform duration-300
          lg:static lg:z-auto lg:block lg:min-h-[calc(100vh-4rem)] lg:w-64
          lg:translate-x-0 lg:shadow-none
          ${aberto ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="mb-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-violet-50/60 p-3 shadow-sm">
          <img
            src={synerhLogo}
            alt="SynerRH — Gestão e desenvolvimento de colaboradores"
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="mb-3 flex items-center justify-between px-2 lg:hidden">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Navegação
          </p>

          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-500 shadow-sm transition hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onFechar}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base font-bold transition ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600"
                    }`}
                  >
                    {item.icon}
                  </span>

                  <span className="truncate">
                    {item.label}
                  </span>

                  {isActive && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(255,255,255,0.10)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-blue-50 to-violet-50 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
            ✦
          </div>

          <p className="mt-3 text-sm font-bold text-slate-800">
            Pessoas no centro de tudo
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Desenvolvimento, desempenho e decisões de RH em um só lugar.
          </p>
        </div>
      </aside>
    </>
  );
}