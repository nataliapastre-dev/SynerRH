import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Layout from "../layout/Layout";

import Dashboard from "../pages/Dashboard";
import Colaboradores from "../pages/Colaboradores";
import PerfilColaborador from "../pages/PerfilColaborador";
import Avaliacoes from "../pages/Avaliacoes";
import PDI from "../pages/PDI";
import Feedbacks from "../pages/Feedbacks";
import Cronograma from "../pages/Cronograma";
import PeopleInsights from "../pages/PeopleInsights";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout principal do SynerRH */}
        <Route
          path="/"
          element={<Layout />}
        >
          {/* Dashboard */}
          <Route
            index
            element={<Dashboard />}
          />

          {/* Colaboradores */}
          <Route
            path="colaboradores"
            element={<Colaboradores />}
          />

          {/* Perfil individual do colaborador */}
          <Route
            path="colaboradores/:id"
            element={<PerfilColaborador />}
          />

          {/* Avaliações de desempenho */}
          <Route
            path="avaliacoes"
            element={<Avaliacoes />}
          />

          {/* Planos de Desenvolvimento Individual */}
          <Route
            path="pdi"
            element={<PDI />}
          />

          {/* Feedbacks */}
          <Route
            path="feedbacks"
            element={<Feedbacks />}
          />

          {/* Cronograma */}
          <Route
            path="cronograma"
            element={<Cronograma />}
          />

          {/* People Insights */}
          <Route
            path="people-insights"
            element={<PeopleInsights />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}