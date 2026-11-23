import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import { usePageMeta } from "@/contexts/PageMetaContext";
import { useUpdateProfile } from "@/hooks/queries";
import { getErrorMessage } from "@/services/api";
import { userService } from "@/services/user.service";
import { profileSchema, type ProfileValues } from "@/schemas/auth.schema";
import { formatDate } from "@/utils/format";

export function SettingsPage() {
  usePageMeta("CONTA", "Configurações");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const update = useUpdateProfile();
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email });
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    try {
      await update.mutateAsync({ name: values.name.trim(), email: values.email.trim() });
      toast.success("Dados atualizados.");
    } catch (e) {
      setError(getErrorMessage(e));
    }
  });

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await userService.remove();
      logout();
      toast.success("Conta excluída.");
      navigate("/", { replace: true });
    } catch (e) {
      toast.error(getErrorMessage(e));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="product-page narrow-page">
      <div className="form-page-heading">
        <span className="step-badge">01</span>
        <div>
          <h2>Seus dados</h2>
          <p>{user ? `Conta criada em ${formatDate(user.createdAt)}.` : "Carregando…"}</p>
        </div>
      </div>
      <form className="surface-panel product-form" onSubmit={onSubmit} noValidate>
        <label>
          <span>
            Nome <b>*</b>
          </span>
          <input autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </label>
        <label>
          <span>
            E-mail <b>*</b>
          </span>
          <small>Usado para entrar na plataforma.</small>
          <input type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </label>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="form-actions">
          <button className="product-primary" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? (
              <>
                <span className="spinner" /> Salvando
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
        </div>
      </form>

      <section className="surface-panel product-form danger-zone">
        <div className="form-section-title">
          <span>!</span>
          <div>
            <h3>Excluir conta</h3>
            <p>Remove seu acesso à Scenara. Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <div className="form-actions">
          <button className="product-secondary danger" onClick={() => setConfirmDelete(true)}>
            Excluir minha conta
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir sua conta?"
        description="Você perderá o acesso imediatamente. Esta ação não pode ser desfeita."
        confirmLabel="Excluir conta"
        danger
        pending={deleting}
        onConfirm={deleteAccount}
      />
    </div>
  );
}
