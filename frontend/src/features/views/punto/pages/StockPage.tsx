import { useDepositos } from '../../../movimientos/hooks/useDepositos';
import { findDepositoByRole } from '../../../inventario/depositosConfig';
import StockCajasTab from '../../../inventario/components/StockCajasTab';
import LoadingPanel from '../../../../components/LoadingPanel';
import PageShell from '../../../../components/PageShell';

export default function StockPage() {
  const { depositos, loading, error } = useDepositos();
  const estanteria = findDepositoByRole(depositos.filter(d => d.estado !== false), 'estanteria');
  if (loading) return <LoadingPanel />;
  return (
    <PageShell title="Stock en Punto de Venta" subtitle="Unidades por lote en el depósito de venta">
      {error ? <p role="alert" className="text-red-700">{error}</p> : !estanteria ? (
        <p role="alert" className="text-amber-700">No se encontró el depósito de venta Estantería activo. Pedile a Administración que revise la configuración de depósitos.</p>
      ) : <StockCajasTab depositoId={estanteria.id} />}
    </PageShell>
  );
}
