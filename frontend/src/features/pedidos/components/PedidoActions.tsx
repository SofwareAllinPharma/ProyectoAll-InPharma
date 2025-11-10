import { useState } from 'react';
import Button from '../../../components/ui/Button';
import ConfirmModal from '../../../components/ui/modales/ConfirmModal';
import { PedidoService } from '../services/pedido.service';
import type { Pedido } from '../types/pedido.types';

type Props = {
  pedido: Pedido;
  onRefresh?: () => Promise<void> | void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
};

// Small helper: normalize and map backend estado to a canonical token
const normalizeEstado = (s?: string) =>
  String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '')
    .toLowerCase();

export default function PedidoActions({ pedido, onRefresh, onShowToast }: Props) {
  const [busy, setBusy] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const estadoNorm = normalizeEstado(pedido.cambioActual?.estado?.nombre);

  const isCreado = estadoNorm.includes('cread') || estadoNorm.includes('pendient');
  const isEnElaboracion = estadoNorm.includes('enelaboracion') || estadoNorm.includes('enproceso') || estadoNorm.includes('asign');

  const runAndRefresh = async (fn: () => Promise<unknown>, successMsg?: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      if (successMsg && onShowToast) {
        onShowToast(successMsg, 'success');
      }
      if (onRefresh) await onRefresh();
    } catch (e) {
      if (onShowToast) {
        onShowToast((e as Error)?.message || 'Error ejecutando acción', 'error');
      }
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

  return (
    <>
      <div className="flex flex-col gap-2">
        {isCreado && !pedido.estaAsignado && (
          <>
            <Button
              onClick={() =>
                openConfirm(
                  'Tomar pedido',
                  '¿Está seguro que desea tomar este pedido?',
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
          </>
        )}

        {isEnElaboracion && (
          <>
            <Button
              onClick={() =>
                openConfirm(
                  'Finalizar elaboración',
                  '¿Está seguro que desea marcar este pedido como finalizado?',
                  () => {
                    closeConfirm();
                    void runAndRefresh(() => PedidoService.finalizarElaboracion(pedido.numPedido), 'Pedido finalizado exitosamente');
                  }
                )
              }
              disabled={busy}
              ariaLabel="Finalizar elaboración"
            >
              Finalizar elaboración
            </Button>
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
          </>
        )}
      </div>

      <ConfirmModal
        open={confirmModal.isOpen}
        onCancel={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.message}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
      />
    </>
  );
}

