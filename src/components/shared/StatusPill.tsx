import type { ProjectStatus } from "@/types/api";

export function StatusPill({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span className={`status-pill ${muted ? "pending" : ""}`}>
      <i /> {label}
    </span>
  );
}

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: "Ativo",
  ARCHIVED: "Arquivado",
};

export function ProjectStatusPill({ status }: { status: ProjectStatus }) {
  return <StatusPill label={PROJECT_STATUS_LABEL[status]} muted={status === "ARCHIVED"} />;
}
