import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { MovimientoDetalle } from '../../types/movimiento.detalle.types';

const TIPO_LABELS: Record<string, string> = {
  TRASLADO: 'Traslado',
  EGRESO: 'Egreso',
  INGRESO: 'Ingreso',
};

const ESTADO_LABELS: Record<string, string> = {
  CREADO: 'Creado',
  EN_CAMINO: 'En Camino',
  ENTREGADO: 'Entregado',
  VENDIDO: 'Vendido',
  CANCELADO: 'Cancelado',
};

const ACCENT = '#9D977B';
const DARK = '#374151';
const GRAY = '#6b7280';
const LIGHT_BG = '#F5F3EB';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: DARK, padding: 36, backgroundColor: '#FFFFFF' },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 9, color: GRAY, marginBottom: 12 },
  estado: { fontSize: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: DARK, borderBottomWidth: 1, borderBottomColor: ACCENT, paddingBottom: 3, marginTop: 14, marginBottom: 6 },
  table: { width: '100%', borderWidth: 1, borderColor: ACCENT },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  rowLast: { flexDirection: 'row' },
  labelCell: { width: '40%', backgroundColor: LIGHT_BG, padding: 5, fontFamily: 'Helvetica-Bold', fontSize: 9 },
  valueCell: { width: '60%', padding: 5, fontSize: 9 },
  historyItem: { borderLeftWidth: 2, borderLeftColor: ACCENT, paddingLeft: 8, marginBottom: 6 },
  historyEstado: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  historyDate: { fontSize: 8, color: GRAY },
});

const InfoRow = ({ label, value, last }: { label: string; value: string; last?: boolean }) => (
  <View style={last ? styles.rowLast : styles.row}>
    <View style={styles.labelCell}><Text>{label}</Text></View>
    <View style={styles.valueCell}><Text>{value}</Text></View>
  </View>
);

interface Props {
  detalle: MovimientoDetalle;
}

export function MovimientoDetailPdf({ detalle }: Props) {
  const tipoLabel = TIPO_LABELS[detalle.tipo] ?? detalle.tipo;
  const estadoLabel = ESTADO_LABELS[detalle.estado] ?? detalle.estado;
  const isTraslado = detalle.tipo === 'TRASLADO';
  const isEgreso = detalle.tipo === 'EGRESO';

  const flujo = isTraslado
    ? `${detalle.depositoOrigenNombre ?? '-'} → ${detalle.depositoDestinoNombre ?? '-'}`
    : isEgreso
    ? `${detalle.depositoOrigenNombre ?? '-'} → Venta`
    : `Externo → ${detalle.depositoDestinoNombre ?? '-'}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Movimiento MOV-{detalle.id}</Text>
        <Text style={styles.subtitle}>
          Emitido: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          {'   ·   '}
          Creado: {detalle.fechaCreacion}
        </Text>
        <Text style={styles.estado}>Estado: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{estadoLabel}</Text></Text>

        <Text style={styles.sectionTitle}>Información del Movimiento</Text>
        <View style={styles.table}>
          <InfoRow label="Tipo" value={tipoLabel} />
          <InfoRow label="Producto" value={detalle.productoNombre} />
          <InfoRow label="Cantidad" value={`${detalle.cantidad} unidad${detalle.cantidad === 1 ? '' : 'es'}`} />
          <InfoRow label="Flujo" value={flujo} />
          {detalle.referencia ? <InfoRow label="Referencia" value={detalle.referencia} /> : null}
          {detalle.responsable ? <InfoRow label="Responsable" value={detalle.responsable} /> : null}
          <InfoRow label="Observaciones" value={detalle.observaciones?.trim() || 'No Aplica'} last />
        </View>

        {detalle.historial.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Historial de Estados</Text>
            {[...detalle.historial].reverse().map((ev) => (
              <View key={ev.id} style={styles.historyItem}>
                <Text style={styles.historyEstado}>{ESTADO_LABELS[ev.estado] ?? ev.estado}</Text>
                <Text style={styles.historyDate}>
                  {ev.fechaInicio ?? '-'}
                  {ev.responsable ? `  ·  ${ev.responsable}` : ''}
                  {ev.responsableEntrega ? `  ·  Entrega: ${ev.responsableEntrega}` : ''}
                  {ev.responsableRecepcion ? `  ·  Recepción: ${ev.responsableRecepcion}` : ''}
                </Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
