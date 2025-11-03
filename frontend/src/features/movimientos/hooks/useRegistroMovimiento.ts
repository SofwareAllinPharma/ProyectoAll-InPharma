import { useState } from 'react';
import { MovimientoService } from '../services/movimiento.service';
import type { TipoMovimiento } from '../types/movimiento.types';

export function useRegistroMovimiento(args?: { onCreated?: () => void; onClose?: () => void }) {
  const { onCreated, onClose } = args || {};
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [tipo, setTipo] = useState<{ key: string; label: string; value: TipoMovimiento } | null>(null);
  const [depOrigen, setDepOrigen] = useState<any>(null);
  const [depDestino, setDepDestino] = useState<any>(null);
  const [producto, setProducto] = useState<any>(null);
  const [cantidad, setCantidad] = useState<number | ''>(0);
  const [responsable, setResponsable] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<any | null>(null);

  const validateAll = () => {
    const next: any = {};
    let ok = true;
    if (!tipo) { next.tipo = 'Seleccione un tipo de movimiento'; ok = false; }
    if (tipo?.value === 'EGRESO') { if (!depOrigen) { next.deposito = 'Seleccione un depósito'; ok = false; } }
    if (tipo?.value === 'TRASLADO') { if (!depOrigen || !depDestino) { next.deposito = 'Seleccione depósito origen y destino'; ok = false; } }
    if (!producto) { next.producto = 'Seleccione el producto a trasladar'; ok = false; }
    const cantidadNum = Number(cantidad ?? 0); if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) { next.cantidad = 'La cantidad debe ser mayor a 0'; ok = false; }
    if (!responsable || responsable.trim() === '') { next.responsable = 'Ingrese el responsable'; ok = false; }
    setErrors(next);
    if (!ok) setSubmitted(true);
    return ok;
  };

  const handleTipoChange = (v: any) => { setTipo(v); setErrors((p:any) => ({ ...p, tipo: undefined, deposito: undefined })); };
  const handleTipoBlur = () => { setTouched((t:any) => ({ ...t, tipo: true })); if (!tipo) setErrors((p:any) => ({ ...p, tipo: 'Seleccione un tipo de movimiento' })); };
  const handleDepOrigen = (d: any) => { setDepOrigen(d); setErrors((p:any) => ({ ...p, deposito: undefined })); };
  const handleDepDestino = (d: any) => { setDepDestino(d); setErrors((p:any) => ({ ...p, deposito: undefined })); };
  const handleDepBlur = () => { setTouched((t:any) => ({ ...t, deposito: true })); if (tipo?.value === 'EGRESO' && !depOrigen) setErrors((p:any) => ({ ...p, deposito: 'Seleccione un depósito' })); if (tipo?.value === 'TRASLADO' && (!depOrigen || !depDestino)) setErrors((p:any) => ({ ...p, deposito: 'Seleccione depósito origen y destino' })); };
  const handleProducto = (p: any) => { setProducto(p); setErrors((p2:any) => ({ ...p2, producto: undefined, cantidad: undefined, responsable: undefined })); };
  const handleProductoBlur = () => { setTouched((t:any) => ({ ...t, producto: true })); if (!producto) setErrors((p:any) => ({ ...p, producto: 'Seleccione el producto a trasladar' })); };
  const handleCantidadChange = (v: number | '') => { setCantidad(v); const n = Number(v ?? 0); if (!Number.isInteger(n) || n <= 0) setErrors((p:any) => ({ ...p, cantidad: 'La cantidad debe ser mayor a 0' })); else setErrors((p:any) => ({ ...p, cantidad: undefined })); };
  const handleCantidadBlur = () => { setTouched((t:any) => ({ ...t, cantidad: true })); const n = Number(cantidad ?? 0); if (!Number.isInteger(n) || n <= 0) setErrors((p:any) => ({ ...p, cantidad: 'La cantidad debe ser mayor a 0' })); };
  const handleResponsableChange = (s: string) => { setResponsable(s); if (s && s.trim() !== '') setErrors((p:any) => ({ ...p, responsable: undefined })); };
  const handleResponsableBlur = () => { setTouched((t:any) => ({ ...t, responsable: true })); if (!responsable || responsable.trim() === '') setErrors((p:any) => ({ ...p, responsable: 'Ingrese el responsable' })); };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitted(true);
    if (!validateAll()) return;
    const cantidadNum = Number(cantidad ?? 0);
    const summary = {
      tipo: tipo?.label ?? tipo?.value ?? '',
      productoNombre: producto?.nombreComercial ?? producto?.nombre ?? 'N/A',
      depositoOrigenNombre: depOrigen?.nombre ?? null,
      depositoDestinoNombre: depDestino?.nombre ?? null,
      cantidad: cantidadNum,
      fecha: new Date().toLocaleDateString(),
      responsable: responsable || undefined,
      observaciones: observaciones || undefined,
    };
    setSummaryData({ payload: { tipo: tipo!.value, idProducto: producto.idProducto, cantidad: cantidadNum, idDepositoOrigen: depOrigen?.id, idDepositoDestino: depDestino?.id ?? null, responsable: responsable || undefined, observaciones: observaciones || undefined }, summary });
    setSummaryOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!summaryData) return;
    const payload = summaryData.payload;
    try {
      setSubmitting(true);
      const created = await MovimientoService.createMovimiento(payload as any);
      alert('Movimiento registrado correctamente (id: ' + (created as any).idMovimiento + ')');
      onCreated?.();
      setSummaryOpen(false);
      onClose?.();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || err?.message || 'Error creando movimiento');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setTipo(null);
    setDepOrigen(null);
    setDepDestino(null);
    setProducto(null);
    setCantidad(0);
    setResponsable('');
    setObservaciones('');
    setSummaryOpen(false);
    setSummaryData(null);
    setSubmitting(false);
  };

  return {
    errors, touched, submitted,
    tipo, depOrigen, depDestino, producto, cantidad, responsable, observaciones,
    submitting,
    handleTipoChange, handleTipoBlur, handleDepOrigen, handleDepDestino, handleDepBlur,
    handleProducto, handleProductoBlur, handleCantidadChange, handleCantidadBlur,
    handleResponsableChange, handleResponsableBlur,
    handleSubmit,
    summaryOpen, setSummaryOpen, summaryData, handleConfirmCreate,
    reset,
    setObservaciones,
    setTipo, setDepOrigen, setDepDestino, setProducto, setCantidad, setResponsable,
  };
}
