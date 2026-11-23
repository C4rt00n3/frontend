// Tipos espelhando os DTOs do backend (Spring Boot). Datas chegam como ISO-8601 (Instant).
// Valores monetários e taxas chegam como números; taxas são frações (0.032 = 3,2%).

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export type ProjectStatus = "ACTIVE" | "ARCHIVED";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  objective: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  objective?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  status?: ProjectStatus;
}

export interface ScenarioAssumptions {
  // Receita
  initialProductRevenue: number;
  initialServiceRevenue: number;
  initialOtherRevenue: number;
  productRevenueGrowth: number;
  serviceRevenueGrowth: number;
  otherRevenueGrowth: number;
  // Custos
  variableCostRate: number;
  initialFixedCost: number;
  fixedCostGrowthRate: number;
  // Investimento e ativos
  initialInvestment: number;
  depreciableAssetValue: number;
  usefulLifeMonths: number;
  amortizationPerMonth: number;
  capexRate: number;
  // Financiamento
  interestExpense: number;
  // Impostos
  effectiveTaxRate: number;
  // Capital de giro (dias)
  daysSalesOutstanding: number;
  daysPayableOutstanding: number;
  daysInventoryOutstanding: number;
  // Horizonte
  projectionMonths: number;
}

export interface Scenario {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  version: number;
  assumptions: ScenarioAssumptions;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScenarioRequest {
  name: string;
  description?: string;
  assumptions: ScenarioAssumptions;
}

export type UpdateScenarioRequest = Partial<CreateScenarioRequest>;

export interface SimulationResults {
  totalRevenue: number;
  totalCosts: number;
  ebitda: number;
  ebitdaMargin: number | null;
  ebit: number;
  totalIncomeTax: number;
  netIncome: number;
  totalCapex: number;
  totalFreeCashFlow: number;
  initialInvestment: number;
  finalAccumulatedCashFlow: number;
  paybackMonth: number | null;
}

export interface MonthlyProjection {
  month: number;
  productRevenue: number;
  serviceRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  variableCost: number;
  fixedCost: number;
  operatingCosts: number;
  ebitda: number;
  ebitdaMargin: number | null;
  depreciation: number;
  amortization: number;
  ebit: number;
  interestExpense: number;
  taxableIncome: number;
  incomeTax: number;
  netIncome: number;
  accountsReceivable: number;
  inventory: number;
  accountsPayable: number;
  workingCapital: number;
  changeInWorkingCapital: number;
  capex: number;
  freeCashFlow: number;
  accumulatedCashFlow: number;
}

export interface ScenarioSnapshot {
  name: string;
  version: number;
  assumptions: ScenarioAssumptions;
}

export interface Simulation {
  id: string;
  scenarioId: string;
  projectId: string;
  userId: string;
  scenarioSnapshot: ScenarioSnapshot;
  results: SimulationResults;
  monthlyProjections: MonthlyProjection[];
  executedAt: string;
}

export interface SimulationSummary {
  id: string;
  scenarioId: string;
  projectId: string;
  scenarioName: string;
  scenarioVersion: number;
  results: SimulationResults;
  executedAt: string;
}
