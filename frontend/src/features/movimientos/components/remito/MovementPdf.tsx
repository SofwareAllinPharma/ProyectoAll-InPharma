import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import type { Movimiento } from "../../types/movimiento.types";
import logoImg from "../../../../assets/AIP_logo.png";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  logo: {
    width: 50,
    height: 50,
    objectFit: "contain",
  },
  companyInfo: {
    flex: 1,
  },
  headerRight: {
    width: 120,
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  companyInfoText: {
    fontSize: 8,
    marginBottom: 2,
  },
  docType: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 8,
    color: "#666",
  },
  remitoBox: {
    borderWidth: 2,
    borderColor: "#000",
    padding: 8,
    textAlign: "center",
  },
  remitoLabel: {
    fontSize: 8,
    marginBottom: 2,
  },
  remitoNumber: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  // Info blocks
  infoRow: {
    flexDirection: "row",
    marginBottom: 15,
  },
  infoBlock: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    marginRight: 10,
  },
  infoBlockLast: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
  },
  infoTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  infoLabel: {
    fontSize: 8,
    color: "#666",
    marginTop: 3,
  },
  infoValue: {
    fontSize: 9,
    marginTop: 1,
    marginBottom: 3,
  },
  // Table
  table: {
    marginBottom: 15,
  },
  tableTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
    paddingLeft: 5,
  },
  tableHeader: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f0f0f0",
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 5,
    minHeight: 30,
  },
  tableRowText: {
    fontSize: 9,
  },
  colCantidad: {
    width: "10%",
    textAlign: "center",
  },
  colDescripcion: {
    width: "90%",
    paddingLeft: 5,
  },
  // Signatures
  signaturesRow: {
    flexDirection: "row",
    marginTop: 40,
    marginBottom: 20,
  },
  signatureBlock: {
    flex: 1,
    marginRight: 20,
  },
  signatureBlockLast: {
    flex: 1,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    marginTop: 40,
    paddingTop: 5,
  },
  signatureLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  signatureSubLabel: {
    fontSize: 8,
    textAlign: "center",
    color: "#666",
    marginTop: 2,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  disclaimer: {
    fontSize: 7,
    color: "#666",
    textAlign: "center",
    lineHeight: 1.3,
  },
});

interface MovementPdfProps {
  movimiento: Movimiento;
}

const formatDate = (dateStr: string): string => {
  // Intenta parsear y formatear la fecha a dd/mm/yyyy
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

const getTipoLabel = (tipo: string): string => {
  const map: Record<string, string> = {
    EGRESO: "Salida / Egreso",
    TRASLADO: "Traslado Interno",
    INGRESO: "Entrada / Ingreso",
  };
  return map[tipo] || tipo;
};

const getEstadoLabel = (estado: string): string => {
  const map: Record<string, string> = {
    CREADO: "Creado",
    EN_CAMINO: "En Camino",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  };
  return map[estado] || estado;
};

export const MovementPdf = ({ movimiento }: MovementPdfProps) => {
  const productoNombre =
    movimiento.producto?.nombreComercial ||
    `Producto ID: ${movimiento.idProducto}`;
  const depositoOrigenNombre =
    movimiento.depositoOrigen?.nombre || "N/A";
  const depositoDestinoNombre =
    movimiento.depositoDestino?.nombre || "N/A";

  const remitoNumber = `R-${String(movimiento.id).padStart(6, "0")}`;
  const fecha = formatDate(movimiento.fechaCreacion);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image src={logoImg} style={styles.logo} />
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>AllInPharma</Text>
              <Text style={styles.companyInfoText}>Sistema de Gestión Farmacéutica</Text>
              <Text style={styles.companyInfoText}>Gestión de Movimientos y Traslados</Text>
              <Text style={styles.docType}>DOCUMENTO NO VÁLIDO COMO FACTURA</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.remitoBox}>
              <Text style={styles.remitoLabel}>REMITO Nº</Text>
              <Text style={styles.remitoNumber}>{remitoNumber}</Text>
            </View>
          </View>
        </View>

        {/* Fecha y Referencia */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Información del Documento</Text>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{fecha}</Text>
            {movimiento.referencia && (
              <>
                <Text style={styles.infoLabel}>Referencia:</Text>
                <Text style={styles.infoValue}>{movimiento.referencia}</Text>
              </>
            )}
          </View>
          <View style={styles.infoBlockLast}>
            <Text style={styles.infoTitle}>Tipo de Movimiento</Text>
            <Text style={styles.infoValue}>{getTipoLabel(movimiento.tipo)}</Text>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={styles.infoValue}>{getEstadoLabel(movimiento.estado)}</Text>
          </View>
        </View>

        {/* Origen y Destino */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Origen</Text>
            <Text style={styles.infoLabel}>Depósito:</Text>
            <Text style={styles.infoValue}>{depositoOrigenNombre}</Text>
          </View>
          <View style={styles.infoBlockLast}>
            <Text style={styles.infoTitle}>Destino</Text>
            <Text style={styles.infoLabel}>Depósito:</Text>
            <Text style={styles.infoValue}>
              {movimiento.tipo === "TRASLADO"
                ? depositoDestinoNombre
                : "Cliente / Venta Externa"}
            </Text>
          </View>
        </View>

        {/* Responsable y Observaciones */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>Responsable</Text>
            <Text style={styles.infoValue}>
              {movimiento.responsable || "Sistema"}
            </Text>
          </View>
          <View style={styles.infoBlockLast}>
            <Text style={styles.infoTitle}>Observaciones</Text>
            <Text style={styles.infoValue}>
              {movimiento.observaciones || "—"}
            </Text>
          </View>
        </View>

        {/* Tabla de Producto */}
        <View style={styles.table}>
          <Text style={styles.tableTitle}>
            REMÍTASE A USTED LOS SIGUIENTES PRODUCTOS:
          </Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colCantidad]}>
              CANT.
            </Text>
            <Text style={[styles.tableHeaderText, styles.colDescripcion]}>
              DESCRIPCIÓN
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableRowText, styles.colCantidad]}>
              {movimiento.cantidad}
            </Text>
            <Text style={[styles.tableRowText, styles.colDescripcion]}>
              {productoNombre}
            </Text>
          </View>
        </View>

        {/* Firmas */}
        <View style={styles.signaturesRow}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureLabel}>FIRMA Y ACLARACIÓN</Text>
              <Text style={styles.signatureSubLabel}>Responsable de Entrega</Text>
            </View>
          </View>
          <View style={styles.signatureBlockLast}>
            <View style={styles.signatureLine}>
              <Text style={styles.signatureLabel}>FIRMA Y ACLARACIÓN</Text>
              <Text style={styles.signatureSubLabel}>Responsable de Recepción</Text>
            </View>
          </View>
        </View>

        {/* Footer / Disclaimer */}
        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            RECIBÍ CONFORME:{"\n"}
            MEDIANTE MI FIRMA ACEPTO HABER RECIBIDO EN ESTADO SATISFACTORIO EL/LOS PRODUCTO/S DE LA PRESENTE.{"\n"}
            (✘) SE CONSIDERA NO RECIBIR EL/LOS PRODUCTO/S SI EL SELLO ES DE COLOR ORIGINAL.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
