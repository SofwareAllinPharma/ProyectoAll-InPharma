import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import type { Pedido } from '../../types/pedido.types';
import type { Producto } from '../../../productos/types/producto.types';
import { buildOrdenExport, COMPOSICION_ACTUAL, ESTADO_LABELS, formatOrdenDate, formatOrdenNumber as fmt } from '../../utils/ordenExport';

const styles = StyleSheet.create({
  page: { padding: 34, paddingBottom: 48, fontFamily: 'Helvetica', fontSize: 8.5, color: '#202020' },
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  subtitle: { fontSize: 8, color: '#666666', marginBottom: 8 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 10, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#b8b2a5', paddingBottom: 4 },
  row: { flexDirection: 'row', paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: '#eeeeee' },
  label: { width: '48%', fontFamily: 'Helvetica-Bold' }, value: { width: '52%' },
  note: { padding: 6, backgroundColor: '#f3f1ea', fontSize: 8, marginVertical: 6, lineHeight: 1.3 },
  warning: { padding: 8, backgroundColor: '#fff1d5', fontSize: 9, marginVertical: 8 },
  tableHead: { flexDirection: 'row', padding: 6, backgroundColor: '#ece9df', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  tableRow: { flexDirection: 'row', padding: 6, borderBottomWidth: 0.5, borderBottomColor: '#dddddd', fontSize: 8 },
  colName: { width: '52%' }, colQty: { width: '24%', textAlign: 'right' },
  compositionHeader: { position: 'absolute', top: 34, left: 34, right: 34 },
  footer: { position: 'absolute', bottom: 22, left: 34, right: 34, color: '#666666', fontSize: 8 },
});
const Row = ({ label, value }: { label: string; value: string }) => <View style={styles.row} wrap={false}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>;
const Footer = ({ numPedido }: { numPedido: number }) => <Text fixed style={styles.footer} render={({ pageNumber, totalPages }) => `Orden PED-${numPedido} | Página ${pageNumber} de ${totalPages}`} />;

export interface PedidoDetailPdfProps { pedido: Pedido; producto?: Producto | null }
export const PedidoDetailPdf = ({ pedido, producto }: PedidoDetailPdfProps) => {
  const data = buildOrdenExport(pedido, producto);
  // El encabezado fijo se repite si las filas de varias líneas requieren más páginas.
  const composicionSeparada = data.insumos.length > 8 || data.insumos.some(ins => ins.nombre.length > 100);
  return <Document title={`Orden PED-${pedido.numPedido}`}>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Orden de producción PED-{pedido.numPedido}</Text>
      <Text style={styles.subtitle}>Emitido: {formatOrdenDate(new Date())} | Creado: {formatOrdenDate(pedido.createdAt)} | Hora Argentina</Text>
      <Row label="Producto" value={pedido.producto?.nombreComercial ?? `#${pedido.idProducto}`} />
      <Row label="Estado" value={data.estado} />
      <Row label="Fórmula actual" value={data.formula ? `${data.formula.nombre} (#${data.formula.id})` : 'No disponible'} />
      <Row label="Porción de fórmula" value={data.formula ? `${fmt(data.formula.porcion)} g` : 'No disponible'} />
      <Row label="Porciones por envase" value={fmt(producto?.cantPorcionesAportadas)} />
      <Text style={styles.note}>{COMPOSICION_ACTUAL}</Text>
      {data.advertencia && <Text style={styles.warning}>{data.advertencia}</Text>}
      <Text style={styles.sectionTitle}>Cantidades de la orden</Text>
      <Row label="Planificado: paquetes / porciones" value={`${fmt(pedido.cantAProducir_paquetes)} / ${fmt(pedido.cantAProducir_porciones)}`} />
      <Row label="Planificado: gramos" value={`${fmt(pedido.cantAProducir_gramos)} g`} />
      <Row label="Elaborado: paquetes / porciones" value={`${fmt(pedido.cantElaborada_paquetes)} / ${fmt(pedido.cantElaborada_porciones)}`} />
      <Row label="Elaborado: gramos" value={pedido.cantElaborada_gramos != null ? `${fmt(pedido.cantElaborada_gramos)} g` : 'No registrado'} />
      {pedido.observacion && <Row label="Observación" value={pedido.observacion} />}
      <Text style={styles.sectionTitle}>Nutrición de la fórmula por porción{data.formula ? ` (${fmt(data.formula.porcion)} g)` : ''}</Text>
      {data.nutrientes.length ? data.nutrientes.map(n => <Row key={n.label + n.value} label={n.label} value={n.value} />) : <Text>No disponible.</Text>}
      <Text style={styles.subtitle}>Datos registrados en la ficha actual. Sodio conserva la unidad del sistema; no se convirtió a mg.</Text>
      <Text style={styles.sectionTitle}>Responsables e historial</Text>
      <Row label="Creador" value={pedido.mailUsuarioCreador} />
      <Row label="Técnico asignado" value={pedido.mailUsuarioCocinero ?? 'No registrado'} />
      <Row label="Elaborador registrado al finalizar" value={data.elaborador ?? 'No registrado'} />
      <Row label="Depositador registrado al finalizar" value={data.depositador ?? 'No registrado'} />
      <Text style={styles.note}>Lote, vencimiento y ubicación: consultar los lotes asociados en Inventario. Este informe no genera lotes ni acredita firmas digitales.</Text>
      <Text style={styles.sectionTitle}>Historial de estados</Text>
      {(pedido.cambios ?? []).map(c => <View key={c.idCambioEstado} wrap={false} style={{ marginBottom: 10 }}><Text>{ESTADO_LABELS[c.estado?.nombre ?? ''] ?? c.estado?.nombre ?? 'Estado sin detalle'}</Text><Text style={{ color: '#666666', fontSize: 8 }}>{formatOrdenDate(c.fechaHoraInicio)}{c.responsable ? ` | Responsable: ${c.responsable}` : ''}{c.depositador ? ` | Depositador: ${c.depositador}` : ''}</Text></View>)}

      {data.insumos.length > 0 && !composicionSeparada && <View wrap={false}>
        <Text style={styles.sectionTitle}>Insumos requeridos (estimado)</Text>
        <View style={styles.tableHead}><Text style={styles.colName}>Insumo / identificación</Text><Text style={styles.colQty}>g por porción</Text><Text style={styles.colQty}>g para la orden</Text></View>
        {data.insumos.map((ins, n) => <View key={n} style={styles.tableRow} wrap={false}><Text style={styles.colName}>#{ins.idInsumo} - {ins.nombre}</Text><Text style={styles.colQty}>{fmt(ins.gramosPorPorcion)}</Text><Text style={styles.colQty}>{fmt(ins.cantidad)}</Text></View>)}
      </View>}
      <Footer numPedido={pedido.numPedido} />
    </Page>
    {composicionSeparada && <Page size="A4" style={[styles.page, { paddingTop: 145 }]}>
      <View fixed style={styles.compositionHeader}>
        <Text style={styles.title}>Composición requerida - PED-{pedido.numPedido}</Text>
        <Text style={styles.note}>{COMPOSICION_ACTUAL}</Text>
        <View style={styles.tableHead}><Text style={styles.colName}>Insumo / identificación</Text><Text style={styles.colQty}>g por porción</Text><Text style={styles.colQty}>g para la orden</Text></View>
      </View>
      {data.insumos.map((ins, n) => <View key={n} style={styles.tableRow} wrap={false}><Text style={styles.colName}>#{ins.idInsumo} - {ins.nombre}</Text><Text style={styles.colQty}>{fmt(ins.gramosPorPorcion)}</Text><Text style={styles.colQty}>{fmt(ins.cantidad)}</Text></View>)}
      <Footer numPedido={pedido.numPedido} />
    </Page>}


  </Document>;
};
