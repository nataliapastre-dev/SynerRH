import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Colaboradores", path: "/colaboradores" },
    { name: "Avaliações", path: "/avaliacoes" },
    { name: "PDI", path: "/pdi" },
    { name: "Feedbacks", path: "/feedbacks" },
    { name: "Cronograma", path: "/cronograma" },
    { name: "People Insights", path: "/people-insights" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white">
        <div className="border-b border-slate-700 p-6">
          <h1 className="text-xl font-bold">
            People Performance
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Gestão de pessoas
          </p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1">
        <header className="border-b bg-white px-8 py-5">
          <p className="text-sm text-slate-500">
            Sistema de Avaliação e Desenvolvimento de Colaboradores
          </p>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}