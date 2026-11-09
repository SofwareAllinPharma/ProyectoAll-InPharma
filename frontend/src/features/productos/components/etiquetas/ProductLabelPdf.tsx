import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import type { Producto } from "../../types/producto.types";
import { computeNutrition } from "../../hooks/useNutrition";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
  },
  labelContainer: {
    borderWidth: 2,
    borderColor: "#000",
    borderStyle: "solid",
    padding: 10,
    width: 280,
  },
  header: {
    fontSize: 20,
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    fontFamily: "Helvetica-Bold",
  },
  subHeader: {
    fontSize: 10,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  servingSize: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 4,
    borderBottomWidth: 3,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    marginBottom: 5,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    paddingVertical: 4,
    backgroundColor: "#f0f0f0",
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
    paddingVertical: 4,
  },
  tableRowText: {
    fontSize: 9,
  },
  colLabel: {
    width: "40%",
    paddingLeft: 5,
    fontFamily: "Helvetica-Bold",
  },
  colValue: {
    width: "30%",
    textAlign: "center",
  },
  description: {
    fontSize: 8,
    marginTop: 8,
    fontStyle: "italic",
  },
  ingredientsTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  ingredientsText: {
    fontSize: 8,
    marginTop: 2,
    marginBottom: 12,
  },
});

interface ProductLabelPdfProps {
  producto: Producto;
}

type LabelNutrition = {
  pesoPorPorcion: number;
  rowsPerPortion: { label: string; value: string }[];
  rowsPer100g: { label: string; value: string }[];
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const pickNumber = (...values: unknown[]): number => {
  for (const v of values) {
    const n = toNumber(v);
    if (n !== 0) return n;
  }
  return 0;
};

const computeNutritionFallbackForPdf = (producto: Producto): LabelNutrition => {
  const formulaAny = (producto as any)?.formula ?? {};

  const pesoPorPorcion = pickNumber(
    formulaAny.porcion,
    formulaAny.pesoPorPorcion
  );

  const proteinas = pickNumber(
    formulaAny.proteinasPorPorcion,
    formulaAny.proteinas
  );
  const carbohidratos = pickNumber(
    formulaAny.carbohidratosPorPorcion,
    formulaAny.carbohidratos
  );
  const grasaTotal = pickNumber(
    formulaAny.grasaTotalPorPorcion,
    formulaAny.grasaTotal
  );

  const kcalorias =
    pickNumber(formulaAny.kcaloriasPorPorcion, formulaAny.kcalorias) ||
    4 * proteinas + 4 * carbohidratos + 9 * grasaTotal;

  const kjuls =
    pickNumber(formulaAny.kjPorPorcion, formulaAny.kjuls) ||
    (kcalorias ? kcalorias * 4.184 : 0);

  const perPortion = {
    kcalorias,
    kjuls,
    proteinas,
    grasaTotal,
    grasaTrans: pickNumber(
      formulaAny.grasaTransPorPorcion,
      formulaAny.grasaTrans
    ),
    grasaSaturada: pickNumber(
      formulaAny.grasaSaturadaPorPorcion,
      formulaAny.grasaSaturada
    ),
    carbohidratos,
    sodio: pickNumber(formulaAny.sodioPorPorcion, formulaAny.sodio),
    fibra: pickNumber(formulaAny.fibraPorPorcion, formulaAny.fibra),
    otros: 0,
  };

  const per100g = (() => {
    if (!pesoPorPorcion || pesoPorPorcion <= 0) {
      return {
        kcalorias: 0,
        kjuls: 0,
        proteinas: 0,
        grasaTotal: 0,
        grasaTrans: 0,
        grasaSaturada: 0,
        carbohidratos: 0,
        sodio: 0,
        fibra: 0,
        otros: 0,
      };
    }
    const factor = 100 / pesoPorPorcion;
    return {
      kcalorias: perPortion.kcalorias * factor,
      kjuls: perPortion.kjuls * factor,
      proteinas: perPortion.proteinas * factor,
      grasaTotal: perPortion.grasaTotal * factor,
      grasaTrans: perPortion.grasaTrans * factor,
      grasaSaturada: perPortion.grasaSaturada * factor,
      carbohidratos: perPortion.carbohidratos * factor,
      sodio: perPortion.sodio * factor,
      fibra: perPortion.fibra * factor,
      otros: perPortion.otros * factor,
    };
  })();

  const rowsPerPortion = [
    { label: "Kcalorías", value: perPortion.kcalorias.toFixed(4) },
    { label: "kJ", value: perPortion.kjuls.toFixed(4) },
    { label: "Proteínas", value: `${perPortion.proteinas.toFixed(4)}g` },
    { label: "Grasas Totales", value: `${perPortion.grasaTotal.toFixed(4)}g` },
    { label: "Grasas Trans", value: `${perPortion.grasaTrans.toFixed(4)}g` },
    {
      label: "Grasas Saturadas",
      value: `${perPortion.grasaSaturada.toFixed(4)}g`,
    },
    {
      label: "Carbohidratos",
      value: `${perPortion.carbohidratos.toFixed(4)}g`,
    },
    { label: "Sodio", value: `${perPortion.sodio.toFixed(4)}g` },
    { label: "Fibra", value: `${perPortion.fibra.toFixed(4)}g` },
    { label: "Otros", value: `${perPortion.otros.toFixed(4)}g` },
  ];

  const rowsPer100g = [
    { label: "Kcalorías", value: per100g.kcalorias.toFixed(4) },
    { label: "kJ", value: per100g.kjuls.toFixed(4) },
    { label: "Proteínas", value: `${per100g.proteinas.toFixed(4)}g` },
    { label: "Grasas Totales", value: `${per100g.grasaTotal.toFixed(4)}g` },
    { label: "Grasas Trans", value: `${per100g.grasaTrans.toFixed(4)}g` },
    {
      label: "Grasas Saturadas",
      value: `${per100g.grasaSaturada.toFixed(4)}g`,
    },
    { label: "Carbohidratos", value: `${per100g.carbohidratos.toFixed(4)}g` },
    { label: "Sodio", value: `${per100g.sodio.toFixed(4)}g` },
    { label: "Fibra", value: `${per100g.fibra.toFixed(4)}g` },
    { label: "Otros", value: `${per100g.otros.toFixed(4)}g` },
  ];

  return { pesoPorPorcion, rowsPerPortion, rowsPer100g };
};

const isAllZeroRows = (rows: { value: string }[]) => {
  const numericPrefix = (s: string) => {
    // toma el número inicial de "0.0000g" / "0.0000" / "0"
    const m = String(s)
      .trim()
      .match(/^-?\d+([.,]\d+)?/);
    return m ? toNumber(m[0]) : NaN;
  };
  return rows.length > 0 && rows.every((r) => numericPrefix(r.value) === 0);
};

export const ProductLabelPdf = ({ producto }: ProductLabelPdfProps) => {
  const computed = computeNutrition(producto);

  // Si computeNutrition da todo en 0 pero la fórmula sí trae valores (con otros nombres),
  // usamos un fallback SOLO para el PDF (sin tocar useNutrition).
  const formulaAny = (producto as any)?.formula ?? {};
  const formulaTieneValoresBackend = [
    "kcalorias",
    "proteinas",
    "carbohidratos",
    "grasaTotal",
    "sodio",
    "fibra",
    "kjuls",
  ].some((k) => toNumber(formulaAny?.[k]) !== 0);

  const usarFallback =
    formulaTieneValoresBackend && isAllZeroRows(computed.rowsPerPortion);

  const { pesoPorPorcion, rowsPerPortion, rowsPer100g } = usarFallback
    ? computeNutritionFallbackForPdf(producto)
    : computed;

  // Ingredientes: soporta ambos nombres de relación (formulaInsumos o insumos)
  const formulaInsumos =
    (producto as any)?.formula?.formulaInsumos ??
    (producto as any)?.formula?.insumos;

  const ingredientes = Array.isArray(formulaInsumos)
    ? formulaInsumos
        .map((fi: any) => fi?.insumo?.nombre)
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.labelContainer}>
          <Text style={styles.header}>Información Nutricional</Text>
          <Text style={styles.subHeader}>{producto.nombreComercial}</Text>

          <Text style={styles.servingSize}>
            Porción: {pesoPorPorcion}g | Base: 100g
          </Text>

          {ingredientes ? (
            <>
              <Text style={styles.description}>
                Ingredientes: {ingredientes}.
              </Text>
              <View style={{ height: 6 }} />
            </>
          ) : null}

          <View style={styles.tableHeader}>
            <Text style={[styles.colLabel, styles.tableHeaderText]}>
              Composición
            </Text>
            <Text style={[styles.colValue, styles.tableHeaderText]}>
              Por Porción
            </Text>
            <Text style={[styles.colValue, styles.tableHeaderText]}>
              Por 100g
            </Text>
          </View>

          {rowsPerPortion.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.colLabel, styles.tableRowText]}>
                {row.label}
              </Text>
              <Text style={[styles.colValue, styles.tableRowText]}>
                {row.value}
              </Text>
              <Text style={[styles.colValue, styles.tableRowText]}>
                {rowsPer100g[index]?.value || "-"}
              </Text>
            </View>
          ))}

          <Text style={styles.description}>
            * % Valores Diarios con base a una dieta de 2.000 kcal u 8.400 kJ.
            Sus valores diarios pueden ser mayores o menores dependiendo de sus
            necesidades energéticas.
          </Text>

          <Text style={styles.description}>
            Peso Neto: {producto.pesoNeto}g
          </Text>
        </View>
      </Page>
    </Document>
  );
};
