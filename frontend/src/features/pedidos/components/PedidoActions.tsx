import { useState } from 'react';
import Button from '../../../components/ui/Button';
import FinalizarElaboracionModal from './FinalizarElaboracionModal';
import { PedidoService } from '../services/pedido.service';
import type { Pedido } from '../types/pedido.types';
import { useAuth } from '../../../lib/auth';
import Modal from '../../../components/ui/modales/Modal';
import ModalHeader from '../../../components/ui/modales/ModalHeader';

type Props = {
  pedido: Pedido;
  onRefresh?: () => Promise<void> | void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
};

const normalizeEstado = (s?: string) =>
  String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '')
    .toLowerCase();

type PedidoConfirmModal = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
};

export default function PedidoActions({ pedido, onRefresh, onShowToast }: Props) {
  const { user } = useAuth();
  const isTecnico = user?.roles.includes('TECNICO');
  const canCancel = !isTecnico;

  const [busy, setBusy] = useState(false);
  const [finalizarModalOpen, setFinalizarModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<PedidoConfirmModal>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const estadoNorm = normalizeEstado(pedido.cambioActual?.estado?.nombre);
  const isCreado = estadoNorm.includes('cread') || estadoNorm.includes('pendient');
  const isEnElaboracion = estadoNorm.includes('enelaboracion') || estadoNorm.includes('enproceso') || estadoNorm.includes('asign');

  // Compute user's full name for display in modals
  const getUserName = (): string => {
    try {
      const u: any = user as any;
      if (u?.persona) {
        const full = `${(u.persona.nombre || '').trim()} ${(u.persona.apellido || '').trim()}`.trim();
        if (full) return full;
      }
    } catch (_) {}
    if (user?.name) return user.name;
    if (user?.mail) return String(user.mail).split('@')[0];
    return '';
  };

  const runAndRefresh = async (fn: () => Promise<unknown>, successMsg?: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      if (successMsg && onShowToast) onShowToast(successMsg, 'success');
      if (onRefresh) await onRefresh();
    } catch (e) {
      if (onShowToast) onShowToast((e as Error)?.message || 'Error ejecutando acción', 'error');
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const nombre = getUserName();

  return (
    <>
      <div className="flex flex-col gap-2">
        {isCreado && !pedido.estaAsignado && (
          <>
            <Button
              onClick={() =>
                openConfirm(
                  'Tomar pedido',
                  '¿Confirma que desea tomar este pedido?',
                  () => {
                    closeConfirm();
                    void runAndRefresh(() => PedidoService.tomarPedido(pedido.numPedido), 'Pedido tomado exitosamente');
                  }
                )
              }
              disabled={busy}
              ariaLabel="Tomar pedido"
            >
              Tomar pedido
            </Button>

            {canCancel && (
              <Button
                onClick={() =>
                  openConfirm(
                    'Cancelar pedido',
                    '¿Está seguro que desea cancelar este pedido? Esta acción no se puede deshacer.',
                    () => {
                      closeConfirm();
                      void runAndRefresh(() => PedidoService.cancelar(pedido.numPedido), 'Pedido cancelado');
                    }
                  )
                }
                disabled={busy}
                variant="outline"
                ariaLabel="Cancelar pedido"
              >
                Cancelar pedido
              </Button>
            )}
          </>
        )}

        {isEnElaboracion && (
          <>
            <Button
              onClick={() => setFinalizarModalOpen(true)}
              disabled={busy}
              ariaLabel="Finalizar elaboración"
            >
              Finalizar elaboración
            </Button>
            {canCancel && (
              <Button
                onClick={() =>
                  openConfirm(
                    'Cancelar pedido',
                    '¿Está seguro que desea cancelar este pedido? Esta acción no se puede deshacer.',
                    () => {
                      closeConfirm();
                      void runAndRefresh(() => PedidoService.cancelar(pedido.numPedido), 'Pedido cancelado');
                    }
                  )
                }
                disabled={busy}
                variant="outline"
                ariaLabel="Cancelar pedido"
              >
                Cancelar pedido
              </Button>
            )}
          </>
        )}
      </div>

      <FinalizarElaboracionModal
        isOpen={finalizarModalOpen}
        cantEstimadaPaquetes={pedido.cantAProducir_paquetes}
        onCancel={() => setFinalizarModalOpen(false)}
        onConfirm={(cantidadRealPaquetes) => {
          setFinalizarModalOpen(false);
          void runAndRefresh(
            () => PedidoService.finalizarElaboracion(pedido.numPedido, cantidadRealPaquetes),
            'Pedido finalizado exitosamente'
          );
        }}
      />

      {/* Modal de confirmación con nombre de usuario pre-llenado */}
      <Modal
        open={confirmModal.isOpen}
        onClose={closeConfirm}
        containerClass="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden"
      >
        <ModalHeader>{confirmModal.title}</ModalHeader>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">{confirmModal.message}</p>

          {nombre && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Responsable</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 font-medium">
                {nombre}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-xl">
          <button
            type="button"
            onClick={closeConfirm}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmModal.onConfirm}
            disabled={busy}
            className="px-4 py-2 text-sm font-medium text-white bg-[#5d5448] rounded-lg hover:bg-[#4a433e] disabled:opacity-50 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </Modal>
    </>
  );
}
