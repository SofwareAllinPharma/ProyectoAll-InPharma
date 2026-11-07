import PageShell from '../../../../components/PageShell';
import MovimientosCajasTab from '../../../inventario/components/MovimientosCajasTab';
import { Link } from 'react-router-dom';

export default function SolicitudesPage() {
  return <PageShell title="Traslados de cajas" subtitle="Historial confirmado entre depósitos">
    <p className="text-sm mb-4">Los traslados se confirman con dos responsables desde <Link className="underline" to="/puntoventa/depositos">Depósitos</Link>. No se genera una solicitud pendiente separada.</p>
    <MovimientosCajasTab />
  </PageShell>;
}
