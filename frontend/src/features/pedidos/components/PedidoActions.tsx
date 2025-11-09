import { useState } from 'react';
import Button from '../../../components/ui/Button';
import { PedidoService } from '../services/pedido.service';
import type { Pedido } from '../types/pedido.types';
import { useToast } from '../../../components/ui/toast/ToastContext';

type Props = {
  pedido: Pedido;
  onRefresh?: () => Promise<void> | void;
};

// Small helper: normalize and map backend estado to a canonical token
const normalizeEstado = (s?: string) =>
  String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '')
    .toLowerCase();

export default function PedidoActions({ pedido, onRefresh }: Props) {
  const [busy, setBusy] = useState(false);
  const { show } = useToast();

  const estadoNorm = normalizeEstado(pedido.cambioActual?.estado?.nombre);

  const isCreado = estadoNorm.includes('cread') || estadoNorm.includes('pendient');
  const isEnElaboracion = estadoNorm.includes('enelaboracion') || estadoNorm.includes('enproceso') || estadoNorm.includes('asign');

  const runAndRefresh = async (fn: () => Promise<unknown>, successMsg?: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      if (successMsg) show?.({ message: successMsg, type: 'success' });
      if (onRefresh) await onRefresh();
    } catch (e) {
      show?.({ message: (e as Error)?.message || 'Error ejecutando acción', type: 'error' });
      throw e;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-2">
      {isCreado && !pedido.estaAsignado && (
        <Button
          onClick={() => runAndRefresh(() => PedidoService.tomarPedido(pedido.numPedido), 'Pedido tomado')}
          disabled={busy}
          ariaLabel="Tomar pedido"
        >
          Tomar pedido
        </Button>
      )}

      {isEnElaboracion && (
        <>
          <Button
            onClick={() => runAndRefresh(() => PedidoService.finalizarElaboracion(pedido.numPedido), 'Elaboración finalizada')}
            disabled={busy}
            ariaLabel="Finalizar elaboración"
          >
            Finalizar elaboración
          </Button>
          <Button
            onClick={() => runAndRefresh(() => PedidoService.cancelar(pedido.numPedido), 'Pedido cancelado')}
            disabled={busy}
            variant="outline"
            ariaLabel="Cancelar pedido"
          >
            Cancelar pedido
          </Button>
        </>
      )}
    </div>
  );
}
