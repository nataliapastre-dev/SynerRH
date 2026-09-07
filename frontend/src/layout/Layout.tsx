import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [menuAberto, setMenuAberto] = useState(false);

  const abrirMenu = () => {
    setMenuAberto(true);
  };

  const fecharMenu = () => {
    setMenuAberto(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header onAbrirMenu={abrirMenu} />

      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar
          aberto={menuAberto}
          onFechar={fecharMenu}
        />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}