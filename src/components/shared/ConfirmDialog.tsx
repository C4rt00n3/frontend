import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  danger = false,
  pending = false,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <Dialog.Title className="dialog-title">{title}</Dialog.Title>
          <Dialog.Description className="dialog-description">{description}</Dialog.Description>
          {children}
          <div className="dialog-actions">
            <Dialog.Close asChild>
              <button className="product-secondary" disabled={pending}>
                Cancelar
              </button>
            </Dialog.Close>
            <button
              className={danger ? "product-primary danger" : "product-primary"}
              onClick={onConfirm}
              disabled={pending}
            >
              {pending && <span className="spinner" />} {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
