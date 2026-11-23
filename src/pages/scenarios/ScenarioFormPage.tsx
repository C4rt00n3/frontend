import { useRef, useState, type CSSProperties } from "react";
import { useForm, type FieldErrors, type FieldPath, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { Glyph } from "@/components/ui/Glyph";
import { ErrorState, LoadingState } from "@/components/shared/States";
import { usePageMeta } from "@/contexts/PageMetaContext";
import { useCreateScenario, useProject, useScenario, useUpdateScenario } from "@/hooks/queries";
import { getErrorMessage } from "@/services/api";
import { MAX_PROJECTION_MONTHS, scenarioSchema, type ScenarioValues } from "@/schemas/scenario.schema";
import type { Scenario } from "@/types/api";
import { EMPTY_ASSUMPTIONS, toApiAssumptions, toFormAssumptions } from "@/utils/assumptions";
import { describeAssumptions, type AssumptionGroupId } from "@/utils/describeAssumptions";
import { formatMonths } from "@/utils/format";

type Field = FieldPath<ScenarioValues>;
const A = (name: keyof ScenarioValues["assumptions"]) => `assumptions.${name}` as const;

/** Etapas do assistente. `fields` define o que é validado antes de avançar. */
const STEPS: { id: string; title: string; text: string; fields: Field[]; group?: AssumptionGroupId }[] = [
  { id: "identificacao", title: "Identificação", text: "Dê um nome que diferencie esta hipótese.", fields: ["name", "description"] },
  {
    id: "receitas",
    title: "Receitas",
    text: "Valores do primeiro mês e crescimento mensal composto a partir do segundo.",
    group: "revenue",
    fields: [
      A("initialProductRevenue"),
      A("productRevenueGrowth"),
      A("initialServiceRevenue"),
      A("serviceRevenueGrowth"),
      A("initialOtherRevenue"),
      A("otherRevenueGrowth"),
    ],
  },
  {
    id: "custos",
    title: "Custos",
    text: "Custos variáveis acompanham a receita; custos fixos crescem à própria taxa.",
    group: "costs",
    fields: [A("variableCostRate"), A("initialFixedCost"), A("fixedCostGrowthRate")],
  },
  {
    id: "investimento",
    title: "Investimento",
    text: "Saída inicial de caixa, depreciação, amortização e reinvestimento.",
    group: "investment",
    fields: [A("initialInvestment"), A("capexRate"), A("depreciableAssetValue"), A("usefulLifeMonths"), A("amortizationPerMonth")],
  },
  {
    id: "financeiro",
    title: "Impostos e giro",
    text: "Despesa financeira, alíquota sobre o lucro e prazos médios de capital de giro.",
    group: "finance",
    fields: [
      A("interestExpense"),
      A("effectiveTaxRate"),
      A("daysSalesOutstanding"),
      A("daysPayableOutstanding"),
      A("daysInventoryOutstanding"),
    ],
  },
  { id: "horizonte", title: "Horizonte", text: "Escolha quantos meses serão calculados.", group: "horizon", fields: [A("projectionMonths")] },
  { id: "revisao", title: "Revisão", text: "Confira as premissas antes de salvar.", fields: [] },
];

const LAST = STEPS.length - 1;

/** Primeira etapa que contém um erro (para levar o usuário até ele ao salvar). */
function stepWithError(errors: FieldErrors<ScenarioValues>) {
  const failed = (path: Field) =>
    path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], errors) != null;
  const index = STEPS.findIndex((s) => s.fields.some(failed));
  return index < 0 ? 0 : index;
}

type Kind = "money" | "percent" | "days" | "months";

const UNIT: Record<Kind, { text: string; suffix: boolean; step: string }> = {
  money: { text: "R$", suffix: false, step: "0.01" },
  percent: { text: "%", suffix: true, step: "0.01" },
  days: { text: "dias", suffix: true, step: "1" },
  months: { text: "meses", suffix: true, step: "1" },
};

function NumberField({
  name,
  label,
  hint,
  kind,
  register,
  error,
  unitText,
}: {
  name: Field;
  label: string;
  hint: string;
  kind: Kind;
  register: UseFormRegister<ScenarioValues>;
  error?: string;
  unitText?: string;
}) {
  const unit = UNIT[kind];
  const id = `field-${name.replace(/\./g, "-")}`;
  return (
    <label htmlFor={id}>
      <span>
        {label} <b>*</b>
      </span>
      <div className={`prefix-input ${unit.suffix ? "suffix" : ""}`}>
        {!unit.suffix && <i>{unit.text}</i>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={unit.step}
          {...register(name, { valueAsNumber: true })}
          aria-invalid={!!error}
          aria-describedby={`${id}-hint`}
        />
        {unit.suffix && <i>{unitText ?? unit.text}</i>}
      </div>
      <small id={`${id}-hint`}>{hint}</small>
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

function Stepper({
  current,
  reachable,
  completed,
  onSelect,
}: {
  current: number;
  reachable: (index: number) => boolean;
  completed: (index: number) => boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="wizard" aria-label="Etapas do cenário">
      <div className="wizard-progress" aria-hidden="true">
        <i style={{ width: `${(current / LAST) * 100}%` }} />
      </div>
      <ol className="wizard-steps">
        {STEPS.map((step, i) => {
          const state = i === current ? "current" : completed(i) ? "done" : "";
          return (
            <li key={step.id}>
              <button
                type="button"
                className={state}
                disabled={!reachable(i)}
                aria-current={i === current ? "step" : undefined}
                onClick={() => onSelect(i)}
              >
                <span className="wizard-index">{state === "done" ? <Glyph name="check" size={13} /> : i + 1}</span>
                <span className="wizard-label">{step.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function ScenarioFormPage() {
  const { projectId = "", scenarioId } = useParams();
  const editing = !!scenarioId;
  const project = useProject(projectId);
  const scenario = useScenario(projectId, scenarioId);
  usePageMeta(
    `${project.data?.name?.toUpperCase() ?? "PROJETO"} / CENÁRIOS`,
    editing ? `Editar ${scenario.data?.name ?? "cenário"}` : "Novo cenário",
  );

  if (project.isPending || (editing && scenario.isPending)) return <LoadingState />;
  const error = project.error ?? (editing ? scenario.error : null);
  if (error) {
    return (
      <div className="product-page narrow-page">
        <ErrorState error={error} notFoundTitle={editing ? "Cenário não encontrado" : "Projeto não encontrado"} />
      </div>
    );
  }
  return <ScenarioWizard key={scenario.data?.id ?? "new"} projectId={projectId} scenario={scenario.data} />;
}

function ScenarioWizard({ projectId, scenario }: { projectId: string; scenario?: Scenario }) {
  const navigate = useNavigate();
  const editing = !!scenario;
  const create = useCreateScenario(projectId);
  const update = useUpdateScenario(projectId, scenario?.id ?? "");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  // Etapa mais distante já validada. Na edição os dados já são válidos, então tudo fica liberado.
  const [furthest, setFurthest] = useState(editing ? LAST : 0);
  const topRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ScenarioValues>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: scenario
      ? { name: scenario.name, description: scenario.description ?? "", assumptions: toFormAssumptions(scenario.assumptions) }
      : { name: "", description: "", assumptions: EMPTY_ASSUMPTIONS },
  });

  const months = watch("assumptions.projectionMonths");
  const rangeMonths = Number.isFinite(months) ? Math.min(Math.max(months, 1), 120) : 1;
  const a = errors.assumptions;
  const back = editing ? `/app/projects/${projectId}/scenarios/${scenario.id}` : `/app/projects/${projectId}`;
  const field = (name: keyof ScenarioValues["assumptions"]) => ({ name: A(name), register, error: a?.[name]?.message });

  const goTo = (index: number) => {
    setStep(index);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = async () => {
    const valid = await trigger(STEPS[step].fields, { shouldFocus: true });
    if (!valid) return;
    setFurthest((f) => Math.max(f, step + 1));
    goTo(step + 1);
  };

  // Só pode pular para frente até a etapa mais distante já validada.
  const reachable = (index: number) => index <= furthest;

  const save = handleSubmit(
    async (values) => {
      setError("");
      const body = {
        name: values.name.trim(),
        description: values.description.trim() || (editing ? "" : undefined),
        assumptions: toApiAssumptions(values.assumptions),
      };
      try {
        const saved = editing ? await update.mutateAsync(body) : await create.mutateAsync(body);
        const newVersion = editing && saved.version !== scenario.version;
        toast.success(
          editing ? (newVersion ? `Premissas salvas como versão ${saved.version}.` : "Cenário atualizado.") : "Cenário criado.",
        );
        navigate(`/app/projects/${projectId}/scenarios/${saved.id}`, { replace: !editing });
      } catch (e) {
        setError(getErrorMessage(e));
      }
    },
    (invalid) => goTo(stepWithError(invalid)),
  );

  const current = STEPS[step];
  const isReview = step === LAST;

  return (
    <div className="product-page narrow-page scenario-form-page" ref={topRef}>
      <button className="back-link" onClick={() => navigate(back)}>
        <span>←</span> {editing ? "Voltar ao cenário" : "Voltar ao projeto"}
      </button>
      <div className="form-page-heading">
        <span className="step-badge">
          <Glyph name="branch" />
        </span>
        <div>
          <h2>{editing ? "Editar cenário" : "Configure o cenário"}</h2>
          <p>Defina as premissas que serão usadas na projeção financeira.</p>
        </div>
      </div>
      {editing && (
        <div className="version-note">
          <Glyph name="clock" />
          <span>Alterar as premissas registra a versão {scenario.version + 1}. Simulações anteriores permanecem inalteradas.</span>
        </div>
      )}

      <Stepper current={step} reachable={reachable} completed={(i) => i < furthest && i !== step} onSelect={goTo} />

      <form
        className="scenario-form-grid"
        noValidate
        onSubmit={(e) => {
          // Enter num campo avança a etapa; só a revisão salva.
          if (!isReview) {
            e.preventDefault();
            void next();
            return;
          }
          void save(e);
        }}
      >
        <section className="surface-panel product-form" aria-labelledby={`step-${current.id}`}>
          <div className="form-section-title">
            <span>{String(step + 1).padStart(2, "0")}</span>
            <div>
              <h3 id={`step-${current.id}`}>{current.title}</h3>
              <p>{current.text}</p>
            </div>
          </div>

          {current.id === "identificacao" && (
            <>
              <label>
                <span>
                  Nome do cenário <b>*</b>
                </span>
                <input {...register("name")} maxLength={120} placeholder="Ex.: Cenário base" aria-invalid={!!errors.name} autoFocus={!editing} />
                {errors.name && <span className="field-error">{errors.name.message}</span>}
              </label>
              <div className="suggestions">
                <span>SUGESTÕES</span>
                {["Cenário base", "Otimista", "Conservador"].map((name) => (
                  <button type="button" key={name} onClick={() => setValue("name", name, { shouldDirty: true, shouldValidate: true })}>
                    {name}
                  </button>
                ))}
              </div>
              <label>
                <span>Descrição</span>
                <textarea {...register("description")} maxLength={1000} placeholder="O que caracteriza esta hipótese?" />
                {errors.description && <span className="field-error">{errors.description.message}</span>}
              </label>
            </>
          )}

          {current.id === "receitas" && (
            <div className="field-grid">
              <NumberField {...field("initialProductRevenue")} kind="money" label="Receita de produtos" hint="Receita no primeiro mês." />
              <NumberField {...field("productRevenueGrowth")} kind="percent" label="Crescimento de produtos" hint="% ao mês." unitText="% / mês" />
              <NumberField {...field("initialServiceRevenue")} kind="money" label="Receita de serviços" hint="Receita no primeiro mês." />
              <NumberField {...field("serviceRevenueGrowth")} kind="percent" label="Crescimento de serviços" hint="% ao mês." unitText="% / mês" />
              <NumberField {...field("initialOtherRevenue")} kind="money" label="Outras receitas" hint="Receita no primeiro mês." />
              <NumberField {...field("otherRevenueGrowth")} kind="percent" label="Crescimento de outras receitas" hint="% ao mês." unitText="% / mês" />
            </div>
          )}

          {current.id === "custos" && (
            <div className="field-grid">
              <NumberField {...field("variableCostRate")} kind="percent" label="Custo variável" hint="Percentual da receita total." unitText="% da receita" />
              <NumberField {...field("initialFixedCost")} kind="money" label="Custo fixo mensal" hint="Custo fixo no primeiro mês." />
              <NumberField {...field("fixedCostGrowthRate")} kind="percent" label="Crescimento do custo fixo" hint="% ao mês." unitText="% / mês" />
            </div>
          )}

          {current.id === "investimento" && (
            <div className="field-grid">
              <NumberField {...field("initialInvestment")} kind="money" label="Investimento inicial" hint="Saída de caixa no início da projeção." />
              <NumberField {...field("capexRate")} kind="percent" label="Capex recorrente" hint="Reinvestimento mensal sobre a receita." unitText="% da receita" />
              <NumberField {...field("depreciableAssetValue")} kind="money" label="Ativos depreciáveis" hint="Valor dos ativos sujeitos a depreciação." />
              <NumberField {...field("usefulLifeMonths")} kind="months" label="Vida útil" hint="Prazo de depreciação linear." />
              <NumberField {...field("amortizationPerMonth")} kind="money" label="Amortização mensal" hint="Amortização de intangíveis por mês." />
            </div>
          )}

          {current.id === "financeiro" && (
            <div className="field-grid">
              <NumberField {...field("interestExpense")} kind="money" label="Despesa de juros mensal" hint="Juros pagos por mês." />
              <NumberField {...field("effectiveTaxRate")} kind="percent" label="Alíquota efetiva" hint="Aplicada apenas quando há lucro." unitText="% do lucro" />
              <NumberField {...field("daysSalesOutstanding")} kind="days" label="Prazo de recebimento" hint="Dias para receber dos clientes." />
              <NumberField {...field("daysPayableOutstanding")} kind="days" label="Prazo de pagamento" hint="Dias para pagar fornecedores." />
              <NumberField {...field("daysInventoryOutstanding")} kind="days" label="Prazo de estoque" hint="Dias de custo variável em estoque." />
            </div>
          )}

          {current.id === "horizonte" && (
            <>
              <div className="range-heading">
                <span>Duração</span>
                <strong>{Number.isFinite(months) ? formatMonths(months) : "—"}</strong>
              </div>
              <input
                className="month-range"
                type="range"
                min={1}
                max={120}
                value={rangeMonths}
                aria-label="Duração da projeção em meses"
                onChange={(e) => setValue(A("projectionMonths"), Number(e.target.value), { shouldDirty: true, shouldValidate: true })}
                style={{ "--range": `${((rangeMonths - 1) / 119) * 100}%` } as CSSProperties}
              />
              <div className="range-labels">
                <span>1 mês</span>
                <span>120 meses</span>
              </div>
              <div className="field-grid range-exact">
                <NumberField {...field("projectionMonths")} kind="months" label="Valor exato" hint={`Até ${MAX_PROJECTION_MONTHS} meses.`} />
              </div>
            </>
          )}

          {isReview && <Review values={getValues()} onEdit={goTo} />}
        </section>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="sticky-form-actions">
          <span>
            Etapa {step + 1} de {STEPS.length} · {current.title}
          </span>
          <div>
            {step === 0 ? (
              <button type="button" className="product-secondary" onClick={() => navigate(back)}>
                Cancelar
              </button>
            ) : (
              <button type="button" className="product-secondary" onClick={() => goTo(step - 1)}>
                <span>←</span> Voltar
              </button>
            )}
            {isReview ? (
              <button type="submit" className="product-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner" /> Salvando
                  </>
                ) : (
                  <>
                    {editing ? "Salvar alterações" : "Salvar cenário"} <Glyph name="check" />
                  </>
                )}
              </button>
            ) : (
              <button type="submit" className="product-primary">
                Próximo <Glyph name="arrow" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

/** Resumo final: o que será salvo, com atalho para corrigir cada etapa. */
function Review({ values, onEdit }: { values: ScenarioValues; onEdit: (step: number) => void }) {
  const groups = describeAssumptions(toApiAssumptions(values.assumptions));
  const stepOf = (group: AssumptionGroupId) => STEPS.findIndex((s) => s.group === group);
  return (
    <div className="wizard-review">
      <div className="review-block">
        <div className="review-head">
          <h4>Identificação</h4>
          <button type="button" onClick={() => onEdit(0)}>
            <Glyph name="edit" size={14} /> Editar
          </button>
        </div>
        <p className="review-name">{values.name || "—"}</p>
        {values.description && <p className="review-description">{values.description}</p>}
      </div>
      {groups.map((group) => (
        <div className="review-block" key={group.id}>
          <div className="review-head">
            <h4>{group.title}</h4>
            <button type="button" onClick={() => onEdit(stepOf(group.id))}>
              <Glyph name="edit" size={14} /> Editar
            </button>
          </div>
          <dl>
            {group.items.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>
                  {item.value}
                  <small>{item.note}</small>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
