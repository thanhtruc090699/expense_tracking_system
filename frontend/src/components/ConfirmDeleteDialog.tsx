import { Trash2, X } from 'lucide-react';
import './ConfirmDeleteDialog.css';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDeleteDialog({
  isOpen,
  title = 'Delete item?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-delete-backdrop" onClick={onCancel}>
      <section
        className="confirm-delete-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="confirm-delete-close"
          onClick={onCancel}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="confirm-delete-icon">
          <Trash2 size={24} />
        </div>

        <h2 id="confirm-delete-title">{title}</h2>
        <p>{message}</p>

        <div className="confirm-delete-actions">
          <button
            type="button"
            className="confirm-delete-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="confirm-delete-confirm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
