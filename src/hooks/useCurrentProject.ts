import { useEffect } from "react";
import { matchPath, useLocation } from "react-router";
import { useProjects } from "./queries";

const LAST_PROJECT_KEY = "scenara.lastProject";

function readLast() {
  try {
    return localStorage.getItem(LAST_PROJECT_KEY);
  } catch {
    return null;
  }
}

function writeLast(id: string) {
  try {
    localStorage.setItem(LAST_PROJECT_KEY, id);
  } catch {
    /* preferência opcional */
  }
}

/**
 * Projeto e cenário em foco, para os atalhos da barra lateral.
 * Usa o que está na URL; fora de um projeto, cai no último visitado (se ainda existir)
 * ou no projeto atualizado mais recentemente.
 */
export function useCurrentProject() {
  const { pathname } = useLocation();
  const projects = useProjects();

  const projectMatch = matchPath("/app/projects/:projectId/*", pathname);
  const scenarioMatch = matchPath("/app/projects/:projectId/scenarios/:scenarioId/*", pathname);
  const fromUrl = projectMatch?.params.projectId;
  const urlProjectId = fromUrl && fromUrl !== "new" ? fromUrl : undefined;
  const scenarioId =
    scenarioMatch?.params.scenarioId && scenarioMatch.params.scenarioId !== "new"
      ? scenarioMatch.params.scenarioId
      : undefined;

  useEffect(() => {
    if (urlProjectId) writeLast(urlProjectId);
  }, [urlProjectId]);

  const list = projects.data ?? [];
  const last = readLast();
  const fallback =
    list.find((p) => p.id === last)?.id ??
    [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.id;

  return { projectId: urlProjectId ?? fallback, scenarioId, projectCount: projects.data?.length };
}
