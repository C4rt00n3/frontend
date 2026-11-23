import { createBrowserRouter, Navigate, type RouteObject } from "react-router";
import { AppLayout } from "@/layouts/AppLayout";
import { GuestRoute, ProtectedRoute } from "./guards";
import { LoadingState } from "@/components/shared/States";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Cada página é carregada sob demanda: a landing e o login não baixam o código dos gráficos.
const page = <M,>(load: () => Promise<M>, pick: (m: M) => React.ComponentType) => ({
  lazy: async () => ({ Component: pick(await load()) }),
  HydrateFallback: () => <LoadingState />,
});

export const routes: RouteObject[] = [
  { path: "/", ...page(() => import("@/pages/landing/LandingPage"), (m) => m.LandingPage) },
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", ...page(() => import("@/pages/auth/AuthPage"), (m) => () => <m.AuthPage mode="login" />) },
      { path: "/register", ...page(() => import("@/pages/auth/AuthPage"), (m) => () => <m.AuthPage mode="register" />) },
    ],
  },
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", ...page(() => import("@/pages/dashboard/DashboardPage"), (m) => m.DashboardPage) },
          { path: "settings", ...page(() => import("@/pages/settings/SettingsPage"), (m) => m.SettingsPage) },
          { path: "projects", ...page(() => import("@/pages/projects/ProjectsPage"), (m) => m.ProjectsPage) },
          { path: "projects/new", ...page(() => import("@/pages/projects/ProjectFormPage"), (m) => m.ProjectFormPage) },
          { path: "projects/:projectId", ...page(() => import("@/pages/projects/ProjectDetailPage"), (m) => m.ProjectDetailPage) },
          { path: "projects/:projectId/edit", ...page(() => import("@/pages/projects/ProjectFormPage"), (m) => m.ProjectFormPage) },
          { path: "projects/:projectId/compare", ...page(() => import("@/pages/comparison/ComparePage"), (m) => m.ComparePage) },
          {
            path: "projects/:projectId/scenarios/new",
            ...page(() => import("@/pages/scenarios/ScenarioFormPage"), (m) => m.ScenarioFormPage),
          },
          {
            path: "projects/:projectId/scenarios/:scenarioId",
            ...page(() => import("@/pages/scenarios/ScenarioDetailPage"), (m) => m.ScenarioDetailPage),
          },
          {
            path: "projects/:projectId/scenarios/:scenarioId/edit",
            ...page(() => import("@/pages/scenarios/ScenarioFormPage"), (m) => m.ScenarioFormPage),
          },
          {
            path: "projects/:projectId/scenarios/:scenarioId/simulations/:simulationId?",
            ...page(() => import("@/pages/simulations/SimulationResultsPage"), (m) => m.SimulationResultsPage),
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);
