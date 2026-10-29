import useTranslations from "../hooks/useTranslations";

interface ConfirmProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  setOpen: (open: boolean) => void;
  // Defaults are the generic Cancel / Confirm.
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  // For a decision with only one way forward.
  hideCancel?: boolean;
  // A third button that backs out of the decision itself, e.g. "Cancel archiving".
  dismissLabel?: string;
  onDismiss?: () => void;
}

export default function ConfirmModal({
  message,
  open,
  setOpen,
  onConfirm,
  confirmLabel,
  cancelLabel,
  onCancel,
  hideCancel,
  dismissLabel,
  onDismiss,
}: ConfirmProps) {
  const translation = useTranslations().confirmModal;

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-[4px] z-999">
      <div className="bg-fisma-blue p-4 shadow-2xl lg w-96">
        <h2 className="text-white text-2xl font-medium text-center overflow-hidden overflow-ellipsis bg-fisma-dark-blue mb-4 -mx-4 -mt-4 px-4 py-4">
          {message}
        </h2>
        <div className="flex flex-wrap justify-evenly items-center gap-2">
          {!hideCancel && (
            <button
              type="button"
              onClick={() => {
                onCancel?.();
                setOpen(false);
              }}
              className="min-w-30 text-white bg-fisma-dark-blue hover:brightness-70 px-4 py-2"
            >
              {cancelLabel ?? translation.cancel}
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={() => {
                onDismiss();
                setOpen(false);
              }}
              className="min-w-30 text-white bg-fisma-dark-blue hover:brightness-70 px-4 py-2"
            >
              {dismissLabel ?? translation.cancel}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            className="min-w-30 text-white bg-fisma-dark-blue hover:brightness-70 px-4 py-2"
          >
            {confirmLabel ?? translation.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
