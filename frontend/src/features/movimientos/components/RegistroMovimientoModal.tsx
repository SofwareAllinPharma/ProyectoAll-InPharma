import Button from '../../../components/ui/Button';

type Props = {
    open: boolean;
    onClose: () => void;
};

export default function RegistroMovimientoModal({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Registrar movimiento</h3>
                </div>

                <div className="text-sm text-gray-600">
                    Aquí irá el formulario para registrar un nuevo movimiento (placeholder).
                </div>

                <div className="mt-6 flex justify-end">
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
            </div>
        </div>
    );
}