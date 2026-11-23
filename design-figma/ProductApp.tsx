import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

type Project = {
  id: string;
  name: string;
  description: string;
  objective: string;
  scenarios: number;
  updated: string;
  status: "Ativo" | "Rascunho";
};

type Route =
  | "login"
  | "register"
  | "dashboard"
  | "projects"
  | "new-project"
  | "project"
  | "new-scenario"
  | "scenario"
  | "results"
  | "compare";

const initialProjects: Project[] = [
  {
    id: "expansao",
    name: "Expansão da unidade — Pinheiros",
    description: "Avaliação financeira para abertura de uma segunda unidade comercial.",
    objective: "Validar a viabilidade e o prazo de retorno do investimento.",
    scenarios: 3,
    updated: "Hoje, 10:42",
    status: "Ativo",
  },
  {
    id: "pricing",
    name: "Nova estratégia de pricing",
    description: "Impacto de novos planos e reajuste de preços na receita recorrente.",
    objective: "Encontrar uma estrutura de preços sustentável.",
    scenarios: 2,
    updated: "Ontem, 16:20",
    status: "Ativo",
  },
  {
    id: "operacao",
    name: "Otimização operacional",
    description: "Redução gradual de custos e revisão da estrutura de fornecedores.",
    objective: "Projetar ganho de margem nos próximos 18 meses.",
    scenarios: 1,
    updated: "18 de jun.",
    status: "Rascunho",
  },
];

const scenarioData = [
  { id: "base", name: "Cenário base", version: "v3", revenue: "R$ 91.200", cost: "R$ 57.800", growth: "3,2%", color: "#8b5cf6", status: "Simulado" },
  { id: "optimistic", name: "Cenário otimista", version: "v2", revenue: "R$ 105.000", cost: "R$ 59.200", growth: "5,5%", color: "#22c55e", status: "Simulado" },
  { id: "conservative", name: "Cenário conservador", version: "v1", revenue: "R$ 78.500", cost: "R$ 56.900", growth: "1,4%", color: "#f59e0b", status: "Pendente" },
];

const routeFromPath = (path: string): Route => {
  if (path === "/login") return "login";
  if (path === "/register") return "register";
  if (path.includes("/scenarios/new")) return "new-scenario";
  if (path.includes("/simulations")) return "results";
  if (path.endsWith("/compare")) return "compare";
  if (/\/scenarios\/[^/]+$/.test(path)) return "scenario";
  if (path === "/app/projects/new") return "new-project";
  if (/\/app\/projects\/[^/]+$/.test(path)) return "project";
  if (path === "/app/projects") return "projects";
  return "dashboard";
};

function go(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

type GlyphName =
  | "arrow"
  | "bell"
  | "branch"
  | "chart"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "dots"
  | "folder"
  | "home"
  | "logout"
  | "menu"
  | "plus"
  | "search"
  | "settings"
  | "spark"
  | "trash"
  | "user";

const glyphs: Record<GlyphName, ReactNode> = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  branch: <><circle cx="6" cy="5" r="2" /><circle cx="18" cy="7" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 5h2a4 4 0 0 1 4 4v5a4 4 0 0 0 4 4m-4-7a4 4 0 0 1 4-4" /></>,
  chart: <path d="M4 19V9m5 10V5m5 14v-7m5 7V8M2 19h20" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  dots: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  folder: <path d="M3 6h7l2 2h9v11H3V6Z" />,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
  logout: <><path d="M10 4H4v16h6m4-4 4-4-4-4m4 4H8" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 13.5v-3l-2-.6-.8-1.9 1-1.8-2.1-2.1-1.8 1-1.9-.8-.6-2h-3l-.6 2-1.9.8-1.8-1-2.1 2.1 1 1.8-.8 1.9-2 .6v3l2 .6.8 1.9-1 1.8 2.1 2.1 1.8-1 1.9.8.6 2h3l.6-2 1.9-.8 1.8 1 2.1-2.1-1-1.8.8-1.9 2-.6Z" /></>,
  spark: <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" />,
  trash: <><path d="M5 7h14M9 7V4h6v3m2 0-1 13H8L7 7m3 4v5m4-5v5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
};

function Glyph({ name, size = 18 }: { name: GlyphName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{glyphs[name]}</svg>;
}

function ProductLogo({ compact = false }: { compact?: boolean }) {
  return <button className="product-logo" onClick={() => go("/")} aria-label="Voltar para a página inicial">
    <svg viewBox="0 0 32 32"><path d="M6 8.5 15.8 3 26 8.8v5.4l-10.2 5.9L6 14.5v-6Z" /><path d="m6 17.5 9.8 5.6L26 17.2v5.7l-10.2 5.8L6 23.1v-5.6Z" /></svg>
    {!compact && <span>scenara</span>}
  </button>;
}

function AuthScreen({ mode }: { mode: "login" | "register" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    if (!email.includes("@") || password.length < 6) {
      setError("Revise o e-mail e use uma senha com pelo menos 6 caracteres.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => go("/app/dashboard"), 650);
  };
  return <div className="auth-page">
    <div className="auth-ambient" />
    <header className="auth-header"><ProductLogo /><button onClick={() => go("/")} className="quiet-link">Voltar ao site</button></header>
    <main className="auth-main">
      <section className="auth-intro">
        <span className="auth-kicker"><i /> AMBIENTE DE DECISÃO</span>
        <h1>{isRegister ? "Comece a explorar futuros possíveis." : "Continue de onde suas decisões pararam."}</h1>
        <p>{isRegister ? "Crie seu espaço para estruturar hipóteses, comparar cenários e decidir com mais contexto." : "Acesse seus projetos, premissas e simulações em um único ambiente."}</p>
        <div className="auth-visual">
          <div className="auth-node main"><span>DECISÃO</span><strong>Expansão 2025</strong></div>
          <div className="auth-node one"><i className="green" /> Otimista</div>
          <div className="auth-node two"><i /> Base</div>
          <div className="auth-node three"><i className="amber" /> Conservador</div>
          <svg viewBox="0 0 500 200"><path d="M250 45C250 100 105 78 105 144M250 45v99M250 45c0 55 145 33 145 99" /></svg>
        </div>
      </section>
      <section className="auth-card">
        <div className="auth-card-head"><span>{isRegister ? "CRIAR CONTA" : "BEM-VINDO DE VOLTA"}</span><h2>{isRegister ? "Crie seu acesso" : "Entre na Scenara"}</h2><p>{isRegister ? "Configure sua conta em poucos segundos." : "Use seus dados para acessar o ambiente."}</p></div>
        <form onSubmit={submit}>
          {isRegister && <label>Nome completo<input name="name" required placeholder="Como podemos chamar você?" /></label>}
          <label>E-mail<input name="email" required type="email" placeholder="voce@empresa.com" /></label>
          <label>Senha<div className="password-wrap"><input name="password" required type="password" placeholder="Mínimo de 6 caracteres" /></div></label>
          {isRegister && <label>Confirmar senha<input name="confirm" required type="password" placeholder="Digite novamente" /></label>}
          {error && <div className="form-error">{error}</div>}
          <button className="product-primary auth-submit" disabled={loading}>{loading ? <><span className="spinner" /> Validando acesso</> : <>{isRegister ? "Criar conta" : "Entrar na plataforma"} <Glyph name="arrow" /></>}</button>
        </form>
        <div className="auth-switch">{isRegister ? "Já possui uma conta?" : "Ainda não possui uma conta?"} <button onClick={() => go(isRegister ? "/login" : "/register")}>{isRegister ? "Fazer login" : "Criar conta"}</button></div>
        <small>Protótipo demonstrativo — nenhuma credencial é persistida.</small>
      </section>
    </main>
  </div>;
}

function Sidebar({ route, open, close }: { route: Route; open: boolean; close: () => void }) {
  return <>
    {open && <button className="sidebar-overlay" onClick={close} aria-label="Fechar navegação" />}
    <aside className={`product-sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-logo"><ProductLogo /><button className="mobile-close" onClick={close}><Glyph name="close" /></button></div>
      <div className="workspace-switch"><span>AC</span><div><small>WORKSPACE</small><strong>Acme Company</strong></div><Glyph name="chevron" size={14} /></div>
      <nav>
        <span className="nav-section">VISÃO GERAL</span>
        <button className={route === "dashboard" ? "active" : ""} onClick={() => { go("/app/dashboard"); close(); }}><Glyph name="home" /> Dashboard</button>
        <span className="nav-section">PLANEJAMENTO</span>
        <button className={["projects", "new-project", "project"].includes(route) ? "active" : ""} onClick={() => { go("/app/projects"); close(); }}><Glyph name="folder" /> Projetos <em>3</em></button>
        <button className={["new-scenario", "scenario"].includes(route) ? "active" : ""} onClick={() => { go("/app/projects/expansao/scenarios/base"); close(); }}><Glyph name="branch" /> Cenários</button>
        <button className={route === "results" ? "active" : ""} onClick={() => { go("/app/projects/expansao/scenarios/base/simulations"); close(); }}><Glyph name="chart" /> Simulações</button>
        <button className={route === "compare" ? "active" : ""} onClick={() => { go("/app/projects/expansao/compare"); close(); }}><Glyph name="spark" /> Comparar</button>
        <span className="nav-section">CONTA</span>
        <button><Glyph name="settings" /> Configurações</button>
      </nav>
      <button className="sidebar-create" onClick={() => go("/app/projects/new")}><Glyph name="plus" /> Novo projeto</button>
      <div className="sidebar-profile"><span>MC</span><div><strong>Marina Costa</strong><small>marina@acme.co</small></div><button onClick={() => go("/login")} aria-label="Sair"><Glyph name="logout" /></button></div>
    </aside>
  </>;
}

const titles: Record<Route, { eyebrow: string; title: string }> = {
  login: { eyebrow: "", title: "" }, register: { eyebrow: "", title: "" },
  dashboard: { eyebrow: "VISÃO GERAL", title: "Dashboard" },
  projects: { eyebrow: "PLANEJAMENTO", title: "Meus projetos" },
  "new-project": { eyebrow: "PROJETOS / NOVO", title: "Criar projeto" },
  project: { eyebrow: "PROJETOS / EXPANSÃO", title: "Expansão da unidade" },
  "new-scenario": { eyebrow: "EXPANSÃO / CENÁRIOS", title: "Novo cenário" },
  scenario: { eyebrow: "EXPANSÃO / CENÁRIOS", title: "Cenário base" },
  results: { eyebrow: "CENÁRIO BASE / SIMULAÇÕES", title: "Resultado da simulação" },
  compare: { eyebrow: "EXPANSÃO / ANÁLISE", title: "Comparar cenários" },
};

function ProductHeader({ route, toggle }: { route: Route; toggle: () => void }) {
  const current = titles[route];
  return <header className="product-header">
    <button className="mobile-menu" onClick={toggle}><Glyph name="menu" /></button>
    <div><span>{current.eyebrow}</span><h1>{current.title}</h1></div>
    <div className="header-actions"><span className="demo-chip">AMBIENTE DEMO</span><button aria-label="Notificações"><Glyph name="bell" /><i /></button><span className="header-avatar">MC</span></div>
  </header>;
}

function StatCard({ label, value, note, icon, trend }: { label: string; value: string; note: string; icon: GlyphName; trend?: string }) {
  return <article className="stat-card"><div><span>{label}</span><div className="stat-icon"><Glyph name={icon} /></div></div><strong>{value}</strong><p>{trend && <b>{trend}</b>} {note}</p></article>;
}

function ProjectRow({ project }: { project: Project }) {
  return <button className="project-row" onClick={() => go(`/app/projects/${project.id}`)}>
    <span className="project-symbol"><Glyph name="folder" /></span>
    <span className="project-copy"><strong>{project.name}</strong><small>{project.description}</small></span>
    <span className="scenario-count">{project.scenarios}<small>cenários</small></span>
    <span className={`status-pill ${project.status === "Rascunho" ? "draft" : ""}`}><i /> {project.status}</span>
    <span className="updated">{project.updated}</span><Glyph name="chevron" size={16} />
  </button>;
}

function Dashboard({ projects }: { projects: Project[] }) {
  return <div className="product-page">
    <section className="page-welcome"><div><p>Bom dia, Marina.</p><h2>Quais possibilidades vamos explorar hoje?</h2></div><button className="product-primary" onClick={() => go("/app/projects/new")}><Glyph name="plus" /> Novo projeto</button></section>
    <div className="demo-notice"><Glyph name="spark" /><span><strong>Dados de demonstração.</strong> Este ambiente apresenta exemplos para validar a experiência do produto.</span></div>
    <section className="stats-grid"><StatCard label="PROJETOS" value={String(projects.length)} note="1 atualizado hoje" icon="folder" trend="+1" /><StatCard label="CENÁRIOS ATIVOS" value="6" note="em 3 projetos" icon="branch" /><StatCard label="SIMULAÇÕES" value="24" note="nos últimos 30 dias" icon="chart" trend="+8" /><StatCard label="ÚLTIMA EXECUÇÃO" value="10:42" note="Cenário base · hoje" icon="clock" /></section>
    <section className="dashboard-grid">
      <div className="surface-panel activity-chart"><div className="panel-heading"><div><span>ATIVIDADE</span><h3>Simulações executadas</h3></div><select aria-label="Período"><option>Últimos 6 meses</option></select></div>
        <svg viewBox="0 0 650 220" role="img" aria-label="Gráfico demonstrativo de simulações executadas">
          <defs><linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8b5cf6" stopOpacity=".25" /><stop offset="1" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs>
          {[35, 80, 125, 170].map(y => <path key={y} d={`M20 ${y}H630`} className="product-grid-line" />)}
          <path d="M20 170C80 165 100 132 145 140s75-64 125-43 68-17 112-7 70-50 116-26 73-34 132-41V200H20Z" fill="url(#activityFill)" />
          <path d="M20 170C80 165 100 132 145 140s75-64 125-43 68-17 112-7 70-50 116-26 73-34 132-41" className="activity-line" />
        </svg><div className="chart-months"><span>JAN</span><span>FEV</span><span>MAR</span><span>ABR</span><span>MAI</span><span>JUN</span></div>
      </div>
      <div className="surface-panel quick-actions"><div className="panel-heading"><div><span>ATALHOS</span><h3>Ações rápidas</h3></div></div>
        <button onClick={() => go("/app/projects/new")}><i><Glyph name="plus" /></i><span><strong>Criar projeto</strong><small>Comece uma nova análise</small></span><Glyph name="chevron" /></button>
        <button onClick={() => go("/app/projects/expansao/scenarios/new")}><i><Glyph name="branch" /></i><span><strong>Novo cenário</strong><small>Adicione uma hipótese</small></span><Glyph name="chevron" /></button>
        <button onClick={() => go("/app/projects/expansao/compare")}><i><Glyph name="spark" /></i><span><strong>Comparar cenários</strong><small>Analise as diferenças</small></span><Glyph name="chevron" /></button>
      </div>
    </section>
    <section className="surface-panel recent-projects"><div className="panel-heading"><div><span>RECENTES</span><h3>Projetos em andamento</h3></div><button onClick={() => go("/app/projects")}>Ver todos <Glyph name="arrow" size={15} /></button></div>{projects.map(project => <ProjectRow key={project.id} project={project} />)}</section>
  </div>;
}

function Projects({ projects }: { projects: Project[] }) {
  const [search, setSearch] = useState("");
  const filtered = projects.filter(project => project.name.toLowerCase().includes(search.toLowerCase()));
  return <div className="product-page">
    <section className="page-title-row"><div><h2>Todos os projetos</h2><p>Organize decisões e acompanhe seus cenários financeiros.</p></div><button className="product-primary" onClick={() => go("/app/projects/new")}><Glyph name="plus" /> Novo projeto</button></section>
    <div className="list-toolbar"><label className="search-box"><Glyph name="search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome do projeto..." /></label><select><option>Todos os status</option><option>Ativos</option><option>Rascunhos</option></select><select><option>Atualizados recentemente</option></select></div>
    <section className="surface-panel project-list"><div className="project-table-head"><span>PROJETO</span><span>CENÁRIOS</span><span>STATUS</span><span>ATUALIZAÇÃO</span><span /></div>{filtered.length ? filtered.map(project => <ProjectRow key={project.id} project={project} />) : <EmptyState title="Nenhum projeto encontrado" text="Tente outro termo ou crie um novo projeto." />}</section>
  </div>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="empty-state"><span><Glyph name="folder" /></span><h3>{title}</h3><p>{text}</p></div>;
}

function NewProject({ addProject }: { addProject: (project: Project) => void }) {
  const [name, setName] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    addProject({ id: "novo-projeto", name, description: "Novo projeto de simulação financeira.", objective: "Objetivo a definir.", scenarios: 0, updated: "Agora", status: "Rascunho" });
    go("/app/projects/novo-projeto");
  };
  return <div className="product-page narrow-page"><button className="back-link" onClick={() => go("/app/projects")}><span>←</span> Voltar para projetos</button>
    <div className="form-page-heading"><span className="step-badge">01</span><div><h2>Sobre o projeto</h2><p>Defina o contexto da decisão que você deseja explorar.</p></div></div>
    <form className="surface-panel product-form" onSubmit={submit}>
      <label><span>Nome do projeto <b>*</b></span><small>Use um nome claro e fácil de reconhecer.</small><input value={name} onChange={e => setName(e.target.value)} maxLength={80} placeholder="Ex.: Expansão da unidade — Pinheiros" required /><em>{name.length}/80</em></label>
      <label><span>Descrição</span><small>Contextualize brevemente a análise.</small><textarea maxLength={300} placeholder="Descreva o projeto, seu contexto e principais premissas..." /></label>
      <label><span>Objetivo da simulação</span><small>O que você precisa decidir com esta análise?</small><textarea maxLength={200} placeholder="Ex.: Entender se a expansão se paga em até 18 meses." /></label>
      <div className="form-tip"><Glyph name="spark" /><div><strong>Uma boa pergunta gera cenários melhores.</strong><p>Seja específico sobre a decisão e o resultado esperado. Você poderá ajustar estas informações depois.</p></div></div>
      <div className="form-actions"><button type="button" className="product-secondary" onClick={() => go("/app/projects")}>Cancelar</button><button className="product-primary">Criar projeto <Glyph name="arrow" /></button></div>
    </form>
  </div>;
}

function ProjectDetail() {
  return <div className="product-page">
    <section className="project-hero"><div><span className="status-pill"><i /> Ativo</span><h2>Expansão da unidade — Pinheiros</h2><p>Avaliação financeira para abertura de uma segunda unidade comercial.</p><div className="project-meta"><span>Criado em 04 jun. 2025</span><i /> <span>Atualizado hoje, 10:42</span></div></div><div><button className="product-secondary"><Glyph name="dots" /> Opções</button><button className="product-primary" onClick={() => go("/app/projects/expansao/scenarios/new")}><Glyph name="plus" /> Novo cenário</button></div></section>
    <nav className="detail-tabs"><button className="active">Visão geral</button><button>Cenários <span>3</span></button><button onClick={() => go("/app/projects/expansao/compare")}>Comparar</button><button>Histórico</button></nav>
    <section className="project-summary-grid">
      <article className="surface-panel objective-card"><span>OBJETIVO DA SIMULAÇÃO</span><Glyph name="spark" /><p>Validar a viabilidade da nova unidade e descobrir em quanto tempo o investimento inicial será recuperado.</p></article>
      <article className="surface-panel project-summary"><div><span>CENÁRIOS</span><strong>3</strong><small>2 simulados</small></div><div><span>SIMULAÇÕES</span><strong>12</strong><small>última hoje</small></div><div><span>HORIZONTE</span><strong>24</strong><small>meses</small></div></article>
    </section>
    <section className="section-row-heading"><div><span>CENÁRIOS DO PROJETO</span><h3>Explore diferentes possibilidades</h3></div><button onClick={() => go("/app/projects/expansao/compare")}>Comparar cenários <Glyph name="arrow" /></button></section>
    <div className="scenario-card-grid">{scenarioData.map(item => <button className="scenario-card" key={item.id} onClick={() => go(`/app/projects/expansao/scenarios/${item.id}`)}><div className="scenario-top"><span style={{ background: item.color }}><Glyph name="branch" /></span><span className={`status-pill ${item.status === "Pendente" ? "pending" : ""}`}><i /> {item.status}</span></div><h3>{item.name}</h3><small>{item.version} · Atualizado hoje</small><div className="scenario-values"><div><span>RECEITA INICIAL</span><strong>{item.revenue}</strong></div><div><span>CUSTO INICIAL</span><strong>{item.cost}</strong></div></div><div className="scenario-footer"><span>Crescimento mensal</span><strong>{item.growth}</strong><Glyph name="chevron" /></div></button>)}</div>
  </div>;
}

function ScenarioForm() {
  const [months, setMonths] = useState(24);
  const [saved, setSaved] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault(); setSaved(true); window.setTimeout(() => go("/app/projects/expansao/scenarios/base"), 700);
  };
  return <div className="product-page narrow-page scenario-form-page"><button className="back-link" onClick={() => go("/app/projects/expansao")}><span>←</span> Voltar ao projeto</button>
    <div className="form-page-heading"><span className="step-badge"><Glyph name="branch" /></span><div><h2>Configure o cenário</h2><p>Defina as premissas que serão usadas na projeção financeira.</p></div></div>
    <div className="version-note"><Glyph name="clock" /><span>Ao salvar, uma nova versão das premissas será registrada. Simulações anteriores permanecem inalteradas.</span></div>
    <form onSubmit={submit} className="scenario-form-grid">
      <section className="surface-panel product-form">
        <div className="form-section-title"><span>01</span><div><h3>Identificação</h3><p>Dê um nome que diferencie esta hipótese.</p></div></div>
        <label><span>Nome do cenário <b>*</b></span><input required defaultValue="Cenário base" /></label>
        <div className="suggestions"><span>SUGESTÕES</span>{["Cenário base", "Otimista", "Conservador"].map(name => <button type="button" key={name}>{name}</button>)}</div>
      </section>
      <section className="surface-panel product-form">
        <div className="form-section-title"><span>02</span><div><h3>Premissas financeiras</h3><p>Informe os valores iniciais e taxas mensais.</p></div></div>
        <div className="field-grid">
          <label><span>Investimento inicial <b>*</b></span><div className="prefix-input"><i>R$</i><input type="number" min="0" defaultValue="450000" /></div><small>Saída de caixa no início da projeção.</small></label>
          <label><span>Receita mensal inicial <b>*</b></span><div className="prefix-input"><i>R$</i><input type="number" min="0" defaultValue="91200" /></div><small>Receita esperada para o primeiro mês.</small></label>
          <label><span>Custo mensal inicial <b>*</b></span><div className="prefix-input"><i>R$</i><input type="number" min="0" defaultValue="57800" /></div><small>Custos operacionais no primeiro mês.</small></label>
          <label><span>Crescimento da receita <b>*</b></span><div className="prefix-input suffix"><input type="number" step=".1" defaultValue="3.2" /><i>% / mês</i></div><small>Aplicado de forma composta.</small></label>
          <label><span>Crescimento dos custos <b>*</b></span><div className="prefix-input suffix"><input type="number" step=".1" defaultValue="1.8" /><i>% / mês</i></div><small>Aplicado de forma composta.</small></label>
        </div>
      </section>
      <section className="surface-panel product-form">
        <div className="form-section-title"><span>03</span><div><h3>Horizonte da projeção</h3><p>Escolha quantos meses serão calculados.</p></div></div>
        <div className="range-heading"><span>Duração</span><strong>{months} meses</strong></div><input className="month-range" type="range" min="1" max="60" value={months} onChange={e => setMonths(Number(e.target.value))} style={{ "--range": `${(months / 60) * 100}%` } as React.CSSProperties} /><div className="range-labels"><span>1 mês</span><span>60 meses</span></div>
      </section>
      <div className="sticky-form-actions"><span>{saved ? <><Glyph name="check" /> Cenário salvo</> : "Todos os valores são exemplos demonstrativos."}</span><div><button type="button" className="product-secondary" onClick={() => go("/app/projects/expansao")}>Cancelar</button><button className="product-primary">{saved ? "Salvando..." : "Salvar cenário"} <Glyph name="arrow" /></button></div></div>
    </form>
  </div>;
}

function ScenarioDetail() {
  const [running, setRunning] = useState(false);
  const run = () => { setRunning(true); window.setTimeout(() => go("/app/projects/expansao/scenarios/base/simulations"), 900); };
  return <div className="product-page">
    <section className="page-title-row scenario-heading"><div><div className="scenario-title-line"><span className="scenario-orb"><Glyph name="branch" /></span><div><span className="status-pill"><i /> Simulado</span><h2>Cenário base <small>v3</small></h2><p>Premissas consideradas mais prováveis para a expansão.</p></div></div></div><div><button className="product-secondary" onClick={() => go("/app/projects/expansao/scenarios/new")}>Editar cenário</button><button className="product-primary" onClick={run} disabled={running}>{running ? <><span className="spinner" /> Executando</> : <><Glyph name="spark" /> Executar simulação</>}</button></div></section>
    <div className="projection-warning"><Glyph name="spark" /><p><strong>Projeção baseada em premissas.</strong> Os resultados apoiam a análise, mas não representam garantia de desempenho futuro.</p></div>
    <section className="section-row-heading"><div><span>PREMISSAS ATUAIS · VERSÃO 3</span><h3>Configuração financeira</h3></div><span className="last-update">Atualizado hoje, 09:58</span></section>
    <div className="variable-grid">{[
      ["Investimento inicial", "R$ 450.000", "Saída no início da projeção"],
      ["Receita mensal inicial", "R$ 91.200", "Primeiro mês"],
      ["Custo mensal inicial", "R$ 57.800", "Primeiro mês"],
      ["Crescimento da receita", "3,2%", "Composto ao mês"],
      ["Crescimento dos custos", "1,8%", "Composto ao mês"],
      ["Período da projeção", "24 meses", "Horizonte total"],
    ].map(([label, value, note], i) => <article key={label}><span><Glyph name={i < 3 ? "chart" : i < 5 ? "arrow" : "clock"} /></span><div><small>{label.toUpperCase()}</small><strong>{value}</strong><p>{note}</p></div></article>)}</div>
    <section className="surface-panel history-panel"><div className="panel-heading"><div><span>HISTÓRICO</span><h3>Simulações anteriores</h3></div><button onClick={() => go("/app/projects/expansao/scenarios/base/simulations")}>Ver todos <Glyph name="arrow" /></button></div>
      <div className="history-table"><div className="history-head"><span>EXECUÇÃO</span><span>VERSÃO</span><span>PERÍODO</span><span>SALDO FINAL</span><span>PAYBACK</span><span /></div>{[
        ["#SIM-024", "v3", "24 meses", "R$ 729.480", "Mês 13", "Hoje, 10:42"],
        ["#SIM-019", "v2", "24 meses", "R$ 648.120", "Mês 15", "12 jun., 15:21"],
        ["#SIM-011", "v1", "18 meses", "R$ 312.900", "Mês 16", "05 jun., 11:06"],
      ].map(row => <button key={row[0]} onClick={() => go("/app/projects/expansao/scenarios/base/simulations")}>{row.map((value, i) => <span key={value} className={i === 0 ? "mono" : ""}>{value}</span>)}<Glyph name="chevron" /></button>)}</div>
    </section>
  </div>;
}

function MetricCard({ label, value, change, tone = "neutral" }: { label: string; value: string; change: string; tone?: string }) {
  return <article className="result-metric"><span>{label}</span><strong>{value}</strong><small className={tone}>{change}</small></article>;
}

function ResultsChart({ type = "lines" }: { type?: "lines" | "bars" | "area" }) {
  return <svg className="results-chart-svg" viewBox="0 0 700 230" role="img" aria-label="Visualização demonstrativa dos resultados financeiros">
    <defs><linearGradient id={`fill-${type}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8b5cf6" stopOpacity=".3" /><stop offset="1" stopColor="#8b5cf6" stopOpacity="0" /></linearGradient></defs>
    {[35, 80, 125, 170, 215].map(y => <path key={y} d={`M25 ${y}H680`} className="product-grid-line" />)}
    {type === "lines" && <><path d="M25 188C80 180 100 166 150 158s76-16 120-30 75-25 120-44 72-23 118-43 82-20 172-28" className="result-line revenue" /><path d="M25 205C85 201 106 193 150 190s78-10 120-13 79-12 120-13 78-10 120-13 80-9 170-15" className="result-line cost" /></>}
    {type === "area" && <><path d="M25 200C90 190 112 175 165 165s75-42 120-35 74-28 122-35 77-49 128-43 82-36 145-34V225H25Z" fill={`url(#fill-${type})`} /><path d="M25 200C90 190 112 175 165 165s75-42 120-35 74-28 122-35 77-49 128-43 82-36 145-34" className="result-line revenue" /><path d="M25 200H680" className="zero-line" /></>}
    {type === "bars" && [26, 34, 42, 49, 58, 68, 75, 86, 94, 104, 116, 128].map((h, i) => <rect key={i} x={35 + i * 53} y={215 - h} width="25" height={h} rx="3" fill="#8b5cf6" opacity={.45 + i * .04} />)}
  </svg>;
}

function Results() {
  const [tab, setTab] = useState<"overview" | "monthly">("overview");
  const rows = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const revenue = 91200 * Math.pow(1.032, i);
    const cost = 57800 * Math.pow(1.018, i);
    const result = revenue - cost;
    const cumulative = -450000 + Array.from({ length: i + 1 }, (_, n) => 91200 * Math.pow(1.032, n) - 57800 * Math.pow(1.018, n)).reduce((a, b) => a + b, 0);
    return [i + 1, revenue, cost, result, cumulative];
  }), []);
  const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  return <div className="product-page">
    <section className="result-header"><div><span className="status-pill"><i /> Concluída</span><h2>Resultado da simulação <small>#SIM-024</small></h2><p>Cenário base · versão 3 · Executada hoje, 10:42</p></div><div><button className="product-secondary" onClick={() => go("/app/projects/expansao/scenarios/base")}><span>←</span> Voltar ao cenário</button><button className="product-primary" onClick={() => go("/app/projects/expansao/compare")}><Glyph name="spark" /> Comparar</button></div></section>
    <div className="projection-warning"><Glyph name="spark" /><p><strong>Resultado projetado.</strong> Valores calculados a partir das premissas informadas e apresentados apenas para demonstração.</p></div>
    <nav className="detail-tabs result-tabs"><button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}>Visão geral</button><button className={tab === "monthly" ? "active" : ""} onClick={() => setTab("monthly")}>Evolução mensal</button></nav>
    {tab === "overview" ? <>
      <section className="result-metrics"><MetricCard label="RECEITA TOTAL" value="R$ 3,18 mi" change="+18,4% sobre o cenário anterior" tone="positive" /><MetricCard label="CUSTOS TOTAIS" value="R$ 1,71 mi" change="+8,2% sobre o cenário anterior" /><MetricCard label="RESULTADO OPERACIONAL" value="R$ 1,47 mi" change="Margem de 46,2%" tone="positive" /><MetricCard label="SALDO FINAL" value="R$ 1,02 mi" change="Após investimento inicial" /><MetricCard label="PAYBACK SIMPLES" value="Mês 13" change="Dentro do horizonte" tone="positive" /></section>
      <section className="surface-panel results-graph"><div className="panel-heading"><div><span>EVOLUÇÃO FINANCEIRA</span><h3>Receita versus custos</h3></div><div className="graph-legend"><span><i className="purple" /> Receita</span><span><i className="orange" /> Custos</span></div></div><ResultsChart /><div className="chart-months"><span>MÊS 1</span><span>MÊS 6</span><span>MÊS 12</span><span>MÊS 18</span><span>MÊS 24</span></div></section>
      <section className="results-dual"><div className="surface-panel results-graph"><div className="panel-heading"><div><span>RESULTADO MENSAL</span><h3>Resultado operacional</h3></div></div><ResultsChart type="bars" /></div><div className="surface-panel results-graph"><div className="panel-heading"><div><span>RETORNO</span><h3>Fluxo acumulado</h3></div><span className="payback-tag">PAYBACK · MÊS 13</span></div><ResultsChart type="area" /></div></section>
    </> : <section className="surface-panel monthly-table"><div className="panel-heading"><div><span>DETALHAMENTO</span><h3>Projeção mês a mês</h3></div></div><div className="table-scroll"><table><thead><tr><th>MÊS</th><th>RECEITA</th><th>CUSTOS</th><th>RESULTADO OPERACIONAL</th><th>FLUXO ACUMULADO</th></tr></thead><tbody>{rows.map(row => <tr key={row[0]}><td>Mês {row[0]}</td><td>{money(row[1])}</td><td>{money(row[2])}</td><td className="positive">{money(row[3])}</td><td className={row[4] >= 0 ? "positive" : "negative"}>{money(row[4])}</td></tr>)}</tbody></table></div></section>}
  </div>;
}

function Compare() {
  const [selected, setSelected] = useState(["base", "optimistic"]);
  const toggle = (id: string) => setSelected(current => current.includes(id) ? current.length > 2 ? current.filter(item => item !== id) : current : [...current, id]);
  return <div className="product-page">
    <section className="page-title-row"><div><h2>Compare possibilidades</h2><p>Analise premissas e resultados lado a lado, usando a última simulação de cada cenário.</p></div><button className="product-secondary" onClick={() => go("/app/projects/expansao")}><span>←</span> Voltar ao projeto</button></section>
    <section className="surface-panel compare-selector"><div className="panel-heading"><div><span>SELEÇÃO</span><h3>Escolha pelo menos dois cenários</h3></div><span>{selected.length} selecionados</span></div><div className="compare-options">{scenarioData.map(item => <button key={item.id} className={selected.includes(item.id) ? "selected" : ""} onClick={() => toggle(item.id)}><span className="check-box">{selected.includes(item.id) && <Glyph name="check" size={14} />}</span><i style={{ background: item.color }} /><div><strong>{item.name}</strong><small>{item.version} · última simulação</small></div></button>)}</div></section>
    <section className="compare-hero-grid">
      {scenarioData.filter(item => selected.includes(item.id)).map((item, index) => <article key={item.id} style={{ "--accent": item.color } as React.CSSProperties}><div><i /><span>{item.name.toUpperCase()}</span><small>{item.version}</small></div><strong>{index === 0 ? "R$ 1,02 mi" : "R$ 1,61 mi"}</strong><p>SALDO FINAL PROJETADO</p><span className="comparison-change">{index === 0 ? "Referência" : "+57,8% vs. base"}</span></article>)}
    </section>
    <section className="surface-panel comparison-table"><div className="panel-heading"><div><span>INDICADORES</span><h3>Comparação consolidada</h3></div><span className="illustrative-label">DADOS ILUSTRATIVOS</span></div><div className="table-scroll"><table><thead><tr><th>INDICADOR</th>{scenarioData.filter(item => selected.includes(item.id)).map(item => <th key={item.id}><i style={{ background: item.color }} /> {item.name}</th>)}</tr></thead><tbody>{[
        ["Investimento inicial", "R$ 450.000", "R$ 480.000", "R$ 430.000"],
        ["Receita total projetada", "R$ 3,18 mi", "R$ 3,91 mi", "R$ 2,61 mi"],
        ["Custos totais projetados", "R$ 1,71 mi", "R$ 1,82 mi", "R$ 1,65 mi"],
        ["Resultado operacional", "R$ 1,47 mi", "R$ 2,09 mi", "R$ 960 mil"],
        ["Margem operacional", "46,2%", "53,4%", "36,8%"],
        ["Payback simples", "Mês 13", "Mês 10", "Mês 19"],
      ].map(row => <tr key={row[0]}><td>{row[0]}</td>{scenarioData.filter(item => selected.includes(item.id)).map((item, index) => <td key={item.id}>{row[index + 1]}</td>)}</tr>)}</tbody></table></div></section>
    <section className="surface-panel results-graph compare-graph"><div className="panel-heading"><div><span>EVOLUÇÃO</span><h3>Saldo acumulado por cenário</h3></div><div className="graph-legend">{scenarioData.filter(item => selected.includes(item.id)).map(item => <span key={item.id}><i style={{ background: item.color }} /> {item.name}</span>)}</div></div><svg className="results-chart-svg" viewBox="0 0 700 230">{[35, 80, 125, 170, 215].map(y => <path key={y} d={`M25 ${y}H680`} className="product-grid-line" />)}<path d="M25 210C110 201 144 180 210 167s114-41 180-54 110-48 170-57 80-32 120-38" className="result-line revenue" /><path d="M25 210C110 198 142 164 210 143s108-55 180-73 110-36 170-45 79-11 120-18" className="result-line success-line" /></svg></section>
  </div>;
}

function ProductApp() {
  const [route, setRoute] = useState<Route>(() => routeFromPath(window.location.pathname));
  const [sidebar, setSidebar] = useState(false);
  const [projects, setProjects] = useState(initialProjects);
  useEffect(() => {
    const update = () => setRoute(routeFromPath(window.location.pathname));
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  if (route === "login" || route === "register") return <AuthScreen mode={route} />;
  const page = {
    dashboard: <Dashboard projects={projects} />,
    projects: <Projects projects={projects} />,
    "new-project": <NewProject addProject={project => setProjects(current => [project, ...current])} />,
    project: <ProjectDetail />,
    "new-scenario": <ScenarioForm />,
    scenario: <ScenarioDetail />,
    results: <Results />,
    compare: <Compare />,
    login: null,
    register: null,
  }[route];
  return <div className="product-shell"><Sidebar route={route} open={sidebar} close={() => setSidebar(false)} /><div className="product-main"><ProductHeader route={route} toggle={() => setSidebar(true)} />{page}</div></div>;
}

export default ProductApp;
