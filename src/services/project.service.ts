import { api } from "./api";
import type { CreateProjectRequest, Project, UpdateProjectRequest } from "@/types/api";

export const projectService = {
  async list() {
    const { data } = await api.get<Project[]>("/projects");
    return data;
  },
  async get(id: string) {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },
  async create(body: CreateProjectRequest) {
    const { data } = await api.post<Project>("/projects", body);
    return data;
  },
  async update(id: string, body: UpdateProjectRequest) {
    const { data } = await api.patch<Project>(`/projects/${id}`, body);
    return data;
  },
  async remove(id: string) {
    await api.delete(`/projects/${id}`);
  },
};
