import { api } from "./api";
import type { Simulation, SimulationSummary } from "@/types/api";

export const simulationService = {
  /** Executa uma nova simulação com as premissas atuais do cenário. */
  async run(projectId: string, scenarioId: string) {
    const { data } = await api.post<Simulation>(`/projects/${projectId}/scenarios/${scenarioId}/simulations`);
    return data;
  },
  /** Histórico do cenário, mais recente primeiro. */
  async listByScenario(projectId: string, scenarioId: string) {
    const { data } = await api.get<SimulationSummary[]>(
      `/projects/${projectId}/scenarios/${scenarioId}/simulations`,
    );
    return data;
  },
  /** Todas as simulações do projeto, mais recente primeiro. */
  async listByProject(projectId: string) {
    const { data } = await api.get<SimulationSummary[]>(`/projects/${projectId}/simulations`);
    return data;
  },
  async get(projectId: string, id: string) {
    const { data } = await api.get<Simulation>(`/projects/${projectId}/simulations/${id}`);
    return data;
  },
};
