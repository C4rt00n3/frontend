import { useState, type ReactNode } from "react";
import ProductApp from "./ProductApp";

type IconName =
  | "arrow"
  | "branch"
  | "chart"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "menu"
  | "play"
  | "risk"
  | "sliders"
  | "spark"
  | "target";

const paths: Record<IconName, ReactNode> = {
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  branch: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 5h2a4 4 0 0 1 4 4v5a4 4 0 0 0 4 4M14 11a5 5 0 0 1 4-5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  play: <path d="m9 7 8 5-8 5V7Z" />,
  risk: (
    <>
      <path d="M12 3 3.5 19h17L12 3Z" />
      <path d="M12 9v4m0 3h.01" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 7h8m4 0h4M4 17h4m4 0h8M12 5v4M8 15v4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.2 4.2L17 9l-3.8 1.8L12 15l-1.2-4.2L7 9l3.8-1.8L12 3Z" />
      <path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
    </>
  ),
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a className="logo" href="#inicio" aria-label="Scenara — início">
      <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 8.5 15.8 3 26 8.8v5.4l-10.2 5.9L6 14.5v-6Z" />
        <path d="m6 17.5 9.8 5.6L26 17.2v5.7l-10.2 5.8L6 23.1v-5.6Z" />
      </svg>
      {!compact && <span>scenara</span>}
    </a>
  );
}

const steps = [
  ["01", "Crie um projeto", "Organize a decisão, o contexto e o objetivo que você quer explorar."],
  ["02", "Defina variáveis", "Mapeie os fatores que influenciam o resultado e estabeleça limites."],
  ["03", "Construa cenários", "Combine premissas em visões otimista, base ou personalizadas."],
  ["04", "Execute simulações", "Processe alternativas e acompanhe o impacto de cada mudança."],
  ["05", "Analise resultados", "Compare consequências, riscos e oportunidades com clareza."],
];

const features: { icon: IconName; title: string; text: string; tag: string }[] = [
  {
    icon: "branch",
    title: "Laboratório de cenários",
    text: "Crie caminhos alternativos e compare premissas lado a lado, sem perder o contexto.",
    tag: "EXPLORAR",
  },
  {
    icon: "sliders",
    title: "Variáveis sob controle",
    text: "Ajuste receitas, custos, crescimento e limites com parâmetros transparentes.",
    tag: "MODELAR",
  },
  {
    icon: "chart",
    title: "Análises que explicam",
    text: "Entenda tendências e sensibilidade, indo além de números isolados em um dashboard.",
    tag: "COMPREENDER",
  },
  {
    icon: "risk",
    title: "Riscos antecipados",
    text: "Identifique pontos críticos antes que uma decisão saia do ambiente de simulação.",
    tag: "ANTECIPAR",
  },
  {
    icon: "target",
    title: "Decisões orientadas",
    text: "Conecte cada resultado ao objetivo original para escolher com mais confiança.",
    tag: "DECIDIR",
  },
  {
    icon: "clock",
    title: "Histórico preservado",
    text: "Recupere versões, premissas e resultados para acompanhar a evolução das decisões.",
    tag: "APRENDER",
  },
];

const scenarios = {
  otimista: {
    label: "Otimista",
    value: "R$ 2,48 mi",
    change: "+24,2%",
    chance: "68%",
    color: "#a477ff",
    path: "M0 112 C35 108 42 78 75 82 S120 55 150 60 S198 25 230 33 S275 13 320 10",
    area: "M0 112 C35 108 42 78 75 82 S120 55 150 60 S198 25 230 33 S275 13 320 10 V140 H0Z",
  },
  base: {
    label: "Base",
    value: "R$ 2,06 mi",
    change: "+8,7%",
    chance: "82%",
    color: "#7138e8",
    path: "M0 116 C35 112 45 101 75 102 S120 84 150 88 S197 67 230 72 S278 50 320 53",
    area: "M0 116 C35 112 45 101 75 102 S120 84 150 88 S197 67 230 72 S278 50 320 53 V140 H0Z",
  },
  pessimista: {
    label: "Pessimista",
    value: "R$ 1,72 mi",
    change: "−9,1%",
    chance: "76%",
    color: "#ef6b79",
    path: "M0 108 C35 111 47 118 75 114 S120 122 150 118 S194 126 230 120 S275 128 320 122",
    area: "M0 108 C35 111 47 118 75 114 S120 122 150 118 S194 126 230 120 S275 128 320 122 V140 H0Z",
  },
};

type ScenarioKey = keyof typeof scenarios;

function MiniChart() {
  return (
    <svg
      viewBox="0 0 540 230"
      role="img"
      aria-label="Projeção ilustrativa de três cenários ao longo de doze meses"
    >
      <defs>
        <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#8d5aff" stopOpacity=".24" />
          <stop offset="1" stopColor="#8d5aff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[42, 88, 134, 180].map((y) => (
        <path key={y} d={`M20 ${y}H520`} className="grid-line" />
      ))}
      <path
        d="M20 181C75 174 91 145 137 151s68-54 117-41 71-65 115-51 71-29 151-37V210H20Z"
        fill="url(#heroFill)"
      />
      <path
        d="M20 181C75 174 91 145 137 151s68-54 117-41 71-65 115-51 71-29 151-37"
        className="line line-primary"
      />
      <path
        d="M20 181c57-4 78-18 121-11s79-34 120-25 80-27 119-18 82-14 140-18"
        className="line line-muted"
      />
      <path
        d="M20 181c58 5 78 21 124 18s78 5 117 1 85 13 120 5 77 8 139 6"
        className="line line-danger"
      />
      <circle cx="369" cy="59" r="5" className="chart-dot" />
    </svg>
  );
}

function App() {
  const isProductRoute =
    window.location.pathname === "/login" ||
    window.location.pathname === "/register" ||
    window.location.pathname.startsWith("/app");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scenario, setScenario] = useState<ScenarioKey>("base");
  const current = scenarios[scenario];

  if (isProductRoute) return <ProductApp />;

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav-wrap">
          <Logo />
          <nav
            className={menuOpen ? "nav-links open" : "nav-links"}
            aria-label="Navegação principal"
          >
            {["Produto", "Como funciona", "Demonstração", "Recursos"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <a href="/login" className="text-link">
              Entrar
            </a>
            <a href="/register" className="button button-small">
              Começar agora <Icon name="arrow" size={15} />
            </a>
          </div>
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
      </header>

      <main>
        <section className="hero section" id="inicio">
          <div className="hero-glow" />
          <div className="container hero-grid">
            <div className="hero-copy reveal">
              <div className="eyebrow">
                <span className="pulse" /> Simulação <i /> Análise <i /> Decisão
              </div>
              <h1>
                Explore possibilidades.
                <br />
                <em>Decida com inteligência.</em>
              </h1>
              <p className="hero-lead">
                Transforme hipóteses em cenários, cenários em análises e análises em decisões mais
                inteligentes.
              </p>
              <div className="hero-actions">
                <a href="/register" className="button">
                  Começar agora <Icon name="arrow" />
                </a>
                <a href="#demonstracao" className="button button-secondary">
                  <Icon name="play" size={16} /> Ver demonstração
                </a>
              </div>
              <div className="hero-proof">
                <span>
                  <Icon name="check" size={15} /> Configuração intuitiva
                </span>
                <span>
                  <Icon name="check" size={15} /> Cenários comparáveis
                </span>
              </div>
            </div>

            <div
              className="hero-visual reveal delay-1"
              aria-label="Visualização ilustrativa do produto Scenara"
            >
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="data-panel main-panel">
                <div className="panel-top">
                  <div>
                    <span className="panel-kicker">PROJEÇÃO DE RECEITA</span>
                    <strong>Cenários comparados</strong>
                  </div>
                  <span className="live-badge">
                    <i /> Atualizado
                  </span>
                </div>
                <MiniChart />
                <div className="chart-labels">
                  <span>JAN</span>
                  <span>ABR</span>
                  <span>JUL</span>
                  <span>OUT</span>
                  <span>DEZ</span>
                </div>
                <div className="legend">
                  <span>
                    <i className="violet" /> Otimista
                  </span>
                  <span>
                    <i className="purple" /> Base
                  </span>
                  <span>
                    <i className="red" /> Pessimista
                  </span>
                </div>
              </div>
              <div className="data-panel floating-stat">
                <span>RESULTADO PROJETADO</span>
                <strong>R$ 2,48 mi</strong>
                <small>
                  ↗ 24,2% <b>vs. período anterior</b>
                </small>
              </div>
              <div className="data-panel confidence">
                <div className="confidence-ring">
                  <strong>82</strong>
                  <span>%</span>
                </div>
                <div>
                  <span>CONFIANÇA</span>
                  <strong>Alta precisão</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="container trusted">
            <span>Projetado para decisões complexas em</span>
            <div>
              <b>ESTRATÉGIA</b>
              <b>FINANÇAS</b>
              <b>OPERAÇÕES</b>
              <b>INOVAÇÃO</b>
            </div>
          </div>
        </section>

        <section className="section problem" id="produto">
          <div className="container problem-grid">
            <div>
              <span className="section-label">O PROBLEMA</span>
              <h2>
                Decisões importantes não deveriam depender de <em>uma única previsão.</em>
              </h2>
            </div>
            <div className="problem-copy">
              <p>
                O mundo real muda rápido. Planilhas estáticas e projeções lineares não revelam o que
                acontece quando múltiplas variáveis se movem ao mesmo tempo.
              </p>
              <p>
                A Scenara cria um ambiente seguro para explorar caminhos antes de comprometer
                recursos, tempo ou reputação.
              </p>
              <a href="#como-funciona">
                Conheça o processo <Icon name="arrow" size={16} />
              </a>
            </div>
          </div>
          <div className="container problem-metrics">
            <div>
              <span>01</span>
              <strong>Explore sem risco</strong>
              <p>Teste hipóteses em um ambiente controlado.</p>
            </div>
            <div>
              <span>02</span>
              <strong>Enxergue relações</strong>
              <p>Entenda como cada variável altera o todo.</p>
            </div>
            <div>
              <span>03</span>
              <strong>Escolha com contexto</strong>
              <p>Compare alternativas com os mesmos critérios.</p>
            </div>
          </div>
        </section>

        <section className="section process" id="como-funciona">
          <div className="container">
            <div className="section-heading centered">
              <span className="section-label">COMO FUNCIONA</span>
              <h2>
                Da pergunta à decisão, <em>sem perder o contexto.</em>
              </h2>
              <p>Um fluxo claro para transformar complexidade em caminhos comparáveis.</p>
            </div>
            <div className="steps">
              {steps.map(([n, title, text], index) => (
                <article className="step" key={n}>
                  <div className="step-number">{n}</div>
                  <div className="step-line">
                    {index < steps.length - 1 && <Icon name="chevron" size={14} />}
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section features" id="recursos">
          <div className="container">
            <div className="section-heading split">
              <div>
                <span className="section-label">RECURSOS</span>
                <h2>
                  Inteligência para cada etapa da <em>decisão.</em>
                </h2>
              </div>
              <p>
                Ferramentas conectadas para modelar incertezas, comparar possibilidades e comunicar
                resultados.
              </p>
            </div>
            <div className="feature-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-icon">
                    <Icon name={feature.icon} />
                  </div>
                  <span>{feature.tag}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                  <a href="#demonstracao" aria-label={`Ver ${feature.title}`}>
                    <Icon name="arrow" size={17} />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section demo" id="demonstracao">
          <div className="container">
            <div className="section-heading centered">
              <span className="section-label">DEMONSTRAÇÃO INTERATIVA</span>
              <h2>
                Uma decisão. <em>Três futuros possíveis.</em>
              </h2>
              <p>
                Alterne entre cenários para visualizar como diferentes premissas podem afetar o
                resultado.
              </p>
            </div>
            <div className="demo-window">
              <div className="demo-sidebar">
                <Logo compact />
                <span className="demo-side-line active" />
                <span className="demo-side-line" />
                <span className="demo-side-line short" />
                <div className="demo-side-bottom">
                  <span />
                  <span />
                </div>
              </div>
              <div className="demo-content">
                <div className="demo-header">
                  <div>
                    <span>PROJETO / EXPANSÃO 2025</span>
                    <strong>Projeção de crescimento</strong>
                  </div>
                  <span className="illustrative">Dados ilustrativos</span>
                </div>
                <div className="scenario-tabs" role="tablist" aria-label="Selecionar cenário">
                  {(Object.keys(scenarios) as ScenarioKey[]).map((key) => (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={scenario === key}
                      className={scenario === key ? "active" : ""}
                      onClick={() => setScenario(key)}
                    >
                      <i style={{ background: scenarios[key].color }} /> {scenarios[key].label}
                    </button>
                  ))}
                </div>
                <div className="demo-grid">
                  <div className="demo-chart">
                    <div className="demo-chart-head">
                      <div>
                        <span>RECEITA PROJETADA</span>
                        <strong>{current.value}</strong>
                      </div>
                      <b style={{ color: current.color }}>{current.change}</b>
                    </div>
                    <svg
                      viewBox="0 0 320 140"
                      role="img"
                      aria-label={`Projeção ilustrativa do cenário ${current.label}`}
                    >
                      <defs>
                        <linearGradient id="demoFill" x1="0" y1="0" x2="0" y2="1">
                          <stop stopColor={current.color} stopOpacity=".28" />
                          <stop offset="1" stopColor={current.color} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {[25, 60, 95, 130].map((y) => (
                        <path key={y} d={`M0 ${y}H320`} className="grid-line" />
                      ))}
                      <path d={current.area} fill="url(#demoFill)" className="scenario-area" />
                      <path
                        d={current.path}
                        fill="none"
                        stroke={current.color}
                        strokeWidth="2.5"
                        className="scenario-path"
                      />
                    </svg>
                    <div className="chart-labels">
                      <span>JAN</span>
                      <span>MAR</span>
                      <span>JUN</span>
                      <span>SET</span>
                      <span>DEZ</span>
                    </div>
                  </div>
                  <div className="demo-insights">
                    <span className="panel-kicker">LEITURA DO CENÁRIO</span>
                    <h3>{current.label}</h3>
                    <p>
                      {scenario === "otimista"
                        ? "Maior aquisição e retenção sustentam uma trajetória acima do esperado."
                        : scenario === "base"
                          ? "Crescimento consistente com premissas atuais e exposição moderada a riscos."
                          : "Custos pressionados e menor aquisição reduzem a velocidade de crescimento."}
                    </p>
                    <div className="insight-row">
                      <span>Confiança estimada</span>
                      <strong>{current.chance}</strong>
                    </div>
                    <div className="progress">
                      <i style={{ width: current.chance, background: current.color }} />
                    </div>
                    <div className="insight-note">
                      <Icon name="spark" size={16} />
                      <span>Altere as premissas para explorar novas possibilidades.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section benefits">
          <div className="container benefits-grid">
            <div className="section-heading">
              <span className="section-label">POR QUE SCENARA</span>
              <h2>
                Mais clareza onde antes havia apenas <em>incerteza.</em>
              </h2>
            </div>
            <div className="benefit-list">
              {[
                [
                  "Compare o que realmente importa",
                  "Avalie cenários com critérios consistentes e veja diferenças com precisão.",
                ],
                [
                  "Antecipe impactos e riscos",
                  "Encontre variáveis críticas e limites antes de executar a decisão.",
                ],
                [
                  "Comunique decisões melhores",
                  "Transforme análises complexas em narrativas que todos podem compreender.",
                ],
              ].map(([title, text], i) => (
                <article key={title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section final-cta" id="cta">
          <div className="cta-orbit" />
          <div className="container cta-content">
            <div className="cta-mark">
              <Logo compact />
            </div>
            <span className="section-label">COMECE A EXPLORAR</span>
            <h2>
              Suas próximas decisões
              <br />
              <em>começam aqui.</em>
            </h2>
            <p>Transforme incerteza em possibilidades claras e tome decisões com mais confiança.</p>
            <a className="button button-light" href="mailto:contato@scenara.com">
              Quero conhecer a Scenara <Icon name="arrow" />
            </a>
            <small>
              Fale com nosso time para receber acesso quando a plataforma estiver disponível.
            </small>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-main">
          <div className="footer-brand">
            <Logo />
            <p>
              Explore possibilidades.
              <br />
              Decida com inteligência.
            </p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Produto</strong>
              <a href="#recursos">Recursos</a>
              <a href="#como-funciona">Como funciona</a>
              <a href="#demonstracao">Demonstração</a>
            </div>
            <div>
              <strong>Empresa</strong>
              <a href="mailto:contato@scenara.com">Contato</a>
              <a href="#inicio">Sobre</a>
              <a href="#inicio">Manifesto</a>
            </div>
            <div>
              <strong>Legal</strong>
              <a href="#inicio">Privacidade</a>
              <a href="#inicio">Termos</a>
              <a href="#inicio">Segurança</a>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2025 Scenara. Todos os direitos reservados.</span>
          <span className="system-status">
            <i /> Sistemas operacionais
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
