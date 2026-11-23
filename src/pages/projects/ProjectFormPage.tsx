import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Glyph } from "@/components/ui/Glyph";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { usePageMeta } from "@/contexts/PageMetaContext";
import { useCreateProject, useProject, useUpdateProject } from "@/hooks/queries";
import { getErrorMessage } from "@/services/api";
import { PROJECT_LIMITS, projectSchema, type ProjectValues } from "@/schemas/project.schema";

// Campos vazios viram undefined: na edição, o backend ignora nulos, então limpamos com "" explicitamente.
const toBody = (values: ProjectValues, editing: boolean) => ({
  name: values.name.trim(),
  description: values.description.trim() || (editing ? "" : undefined),
  objective: values.objective.trim() || (editing ? "" : undefined),
});

export function ProjectFormPage() {
  const { projectId } = useParams();
  const editing = !!projectId;
  usePageMeta(editing ? "PROJETOS / EDITAR" : "PROJETOS / NOVO", editing ? "Editar projeto" : "Criar projeto");
  const project = useProject(projectId);

  if (editing && project.isPending) return <LoadingState />;
  if (editing && project.isError) {
    return (
      <div className="product-page narrow-page">
        <ErrorState error={project.error} notFoundTitle="Projeto não encontrado" onRetry={() => project.refetch()} />
      </div>
    );
  }
  return (
    <ProjectForm
      projectId={projectId}
      initial={
        project.data
          ? { name: project.data.name, description: project.data.description ?? "", objective: project.data.objective ?? "" }
          : undefined
      }
    />
  );
}

function ProjectForm({ projectId, initial }: { projectId?: string; initial?: ProjectValues }) {
  const navigate = useNavigate();
  const editing = !!projectId;
  const create = useCreateProject();
  const update = useUpdateProject(projectId ?? "");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: initial ?? { name: "", description: "", objective: "" },
  });

  useEffect(() => {
    if (initial) reset(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.name, initial?.description, initial?.objective]);

  const [name = "", description = "", objective = ""] = watch(["name", "description", "objective"]);
  const back = editing ? `/app/projects/${projectId}` : "/app/projects";

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    try {
      const saved = editing ? await update.mutateAsync(toBody(values, true)) : await create.mutateAsync(toBody(values, false));
      toast.success(editing ? "Projeto atualizado." : "Projeto criado.");
      navigate(`/app/projects/${saved.id}`, { replace: !editing });
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  return (
    <div className="product-page narrow-page">
      <button className="back-link" onClick={() => navigate(back)}>
        <span>←</span> {editing ? "Voltar ao projeto" : "Voltar para projetos"}
      </button>
      <div className="form-page-heading">
        <span className="step-badge">{editing ? <Glyph name="edit" /> : "01"}</span>
        <div>
          <h2>Sobre o projeto</h2>
          <p>Defina o contexto da decisão que você deseja explorar.</p>
        </div>
      </div>
      <form className="surface-panel product-form" onSubmit={onSubmit} noValidate>
        <label>
          <span>
            Nome do projeto <b>*</b>
          </span>
          <small>Use um nome claro e fácil de reconhecer.</small>
          <input
            {...register("name")}
            maxLength={PROJECT_LIMITS.name}
            placeholder="Ex.: Expansão da unidade — Pinheiros"
            aria-invalid={!!errors.name}
            autoFocus={!editing}
          />
          <em>
            {name.length}/{PROJECT_LIMITS.name}
          </em>
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </label>
        <label>
          <span>Descrição</span>
          <small>Contextualize brevemente a análise.</small>
          <textarea
            {...register("description")}
            maxLength={PROJECT_LIMITS.description}
            placeholder="Descreva o projeto, seu contexto e principais premissas..."
          />
          <em>
            {description.length}/{PROJECT_LIMITS.description}
          </em>
          {errors.description && <span className="field-error">{errors.description.message}</span>}
        </label>
        <label>
          <span>Objetivo da simulação</span>
          <small>O que você precisa decidir com esta análise?</small>
          <textarea
            {...register("objective")}
            maxLength={PROJECT_LIMITS.objective}
            placeholder="Ex.: Entender se a expansão se paga em até 18 meses."
          />
          <em>
            {objective.length}/{PROJECT_LIMITS.objective}
          </em>
          {errors.objective && <span className="field-error">{errors.objective.message}</span>}
        </label>
        {!editing && (
          <div className="form-tip">
            <Glyph name="spark" />
            <div>
              <strong>Uma boa pergunta gera cenários melhores.</strong>
              <p>Seja específico sobre a decisão e o resultado esperado. Você poderá ajustar estas informações depois.</p>
            </div>
          </div>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="form-actions">
          <button type="button" className="product-secondary" onClick={() => navigate(back)}>
            Cancelar
          </button>
          <button className="product-primary" disabled={isSubmitting || (editing && !isDirty)}>
            {isSubmitting ? (
              <>
                <span className="spinner" /> Salvando
              </>
            ) : (
              <>
                {editing ? "Salvar alterações" : "Criar projeto"} <Glyph name="arrow" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
