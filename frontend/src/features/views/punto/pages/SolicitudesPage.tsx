import { useEffect, useState } from 'react';
import { DepositoService } from '../../../deposito/services/deposito.service';
import MovimientosTab from '../../../movimientos/pages/MovimientosTab';
import LoadingPanel from '../../../../components/LoadingPanel';
import PageShell from '../../../../components/PageShell';
import RegistroMovimientoModal from '../../../movimientos/components/alta/RegistroMovimientoModal';
import Button from '../../../../components/ui/Button';
import { FaPlus } from 'react-icons/fa';

export default function SolicitudesPage() {
  const [farmaciaId, setFarmaciaId] = useState<number | undefined>(undefined);
  const [loadingId, setLoadingId] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [farmaciaName, setFarmaciaName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const farmacia = await DepositoService.getById(1);
        if (farmacia) {
          setFarmaciaId(farmacia.id);
          setFarmaciaName(farmacia.nombre);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingId(false);
      }
    })();
  }, []);

  if (loadingId) return <LoadingPanel />;
  if (!farmaciaId) return <div>No se encontró el depósito FARMACIA.</div>;

  return (
    <PageShell 
      title="Solicitudes de Traslado" 
      subtitle="Gestionar traslados y recepciones"
      extraActions={
        <Button variant="solid" onClick={() => setShowModal(true)} icon={<FaPlus />}>
          Nueva Solicitud
        </Button>
      }
      modals={
        <RegistroMovimientoModal 
          open={showModal} 
          onClose={() => setShowModal(false)} 
          // We want to pre-fill destination as Farmacia for incoming requests
          // But RegistroMovimientoModal currently only supports defaultDepOrigen.
          // We will need to update RegistroMovimientoModal to support defaultDepDestino.
          // For now, we pass it, and we will update the component next.
          // @ts-ignore
          defaultDepDestino={{ id: farmaciaId, nombre: farmaciaName }}
        />
      }
    >
      <MovimientosTab idDeposito={farmaciaId} />
    </PageShell>
  );
}
