type Props = {
  onCancel: () => void;
  submitting?: boolean;
  disabled?: boolean;
  submitLabel?: string;
  formId?: string;
};

export default function FormActions({ onCancel, submitting = false, disabled = false, submitLabel = 'Guardar', formId }: Props) {
  return (
    <div className="grid md:grid-cols-2 mt-8">
      <div />
      <div className="flex justify-end">
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50" disabled={submitting}>Cancelar</button>
          <button form={formId} type="submit" disabled={disabled || submitting} className="px-6 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 disabled:opacity-50">{submitting ? 'Guardando...' : submitLabel}</button>
        </div>
      </div>
    </div>
  );
}
