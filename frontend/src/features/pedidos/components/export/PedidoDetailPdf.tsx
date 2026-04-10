import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import type { Pedido } from "../../types/pedido.types";
import type { InsumoRequerido } from "../../utils/insumos.utils";

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Helvetica", fontSize: 10 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  subtitle: { fontSize: 9, color: "#6b7280", marginBottom: 16 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#9D977B",
    borderBottomStyle: "solid",
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: "42%", fontFamily: "Helvetica-Bold", color: "#374151" },
  value: { width: "58%", color: "#111827" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F3EB",
    padding: 5,
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#9D977B",
    borderBottomStyle: "solid",
  },
  tableHeaderText: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    padding: 4,
  },
  tableRowText: { fontSize: 9 },
  colName: { width: "70%" },
  colQty: { width: "30%", textAlign: "right" },
  historyItem: {
    marginBottom: 5,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#9D977B",
    borderLeftStyle: "solid",
  },
  historyEstado: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#374151" },
  historyDate: { fontSize: 8, color: "#6b7280" },
  badge: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#5d5448",
    backgroundColor: "#F5F3EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  alertBox: {
    backgroundColor: "#fef3c7",
    padding: 6,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    borderLeftStyle: "solid",
  },
  alertText: { fontSize: 9, color: "#92400e" },
  bold: { fontFamily: "Helvetica-Bold" },
});

const ESTADO_LABELS: Record<string, string> = {
  Creado: "Creado",
  "EnElaboración": "En Elaboración",
  ElaboradoYDepositadoEnFábrica: "Finalizado",
  Cancelado: "Cancelado",
};

const formatDate = (d: string | Date) => {
  const date = new Date(d);
  return (
    date.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" }) +
    " " +
    date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
  );
};

interface PedidoDetailPdfProps {
  pedido: Pedido;
  insumos: InsumoRequerido[];
}

export const PedidoDetailPdf = ({ pedido, insumos }: PedidoDetailPdfProps) => {
  const estadoNombre = pedido.cambioActual?.estado?.nombre ?? "";
  const estadoLabel = ESTADO_LABELS[estadoNombre] ?? estadoNombre;
  const cambios = pedido.cambios ?? [];
  const cantReal = pedido.cantElaborada_paquetes;
  const hayDiferencia =
    cantReal != null && cantReal !== pedido.cantAProducir_paquetes;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.section}>
          <Text style={styles.title}>Pedido PED-{pedido.numPedido}</Text>
          <Text style={styles.subtitle}>
            Emitido: {formatDate(new Date())} · Creado: {formatDate(pedido.createdAt)}
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Estado actual:</Text>
            <Text style={styles.badge}>{estadoLabel}</Text>
          </View>
        </View>

        {/* Info del pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Pedido</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Producto:</Text>
            <Text style={styles.value}>
              {pedido.producto?.nombreComercial ?? `#${pedido.idProducto}`}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cant. estimada (paquetes):</Text>
            <Text style={styles.value}>{pedido.cantAProducir_paquetes}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cant. estimada (gramos):</Text>
            <Text style={styles.value}>{pedido.cantAProducir_gramos} g</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cant. estimada (porciones):</Text>
            <Text style={styles.value}>
              {Math.round(pedido.cantAProducir_porciones)}
              {pedido.producto?.cantPorcionesAportadas
                ? `  (1 paquete = ${pedido.producto.cantPorcionesAportadas} porciones)`
                : ""}
            </Text>
          </View>
          {pedido.observacion ? (
            <View style={styles.row}>
              <Text style={styles.label}>Observación:</Text>
              <Text style={styles.value}>{pedido.observacion}</Text>
            </View>
          ) : null}
        </View>

        {/* Cantidad real elaborada (solo si está finalizado) */}
        {cantReal != null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cantidad Real Elaborada</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Paquetes elaborados:</Text>
              <Text style={[styles.value, styles.bold]}>{cantReal}</Text>
            </View>
            {pedido.cantElaborada_gramos != null && (
              <View style={styles.row}>
                <Text style={styles.label}>Gramos elaborados:</Text>
                <Text style={styles.value}>{pedido.cantElaborada_gramos} g</Text>
              </View>
            )}
            {hayDiferencia && (
              <View style={styles.alertBox}>
                <Text style={styles.alertText}>
                  Diferencia respecto a lo estimado:{" "}
                  {(cantReal - pedido.cantAProducir_paquetes > 0 ? "+" : "") +
                    (cantReal - pedido.cantAProducir_paquetes).toFixed(2)}{" "}
                  paquetes
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Responsables */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsables</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Creador:</Text>
            <Text style={styles.value}>{pedido.mailUsuarioCreador}</Text>
          </View>
          {pedido.mailUsuarioCocinero ? (
            <View style={styles.row}>
              <Text style={styles.label}>Técnico asignado:</Text>
              <Text style={styles.value}>{pedido.mailUsuarioCocinero}</Text>
            </View>
          ) : null}
        </View>

        {/* Insumos requeridos */}
        {insumos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insumos Requeridos (estimado)</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.colName, styles.tableHeaderText]}>Insumo</Text>
              <Text style={[styles.colQty, styles.tableHeaderText]}>Cantidad (g)</Text>
            </View>
            {insumos.map((ins, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.colName, styles.tableRowText]}>{ins.nombre}</Text>
                <Text style={[styles.colQty, styles.tableRowText]}>
                  {ins.cantidad.toFixed(2)} g
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Historial de estados */}
        {cambios.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial de Estados</Text>
            {[...cambios].reverse().map((c, i) => (
              <View key={i} style={[styles.historyItem, { marginBottom: 6 }]}>
                <Text style={styles.historyEstado}>
                  {ESTADO_LABELS[c.estado?.nombre ?? ""] ?? c.estado?.nombre ?? ""}
                </Text>
                <Text style={styles.historyDate}>
                  {formatDate(c.fechaHoraInicio)}
                  {c.responsable ? ` · ${c.responsable}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
