import Modal from '../../../components/ui/modales/Modal';
import ModalHeader from '../../../components/ui/modales/ModalHeader';
import ModalFooter from '../../../components/ui/modales/ModalFooter';
import SearchSelect from '../../../components/ui/SearchSelect';
import NumberField from '../../../components/form/NumberField';
import { useState } from 'react';
import type { TipoMovimiento } from '../types/movimiento.types';
import { useEffect } from 'react';
import { DepositoService } from '../../deposito/services/deposito.service';
import type { Deposito } from '../../deposito/types/deposito.types';
import { InventarioService, type InventarioProducto } from '../../inventario/services/inventario.service';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function RegistroMovimientoModal({ open, onClose }: Props) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<{ key: string; label: string; value: TipoMovimiento } | null>(null);

  const tipos = [
    { key: 'EGRESO', label: 'Egreso', value: 'EGRESO' as TipoMovimiento },
    { key: 'TRASLADO', label: 'Traslado', value: 'TRASLADO' as TipoMovimiento },
  ];

  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [depositoSeleccionado, setDepositoSeleccionado] = useState<Deposito | null>(null);
  const [depositoOrigenSeleccionado, setDepositoOrigenSeleccionado] = useState<Deposito | null>(null);
  const [depositoDestinoSeleccionado, setDepositoDestinoSeleccionado] = useState<Deposito | null>(null);
  const [originResetKey, setOriginResetKey] = useState(0);
  const [destResetKey, setDestResetKey] = useState(0);
  const [productos, setProductos] = useState<InventarioProducto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<InventarioProducto | null>(null);
  const [productResetKey, setProductResetKey] = useState(0);
  const [cantidadMovilizar, setCantidadMovilizar] = useState<number | ''>(0);
  const [observaciones, setObservaciones] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await DepositoService.getAll();
        if (mounted) setDepositos(data || []);
      } catch {
        if (mounted) setDepositos([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // load productos cuando se selecciona un depósito: soporta EGRESO (depositoSeleccionado)
  // y TRASLADO (depositoOrigenSeleccionado)
  useEffect(() => {
    let mounted = true;
  const load = async (depId: number | null) => {
      // reset producto list and selection
      setProductos([]);
      setProductoSeleccionado(null);
      // remount product select to clear its internal query
      setProductResetKey(k => k + 1);
      if (!depId) return;
      try {
  const inv = await InventarioService.getInventarioByDeposito(depId as number);
        if (!mounted) return;
        // solo productos con stock > 0
        const disponibles = (inv || []).filter(p => typeof p.cantidadProducto === 'number' && p.cantidadProducto > 0);
        setProductos(disponibles);
      } catch (e) {
        if (mounted) setProductos([]);
      }
    };

    const depForProducts = tipoSeleccionado?.value === 'EGRESO'
      ? depositoSeleccionado
      : tipoSeleccionado?.value === 'TRASLADO'
        ? depositoOrigenSeleccionado
        : null;

    void load(depForProducts?.id ?? null);
    return () => { mounted = false; };
  }, [depositoSeleccionado, depositoOrigenSeleccionado, tipoSeleccionado]);

  // Reset form state whenever the modal is closed so reopening shows a fresh form
  useEffect(() => {
    if (!open) {
      setTipoSeleccionado(null);
      setDepositoSeleccionado(null);
      setDepositoOrigenSeleccionado(null);
      setDepositoDestinoSeleccionado(null);
      setProductos([]);
      setProductoSeleccionado(null);
      setCantidadMovilizar(0);
      setObservaciones('');
    }
  }, [open]);

  // if tipo changes away from EGRESO, clear deposito and producto selections
  useEffect(() => {
    // Clear EGRESO-only state when tipo is not EGRESO
    if (tipoSeleccionado?.value !== 'EGRESO') {
      setDepositoSeleccionado(null);
      setProductos([]);
      setProductoSeleccionado(null);
      setCantidadMovilizar(0);
      setObservaciones('');
    }
    // Clear TRASLADO-only state when tipo is not TRASLADO
    if (tipoSeleccionado?.value !== 'TRASLADO') {
      setDepositoOrigenSeleccionado(null);
      setDepositoDestinoSeleccionado(null);
    }
  }, [tipoSeleccionado]);

  // when productoSeleccionado changes, set default cantidad to 0
  useEffect(() => {
    setCantidadMovilizar(0);
  }, [productoSeleccionado]);
  return (
    <Modal open={open} onClose={onClose} containerClass="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh]">
      <div className="registro-movimiento-modal flex flex-col h-full">
  <ModalHeader>Registrar movimiento</ModalHeader>

  <div className="p-6 flex-1 space-y-4 overflow-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de movimiento</label>
            <div className="w-full">
              <SearchSelect
                items={tipos}
                value={tipoSeleccionado}
                getKey={(t) => t.key}
                getLabel={(t) => t.label}
                onSelect={(t) => setTipoSeleccionado(t)}
                placeholder="Seleccionar tipo..."
                noResultsText="Sin resultados"
              />
            </div>
          </div>

          {tipoSeleccionado?.value === 'EGRESO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Depósito origen</label>
              <div className="w-full">
                <SearchSelect
                  items={depositos}
                  value={depositoSeleccionado}
                  getKey={(d) => d.id}
                  getLabel={(d) => d.nombre}
                  onSelect={(d) => setDepositoSeleccionado(d)}
                  onClear={() => { setDepositoSeleccionado(null); setProductos([]); setProductoSeleccionado(null); setProductResetKey(k => k + 1); }}
                  placeholder="Seleccionar depósito de origen..."
                  noResultsText="Sin resultados"
                />
              </div>
            </div>
          )}
          {tipoSeleccionado?.value === 'TRASLADO' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depósito origen</label>
                <div className="w-full">
                    <div className="flex-1">
                        <SearchSelect
                          key={originResetKey}
                          items={depositos.filter(d => d.id !== depositoDestinoSeleccionado?.id)}
                          value={depositoOrigenSeleccionado}
                          getKey={(d) => d.id}
                          getLabel={(d) => d.nombre}
                          onSelect={(d) => {
                            setDepositoOrigenSeleccionado(d);
                            // trigger remount of destination select so its input/query resets
                            setDestResetKey(k => k + 1);
                          }}
                          onClear={() => { setDepositoOrigenSeleccionado(null); setProductos([]); setProductoSeleccionado(null); setProductResetKey(k => k + 1); setDestResetKey(k => k + 1); }}
                          placeholder="Seleccionar depósito de origen..."
                          noResultsText="Sin resultados"
                        />
                    </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Depósito destino</label>
                <div className="w-full">
                      <SearchSelect
                        key={destResetKey}
                        items={depositos.filter(d => d.id !== depositoOrigenSeleccionado?.id)}
                        value={depositoDestinoSeleccionado}
                        getKey={(d) => d.id}
                        getLabel={(d) => d.nombre}
                        onSelect={(d) => {
                          setDepositoDestinoSeleccionado(d);
                          // trigger remount of origin select so its input/query resets
                          setOriginResetKey(k => k + 1);
                        }}
                        onClear={() => { setDepositoDestinoSeleccionado(null); setOriginResetKey(k => k + 1); setDestResetKey(k => k + 1); }}
                        placeholder="Seleccionar depósito destino..."
                        noResultsText="Sin resultados"
                      />
                </div>
              </div>
            </div>
          )}
          {/* Observaciones will be rendered below stock/cantidad (see later) */}
          {(tipoSeleccionado?.value === 'EGRESO' && depositoSeleccionado) || (tipoSeleccionado?.value === 'TRASLADO' && depositoOrigenSeleccionado) ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Producto</label>
              <div className="w-full">
                <SearchSelect
                  key={productResetKey}
                  items={productos}
                  value={productoSeleccionado}
                  getKey={(p) => p.idProducto}
                  getLabel={(p) => `${p.nombreComercial} (${p.cantidadProducto ?? 0})`}
                  onSelect={(p) => setProductoSeleccionado(p)}
                  onClear={() => { setProductoSeleccionado(null); setCantidadMovilizar(0); setObservaciones(''); }}
                  placeholder="Seleccionar producto con stock..."
                  noResultsText="No hay productos con stock"
                />
              </div>
            </div>
          ) : null}
          {productoSeleccionado && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <p className="text-sm text-gray-700"><span className="font-medium">Stock actual:</span> {productoSeleccionado.cantidadProducto ?? 0}</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Cantidad a movilizar</span>
                  <div className="w-36">
                    <NumberField
                      value={cantidadMovilizar}
                      onChange={(v) => {
                        const max = Number(productoSeleccionado.cantidadProducto ?? 0);
                        if (Number.isNaN(v)) {
                          // allow empty input so user can delete the leading 0 and type a new number
                          setCantidadMovilizar('');
                          return;
                        }
                        let next = Math.floor(v);
                        if (next < 0) next = 0;
                        if (next > max) next = max;
                        setCantidadMovilizar(next);
                      }}
                      placeholder="0"
                      step={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Observaciones: textarea debajo de stock/cantidad */}
          {productoSeleccionado && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones (opcional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7c6a55] text-sm"
              />
            </div>
          )}
        </div>

        {/* Usamos ModalFooter pero ocultamos el botón submit temporalmente para dejar solo Cancelar */}
        <div className="px-6 py-4 bg-white rounded-b-xl">
          <style>{`.registro-movimiento-modal button[type="submit"]{display:none !important}`}</style>
          <ModalFooter onCancel={onClose} submitLabel="" cancelLabel="Cancelar" submitting={false} disabledSubmit={true} />
        </div>
      </div>
    </Modal>
  );
}
