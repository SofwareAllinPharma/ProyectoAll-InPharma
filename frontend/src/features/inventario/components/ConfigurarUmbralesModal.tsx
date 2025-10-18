import { useEffect, useMemo, useState } from 'react';
import { InventarioService } from '../services/inventario.service';
import type { InventarioProducto } from '../services/inventario.service';
import Modal from '../../../components/ui/modales/Modal';
import ModalHeader from '../../../components/ui/modales/ModalHeader';

type Props = {
  open: boolean;
  depositName: string;
  depositoId: number;
  onClose: () => void;
  onSuccess?: () => void;
};

function UmbralRow({ p, value, onChange, disabled }: { p: InventarioProducto; value: number | '' ; onChange: (id:number, v:string)=>void; disabled?: boolean }){
  return (
    <tr key={p.idProducto} className="hover:bg-gray-50">
      <td className="px-4 py-3"><span className="font-medium text-[#3E3529]">{p.nombreComercial}</span></td>
      <td className="px-4 py-3 text-sm">{p.cantidadProducto == null ? '-' : p.cantidadProducto}</td>
      <td className="px-4 py-3">
        <input type="number" min={0} step={1} value={value ?? ''} onChange={e=>onChange(p.idProducto, e.target.value)} className="w-28 px-2 py-1 border rounded-md text-sm border-gray-300 focus:ring-[#5d5448] focus:border-[#5d5448]" placeholder="-" disabled={disabled} />
      </td>
    </tr>
  );
}

export default function ConfigurarUmbralesModal({ open, depositName, depositoId, onClose, onSuccess }: Props) {
  const [inventario, setInventario] = useState<InventarioProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inventarioOrdenado = useMemo(()=>[...inventario].sort((a,b)=>{const aSin=a.umbralMin==null?0:1;const bSin=b.umbralMin==null?0:1; return aSin-bSin||a.nombreComercial.localeCompare(b.nombreComercial)}),[inventario]);

  useEffect(()=>{
    if(!open){ setInventario([]); return }
    setLoading(true); setError(null);
    InventarioService.getProductosConUmbral(depositoId).then(d=>setInventario(d)).catch((err)=>setError(err?.message||'Error al cargar inventario')).finally(()=>setLoading(false));
  },[open, depositoId]);

  const [umbralMin, setUmbralMin] = useState<Record<number, number | ''>>({});
  useEffect(()=>{ if(open && inventario.length>0){ const init:Record<number, number|''>={}; inventario.forEach(p=>init[p.idProducto]=p.umbralMin??''); setUmbralMin(init); } },[open, inventario]);

  const handleUmbralChange = (idProducto:number, value:string)=>{ const num = value===''? '': Math.max(0, Number(value)); setUmbralMin(prev=>({...prev, [idProducto]: num})); }

  const handleSave = async ()=>{
    const items = Object.entries(umbralMin).filter(([_,v])=>v!=='' && !isNaN(Number(v))).map(([id,v])=>({ idProducto: Number(id), umbralMin: Number(v) }));
    if(!items.length) return;
    setLoading(true); setError(null);
    try{
      await InventarioService.bulkUpdateUmbrales(depositoId, items);
      onSuccess?.(); onClose();
    }catch(e:any){ setError(e?.message||'Error al guardar umbrales'); }
    finally{ setLoading(false); }
  }

  return (
    <Modal open={open} onClose={onClose} containerClass="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden">
      <ModalHeader>Configurar Umbrales – {depositName}</ModalHeader>
      <div className="p-6">
        <p className="text-gray-600 mb-4">Configura el <span className="font-semibold">umbral mínimo</span> para cada producto en este depósito.<br/>El sistema alertará cuando el stock esté por debajo del umbral configurado.</p>

        <form onSubmit={e=>{ e.preventDefault(); handleSave(); }}>
          <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-md border">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0 z-10"><tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Actual</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Umbral mínimo</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? <tr><td colSpan={3} className="text-center py-8 text-gray-400">Cargando productos...</td></tr>
                  : error ? <tr><td colSpan={3} className="text-center py-8 text-red-400">{error}</td></tr>
                  : inventarioOrdenado.length===0 ? <tr><td colSpan={3} className="text-center py-8 text-gray-400">No hay productos registrados.</td></tr>
                  : inventarioOrdenado.map(p=> <UmbralRow key={p.idProducto} p={p} value={umbralMin[p.idProducto]} onChange={handleUmbralChange} disabled={loading} />)
                }
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 mt-5">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 disabled:opacity-50" disabled={loading}>Guardar umbrales</button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
