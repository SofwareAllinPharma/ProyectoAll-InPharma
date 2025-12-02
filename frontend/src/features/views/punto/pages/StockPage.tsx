import { useEffect, useState } from 'react';
import useDepositoDetail from '../../../deposito/hooks/useDepositoDetail';
import DepositoDetailSummary from '../../../deposito/components/DepositoDetailSummary';
import LoadingPanel from '../../../../components/LoadingPanel';
import PageShell from '../../../../components/PageShell';

export default function StockPage() {
  const [farmaciaId, setFarmaciaId] = useState<string | undefined>(undefined);
  const [loadingId, setLoadingId] = useState(true);

  useEffect(() => {
    setFarmaciaId('1');
    setLoadingId(false);
  }, []);

  if (loadingId) return <LoadingPanel />;
  if (!farmaciaId) return <div>No se encontró el depósito FARMACIA.</div>;

  return <StockContent id={farmaciaId} />;
}

function StockContent({ id }: { id: string }) {
  const {
    resumen,
    loadingResumen,
    inventario,
    loadingInventario,
  } = useDepositoDetail(id);

  return (
    <PageShell title="Stock en Punto de Venta" subtitle="Inventario actual">
      <DepositoDetailSummary
        resumen={resumen}
        loadingResumen={loadingResumen}
        inventario={inventario}
        loadingInventario={loadingInventario}
      />
    </PageShell>
  );
}
