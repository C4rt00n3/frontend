import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { scenarioService } from "@/services/scenario.service";
import { simulationService } from "@/services/simulation.service";
import { userService } from "@/services/user.service";
import type {
  CreateProjectRequest,
  CreateScenarioRequest,
  UpdateProjectRequest,
  UpdateScenarioRequest,
  UpdateUserRequest,
} from "@/types/api";

export const keys = {
  me: ["me"] as const,
  projects: ["projects"] as const,
  project: (id: string) => ["projects", id] as const,
  scenarios: (projectId: string) => ["projects", projectId, "scenarios"] as const,
  scenario: (projectId: string, id: string) => ["projects", projectId, "scenarios", id] as const,
  projectSimulations: (projectId: string) => ["projects", projectId, "simulations"] as const,
  scenarioSimulations: (projectId: string, scenarioId: string) =>
    ["projects", projectId, "simulations", "scenario", scenarioId] as const,
  simulation: (projectId: string, id: string) => ["projects", projectId, "simulations", "detail", id] as const,
};

/* ---------- Usuário ---------- */

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserRequest) => userService.update(body),
    onSuccess: (user) => qc.setQueryData(keys.me, user),
  });
}

/* ---------- Projetos ---------- */

export function useProjects() {
  return useQuery({ queryKey: keys.projects, queryFn: projectService.list });
}

export function useProject(id: string | undefined) {
  return useQuery({ queryKey: keys.project(id ?? ""), queryFn: () => projectService.get(id!), enabled: !!id });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProjectRequest) => projectService.create(body),
    onSuccess: (project) => {
      qc.setQueryData(keys.project(project.id), project);
      qc.invalidateQueries({ queryKey: keys.projects, exact: true });
    },
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProjectRequest) => projectService.update(id, body),
    onSuccess: (project) => {
      qc.setQueryData(keys.project(id), project);
      qc.invalidateQueries({ queryKey: keys.projects, exact: true });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: keys.project(id) });
      qc.invalidateQueries({ queryKey: keys.projects, exact: true });
    },
  });
}

/* ---------- Cenários ---------- */

export function useScenarios(projectId: string | undefined) {
  return useQuery({
    queryKey: keys.scenarios(projectId ?? ""),
    queryFn: () => scenarioService.list(projectId!),
    enabled: !!projectId,
  });
}

export function useScenario(projectId: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: keys.scenario(projectId ?? "", id ?? ""),
    queryFn: () => scenarioService.get(projectId!, id!),
    enabled: !!projectId && !!id,
  });
}

export function useCreateScenario(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateScenarioRequest) => scenarioService.create(projectId, body),
    onSuccess: (scenario) => {
      qc.setQueryData(keys.scenario(projectId, scenario.id), scenario);
      qc.invalidateQueries({ queryKey: keys.scenarios(projectId), exact: true });
    },
  });
}

export function useUpdateScenario(projectId: string, id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateScenarioRequest) => scenarioService.update(projectId, id, body),
    onSuccess: (scenario) => {
      qc.setQueryData(keys.scenario(projectId, id), scenario);
      qc.invalidateQueries({ queryKey: keys.scenarios(projectId), exact: true });
    },
  });
}

export function useDeleteScenario(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scenarioService.remove(projectId, id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: keys.scenario(projectId, id) });
      qc.invalidateQueries({ queryKey: keys.scenarios(projectId), exact: true });
      qc.invalidateQueries({ queryKey: keys.projectSimulations(projectId) });
    },
  });
}

/* ---------- Simulações ---------- */

export function useProjectSimulations(projectId: string | undefined) {
  return useQuery({
    queryKey: keys.projectSimulations(projectId ?? ""),
    queryFn: () => simulationService.listByProject(projectId!),
    enabled: !!projectId,
  });
}

export function useScenarioSimulations(projectId: string | undefined, scenarioId: string | undefined) {
  return useQuery({
    queryKey: keys.scenarioSimulations(projectId ?? "", scenarioId ?? ""),
    queryFn: () => simulationService.listByScenario(projectId!, scenarioId!),
    enabled: !!projectId && !!scenarioId,
  });
}

export function useSimulation(projectId: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: keys.simulation(projectId ?? "", id ?? ""),
    queryFn: () => simulationService.get(projectId!, id!),
    enabled: !!projectId && !!id,
    staleTime: Infinity, // simulações são imutáveis
  });
}

export function useSimulations(projectId: string | undefined, ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: keys.simulation(projectId ?? "", id),
      queryFn: () => simulationService.get(projectId!, id),
      enabled: !!projectId,
      staleTime: Infinity,
    })),
  });
}

export function useRunSimulation(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scenarioId: string) => simulationService.run(projectId, scenarioId),
    onSuccess: (simulation) => {
      qc.setQueryData(keys.simulation(projectId, simulation.id), simulation);
      qc.invalidateQueries({ queryKey: keys.projectSimulations(projectId) });
    },
  });
}

/* ---------- Visão consolidada (dashboard e listagem de projetos) ---------- */

/** Projetos com a contagem de cenários e as simulações de cada um. Faz uma chamada por projeto. */
export function useProjectsOverview() {
  const projects = useProjects();
  const list = projects.data ?? [];
  const scenarios = useQueries({
    queries: list.map((p) => ({ queryKey: keys.scenarios(p.id), queryFn: () => scenarioService.list(p.id) })),
  });
  const simulations = useQueries({
    queries: list.map((p) => ({
      queryKey: keys.projectSimulations(p.id),
      queryFn: () => simulationService.listByProject(p.id),
    })),
  });
  return {
    projects,
    items: list.map((project, i) => ({
      project,
      scenarioCount: scenarios[i]?.data?.length,
      simulations: simulations[i]?.data,
    })),
    detailsLoading: scenarios.some((q) => q.isPending) || simulations.some((q) => q.isPending),
  };
}
