import { api } from "./api";
import type { CreateScenarioRequest, Scenario, UpdateScenarioRequest } from "@/types/api";

const base = (projectId: string) => `/projects/${projectId}/scenarios`;

export const scenarioService = {
  async list(projectId: string) {
    const { data } = await api.get<Scenario[]>(base(projectId));
    return data;
  },
  async get(projectId: string, id: string) {
    const { data } = await api.get<Scenario>(`${base(projectId)}/${id}`);
    return data;
  },
  async create(projectId: string, body: CreateScenarioRequest) {
    const { data } = await api.post<Scenario>(base(projectId), body);
    return data;
  },
  async update(projectId: string, id: string, body: UpdateScenarioRequest) {
    const { data } = await api.patch<Scenario>(`${base(projectId)}/${id}`, body);
    return data;
  },
  async remove(projectId: string, id: string) {
    await api.delete(`${base(projectId)}/${id}`);
  },
};
