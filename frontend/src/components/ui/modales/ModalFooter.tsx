type Props = {
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitting?: boolean;
  disabledSubmit?: boolean;
};

export default function ModalFooter({
  onCancel,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  submitting = false,
  disabledSubmit = false,
}: Props) {
  return (
    // Use no horizontal padding here so the parent container's padding controls alignment
    <div className="flex gap-3 pt-4 px-0 py-4 justify-center sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        disabled={submitting}
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={disabledSubmit || submitting}
        className="px-6 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 disabled:opacity-50"
      >
        {submitting ? "Guardando..." : submitLabel}
      </button>
    </div>
  );
}
