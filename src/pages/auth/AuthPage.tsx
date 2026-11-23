import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { Glyph } from "@/components/ui/Glyph";
import { ProductLogo } from "@/components/ui/ProductLogo";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/services/api";
import { loginSchema, registerSchema, type LoginValues, type RegisterValues } from "@/schemas/auth.schema";

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null;
}

function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  // A navegação após o login é feita pelo GuestRoute, que respeita a página de origem.
  const onSubmit = handleSubmit(async (values) => {
    setError("");
    try {
      await login(values);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <label>
        E-mail
        <input type="email" autoComplete="email" placeholder="voce@empresa.com" {...register("email")} aria-invalid={!!errors.email} />
        <FieldError message={errors.email?.message} />
      </label>
      <label>
        Senha
        <div className="password-wrap">
          <input type="password" autoComplete="current-password" placeholder="Sua senha" {...register("password")} aria-invalid={!!errors.password} />
        </div>
        <FieldError message={errors.password?.message} />
      </label>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button className="product-primary auth-submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="spinner" /> Validando acesso
          </>
        ) : (
          <>
            Entrar na plataforma <Glyph name="arrow" />
          </>
        )}
      </button>
    </form>
  );
}

function RegisterForm() {
  const { register: signUp } = useAuth();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setError("");
    try {
      await signUp({ name: name.trim(), email: email.trim(), password });
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <label>
        Nome completo
        <input autoComplete="name" placeholder="Como podemos chamar você?" {...register("name")} aria-invalid={!!errors.name} />
        <FieldError message={errors.name?.message} />
      </label>
      <label>
        E-mail
        <input type="email" autoComplete="email" placeholder="voce@empresa.com" {...register("email")} aria-invalid={!!errors.email} />
        <FieldError message={errors.email?.message} />
      </label>
      <label>
        Senha
        <div className="password-wrap">
          <input type="password" autoComplete="new-password" placeholder="Mínimo de 6 caracteres" {...register("password")} aria-invalid={!!errors.password} />
        </div>
        <FieldError message={errors.password?.message} />
      </label>
      <label>
        Confirmar senha
        <input type="password" autoComplete="new-password" placeholder="Digite novamente" {...register("confirm")} aria-invalid={!!errors.confirm} />
        <FieldError message={errors.confirm?.message} />
      </label>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <button className="product-primary auth-submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="spinner" /> Criando sua conta
          </>
        ) : (
          <>
            Criar conta <Glyph name="arrow" />
          </>
        )}
      </button>
    </form>
  );
}

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const isRegister = mode === "register";

  useEffect(() => {
    document.title = `${isRegister ? "Criar conta" : "Entrar"} · Scenara`;
  }, [isRegister]);

  return (
    <div className="auth-page">
      <div className="auth-ambient" />
      <header className="auth-header">
        <ProductLogo />
        <button onClick={() => navigate("/")} className="quiet-link">
          Voltar ao site
        </button>
      </header>
      <main className="auth-main">
        <section className="auth-intro">
          <span className="auth-kicker">
            <i /> AMBIENTE DE DECISÃO
          </span>
          <h1>{isRegister ? "Comece a explorar futuros possíveis." : "Continue de onde suas decisões pararam."}</h1>
          <p>
            {isRegister
              ? "Crie seu espaço para estruturar hipóteses, comparar cenários e decidir com mais contexto."
              : "Acesse seus projetos, premissas e simulações em um único ambiente."}
          </p>
          <div className="auth-visual" aria-hidden="true">
            <div className="auth-node main">
              <span>DECISÃO</span>
              <strong>Seu próximo passo</strong>
            </div>
            <div className="auth-node one">
              <i className="green" /> Otimista
            </div>
            <div className="auth-node two">
              <i /> Base
            </div>
            <div className="auth-node three">
              <i className="amber" /> Conservador
            </div>
            <svg viewBox="0 0 500 200">
              <path d="M250 45C250 100 105 78 105 144M250 45v99M250 45c0 55 145 33 145 99" />
            </svg>
          </div>
        </section>
        <section className="auth-card">
          <div className="auth-card-head">
            <span>{isRegister ? "CRIAR CONTA" : "BEM-VINDO DE VOLTA"}</span>
            <h2>{isRegister ? "Crie seu acesso" : "Entre na Scenara"}</h2>
            <p>{isRegister ? "Configure sua conta em poucos segundos." : "Use seus dados para acessar o ambiente."}</p>
          </div>
          {isRegister ? <RegisterForm /> : <LoginForm />}
          <div className="auth-switch">
            {isRegister ? "Já possui uma conta?" : "Ainda não possui uma conta?"}{" "}
            <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Fazer login" : "Criar conta"}</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
