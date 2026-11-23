import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "@/contexts/AuthContext";
import { routes } from "@/routes/router";
import { setAuthToken } from "@/services/api";
import type { MonthlyProjection, Project, Scenario, Simulation, SimulationSummary, User } from "@/types/api";
import { EMPTY_ASSUMPTIONS } from "@/utils/assumptions";

/* ---------- Dados de exemplo no formato da API ---------- */

const now = new Date().toISOString();
const user: User = { id: "u1", name: "Marina Costa", email: "marina@acme.co", role: "USER", createdAt: now, updatedAt: now };
const project: Project = {
  id: "p1",
  name: "Expansão da unidade",
  description: "Abertura de uma segunda unidade.",
  objective: "Validar o prazo de retorno.",
  status: "ACTIVE",
  createdAt: now,
  updatedAt: now,
};
const assumptions = {
  ...EMPTY_ASSUMPTIONS,
  initialProductRevenue: 91200,
  productRevenueGrowth: 0.032,
  initialFixedCost: 57800,
  initialInvestment: 450000,
  projectionMonths: 3,
};
const scenarios: Scenario[] = [
  { id: "s1", projectId: "p1", name: "Cenário base", description: null, version: 2, assumptions, createdAt: now, updatedAt: now },
  { id: "s2", projectId: "p1", name: "Otimista", description: null, version: 1, assumptions, createdAt: now, updatedAt: now },
];
const results = {
  totalRevenue: 282_000,
  totalCosts: 173_400,
  ebitda: 108_600,
  ebitdaMargin: 0.385,
  ebit: 108_600,
  totalIncomeTax: 0,
  netIncome: 108_600,
  totalCapex: 0,
  totalFreeCashFlow: 108_600,
  initialInvestment: 450_000,
  finalAccumulatedCashFlow: -341_400,
  paybackMonth: null,
};
const month = (m: number): MonthlyProjection => ({
  month: m,
  productRevenue: 91200,
  serviceRevenue: 0,
  otherRevenue: 0,
  totalRevenue: 91200,
  variableCost: 0,
  fixedCost: 57800,
  operatingCosts: 57800,
  ebitda: 33400,
  ebitdaMargin: 0.366,
  depreciation: 0,
  amortization: 0,
  ebit: 33400,
  interestExpense: 0,
  taxableIncome: 33400,
  incomeTax: 0,
  netIncome: 33400,
  accountsReceivable: 0,
  inventory: 0,
  accountsPayable: 0,
  workingCapital: 0,
  changeInWorkingCapital: 0,
  capex: 0,
  freeCashFlow: 33400,
  accumulatedCashFlow: -450000 + 33400 * m,
});
const summaries: SimulationSummary[] = scenarios.map((s, i) => ({
  id: `sim${i + 1}`,
  scenarioId: s.id,
  projectId: "p1",
  scenarioName: s.name,
  scenarioVersion: s.version,
  results,
  executedAt: now,
}));
const fullSimulation = (id: string): Simulation => {
  const summary = summaries.find((s) => s.id === id)!;
  return {
    id,
    scenarioId: summary.scenarioId,
    projectId: "p1",
    userId: "u1",
    scenarioSnapshot: { name: summary.scenarioName, version: summary.scenarioVersion, assumptions },
    results,
    monthlyProjections: [1, 2, 3].map(month),
    executedAt: now,
  };
};

/* ---------- Serviços simulados ---------- */

vi.mock("@/services/user.service", () => ({
  userService: { me: vi.fn(async () => user), update: vi.fn(), remove: vi.fn() },
}));
vi.mock("@/services/project.service", () => ({
  projectService: { list: vi.fn(async () => [project]), get: vi.fn(async () => project), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));
vi.mock("@/services/scenario.service", () => ({
  scenarioService: {
    list: vi.fn(async () => scenarios),
    get: vi.fn(async (_p: string, id: string) => scenarios.find((s) => s.id === id)),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));
vi.mock("@/services/simulation.service", () => ({
  simulationService: {
    run: vi.fn(),
    listByProject: vi.fn(async () => summaries),
    listByScenario: vi.fn(async (_p: string, sid: string) => summaries.filter((s) => s.scenarioId === sid)),
    get: vi.fn(async (_p: string, id: string) => fullSimulation(id)),
  },
}));

beforeAll(() => {
  // jsdom não implementa ResizeObserver nem scroll, usados pelos gráficos e pelo layout.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  window.scrollTo = () => {};
});

beforeEach(() => setAuthToken("token-de-teste"));

function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("app smoke test (API simulada)", () => {
  it.each([
    ["/app/dashboard", "Quais possibilidades vamos explorar hoje?"],
    ["/app/projects", "Todos os projetos"],
    ["/app/projects/new", "Sobre o projeto"],
    ["/app/projects/p1", "Explore diferentes possibilidades"],
    ["/app/projects/p1?tab=history", "Simulações do projeto"],
    ["/app/projects/p1/edit", "Salvar alterações"],
    ["/app/projects/p1/scenarios/new", "Configure o cenário"],
    ["/app/projects/p1/scenarios/s1", "Configuração financeira"],
    ["/app/projects/p1/scenarios/s1/edit", "Alterar as premissas registra a versão 3", true],
    ["/app/projects/p1/scenarios/s1/simulations", "Receita versus custos"],
    ["/app/projects/p1/scenarios/s1/simulations/sim1", "PAYBACK SIMPLES"],
    ["/app/projects/p1/compare", "Comparação consolidada"],
    ["/app/settings", "Seus dados"],
    ["/app/rota-inexistente", "Página não encontrada"],
  ] as [string, string, boolean?][])("renderiza %s", async (path, text, partial) => {
    renderRoute(path);
    const match = partial ? (content: string) => content.includes(text) : text;
    expect(await screen.findByText(match, {}, { timeout: 4000 })).toBeInTheDocument();
  });

  it("mostra o nome do usuário na barra lateral", async () => {
    renderRoute("/app/dashboard");
    expect(await screen.findByText("Marina Costa")).toBeInTheDocument();
  });

  it("assistente de cenário: valida cada etapa antes de avançar", async () => {
    const userEvt = userEvent.setup();
    renderRoute("/app/projects/p1/scenarios/new");
    expect(await screen.findByText("Etapa 1 de 7 · Identificação")).toBeInTheDocument();
    // Não dá para pular para etapas ainda não validadas.
    expect(screen.getByRole("button", { name: /Revisão/ })).toBeDisabled();

    await userEvt.click(screen.getByRole("button", { name: /Próximo/ }));
    expect(await screen.findByText("Dê um nome ao cenário.")).toBeInTheDocument();
    expect(screen.getByText("Etapa 1 de 7 · Identificação")).toBeInTheDocument();

    await userEvt.type(screen.getByPlaceholderText("Ex.: Cenário base"), "Conservador");
    await userEvt.click(screen.getByRole("button", { name: /Próximo/ }));
    expect(await screen.findByText("Etapa 2 de 7 · Receitas")).toBeInTheDocument();
  });

  it("assistente de cenário: percorre as etapas e cria o cenário com taxas em fração", async () => {
    const userEvt = userEvent.setup();
    const { scenarioService } = await import("@/services/scenario.service");
    vi.mocked(scenarioService.create).mockResolvedValue({ ...scenarios[0], id: "s9", name: "Conservador", version: 1 });
    renderRoute("/app/projects/p1/scenarios/new");

    await userEvt.type(await screen.findByPlaceholderText("Ex.: Cenário base"), "Conservador");
    await userEvt.click(screen.getByRole("button", { name: /Próximo/ }));
    const growth = await screen.findByLabelText(/Crescimento de produtos/);
    await userEvt.clear(growth);
    await userEvt.type(growth, "3.2");
    for (let i = 2; i < 7; i++) await userEvt.click(screen.getByRole("button", { name: /Próximo/ }));

    expect(await screen.findByText("Etapa 7 de 7 · Revisão")).toBeInTheDocument();
    expect(screen.getByText("Cresce 3,2% ao mês")).toBeInTheDocument();
    await userEvt.click(screen.getByRole("button", { name: /Salvar cenário/ }));

    await vi.waitFor(() => expect(scenarioService.create).toHaveBeenCalled());
    const [projectId, body] = vi.mocked(scenarioService.create).mock.calls[0];
    expect(projectId).toBe("p1");
    expect(body.name).toBe("Conservador");
    expect(body.assumptions.productRevenueGrowth).toBe(0.032);
  });

  it("assistente de cenário: na edição todas as etapas ficam acessíveis", async () => {
    const userEvt = userEvent.setup();
    renderRoute("/app/projects/p1/scenarios/s1/edit");
    const review = await screen.findByRole("button", { name: /Revisão/ });
    expect(review).toBeEnabled();
    await userEvt.click(review);
    expect(await screen.findByRole("button", { name: /Salvar alterações/ })).toBeInTheDocument();
    expect(screen.getByText("Cenário base", { selector: ".review-name" })).toBeInTheDocument();
  });

  it("renderiza a landing e o login sem sessão", async () => {
    setAuthToken(null);
    renderRoute("/");
    expect(await screen.findByText(/Decida com inteligência/, { selector: "em" })).toBeInTheDocument();
  });
});
