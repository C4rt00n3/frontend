import { useNavigate } from "react-router";
import { Glyph } from "@/components/ui/Glyph";
import { ProjectStatusPill } from "./StatusPill";
import type { Project } from "@/types/api";
import { formatRelative } from "@/utils/format";

export function ProjectRow({ project, scenarioCount }: { project: Project; scenarioCount?: number }) {
  const navigate = useNavigate();
  return (
    <button className="project-row" onClick={() => navigate(`/app/projects/${project.id}`)}>
      <span className="project-symbol">
        <Glyph name="folder" />
      </span>
      <span className="project-copy">
        <strong>{project.name}</strong>
        <small>{project.description || project.objective || "Sem descrição"}</small>
      </span>
      <span className="scenario-count">
        {scenarioCount ?? "–"}
        <small>{scenarioCount === 1 ? "cenário" : "cenários"}</small>
      </span>
      <ProjectStatusPill status={project.status} />
      <span className="updated">{formatRelative(project.updatedAt)}</span>
      <Glyph name="chevron" size={16} />
    </button>
  );
}
