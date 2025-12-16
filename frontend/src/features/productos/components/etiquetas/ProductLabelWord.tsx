// @ts-ignore: external module without types in this project
// @ts-ignore: external module without types in this project
import {
  Document,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  AlignmentType,
  BorderStyle,
  TextRun,
  Packer,
} from "docx";
// @ts-ignore: external module without types in this project
import { saveAs } from "file-saver";
import type { Producto } from "../../types/producto.types";
import { computeNutrition } from "../../hooks/useNutrition";

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

const isAllZeroRows = (rows: { value: string }[]) => {
  const numericPrefix = (s: string) => {
    const m = String(s)
      .trim()
      .match(/^-?\d+([.,]\d+)?/);
    return m ? toNumber(m[0]) : NaN;
  };
  return rows.length > 0 && rows.every((r) => numericPrefix(r.value) === 0);
};

const computeNutritionFallbackForWord = (producto: Producto) => {
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

export const generateWordLabel = async (producto: Producto) => {
  // computeNutrition puede fallar si producto.formula viene null/undefined; en ese caso usamos fallback.
  const computed = (() => {
    try {
      return computeNutrition(producto);
    } catch {
      return computeNutritionFallbackForWord(producto);
    }
  })();

  // Si computeNutrition da todo 0 pero la fórmula trae valores con nombres “backend”,
  // usamos fallback SOLO para Word (sin tocar useNutrition).
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
    ? computeNutritionFallbackForWord(producto)
    : computed;

  // Ingredientes: soporta ambos nombres de relación (formulaInsumos o insumos)
  const formulaInsumos =
    (producto as any)?.formula?.formulaInsumos ??
    (producto as any)?.formula?.insumos;

  const ingredientes = Array.isArray(formulaInsumos)
    ? formulaInsumos
        .map((fi: any) => fi?.insumo?.nombre ?? fi?.nombre)
        .filter(Boolean)
        .join(", ")
    : "";

  // Borde exterior grueso negro
  const outerBorder = {
    style: BorderStyle.SINGLE,
    size: 20,
    color: "000000",
  };

  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 6,
    color: "000000",
  };

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 3,
    color: "CCCCCC",
  };

  const thickBorder = {
    style: BorderStyle.SINGLE,
    size: 12,
    color: "000000",
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 567,
              right: 567,
              bottom: 567,
              left: 567,
            },
          },
        },
        children: [
          new Table({
            width: {
              size: 5600,
              type: WidthType.DXA,
            },
            columnWidths: [5600],
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: {
                      top: outerBorder,
                      bottom: outerBorder,
                      left: outerBorder,
                      right: outerBorder,
                    },
                    margins: {
                      top: 200,
                      bottom: 200,
                      left: 200,
                      right: 200,
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Información Nutricional",
                            bold: true,
                            size: 40,
                            font: "Helvetica",
                            color: "000000",
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 60, before: 0 },
                        border: {
                          bottom: {
                            style: BorderStyle.SINGLE,
                            size: 3,
                            color: "000000",
                          },
                        },
                      }),

                      new Paragraph({
                        children: [
                          new TextRun({
                            text: producto.nombreComercial,
                            bold: true,
                            size: 20,
                            font: "Helvetica",
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                        spacing: { after: 160 },
                      }),

                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Porción: ${pesoPorPorcion}g | Base: 100g`,
                            bold: true,
                            size: 20,
                            font: "Helvetica",
                          }),
                        ],
                        spacing: { after: 100, before: 0 },
                        border: {
                          bottom: thickBorder,
                        },
                      }),

                      ...(ingredientes
                        ? [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Ingredientes: ",
                                  bold: true,
                                  size: 16,
                                  font: "Helvetica",
                                }),
                                new TextRun({
                                  text: `${ingredientes}.`,
                                  italics: true,
                                  size: 16,
                                  font: "Helvetica",
                                }),
                              ],
                              spacing: { after: 120 },
                            }),
                          ]
                        : []),

                      new Table({
                        width: {
                          size: 100,
                          type: WidthType.PERCENTAGE,
                        },
                        borders: {
                          top: borderStyle,
                          bottom: borderStyle,
                          left: borderStyle,
                          right: borderStyle,
                          insideHorizontal: thinBorder,
                          insideVertical: thinBorder,
                        },
                        rows: [
                          new TableRow({
                            children: [
                              new TableCell({
                                children: [
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: "Composición",
                                        bold: true,
                                        size: 16,
                                        font: "Helvetica",
                                      }),
                                    ],
                                    spacing: { before: 60, after: 60 },
                                  }),
                                ],
                                width: { size: 40, type: WidthType.PERCENTAGE },
                                shading: { fill: "F0F0F0" },
                                margins: { left: 100 },
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: "Por Porción",
                                        bold: true,
                                        size: 16,
                                        font: "Helvetica",
                                      }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 60, after: 60 },
                                  }),
                                ],
                                width: { size: 30, type: WidthType.PERCENTAGE },
                                shading: { fill: "F0F0F0" },
                              }),
                              new TableCell({
                                children: [
                                  new Paragraph({
                                    children: [
                                      new TextRun({
                                        text: "Por 100g",
                                        bold: true,
                                        size: 16,
                                        font: "Helvetica",
                                      }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 60, after: 60 },
                                  }),
                                ],
                                width: { size: 30, type: WidthType.PERCENTAGE },
                                shading: { fill: "F0F0F0" },
                              }),
                            ],
                            tableHeader: true,
                          }),

                          ...rowsPerPortion.map(
                            (row, index) =>
                              new TableRow({
                                children: [
                                  new TableCell({
                                    children: [
                                      new Paragraph({
                                        children: [
                                          new TextRun({
                                            text: row.label,
                                            bold: true,
                                            size: 18,
                                            font: "Helvetica",
                                          }),
                                        ],
                                        spacing: { before: 60, after: 60 },
                                      }),
                                    ],
                                    margins: { left: 100 },
                                  }),
                                  new TableCell({
                                    children: [
                                      new Paragraph({
                                        children: [
                                          new TextRun({
                                            text: row.value,
                                            size: 18,
                                            font: "Helvetica",
                                          }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                        spacing: { before: 60, after: 60 },
                                      }),
                                    ],
                                  }),
                                  new TableCell({
                                    children: [
                                      new Paragraph({
                                        children: [
                                          new TextRun({
                                            text:
                                              rowsPer100g[index]?.value || "-",
                                            size: 18,
                                            font: "Helvetica",
                                          }),
                                        ],
                                        alignment: AlignmentType.CENTER,
                                        spacing: { before: 60, after: 60 },
                                      }),
                                    ],
                                  }),
                                ],
                              })
                          ),
                        ],
                      }),

                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "* % Valores Diarios con base a una dieta de 2.000 kcal u 8.400 kJ. Sus valores diarios pueden ser mayores o menores dependiendo de sus necesidades energéticas.",
                            italics: true,
                            size: 16,
                            font: "Helvetica",
                          }),
                        ],
                        spacing: { before: 160, after: 0 },
                      }),

                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `Peso Neto: ${producto.pesoNeto}g`,
                            italics: true,
                            size: 16,
                            font: "Helvetica",
                          }),
                        ],
                        spacing: { before: 160, after: 0 },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(
    blob,
    `etiqueta-${producto.nombreComercial
      .replace(/\s+/g, "-")
      .toLowerCase()}.docx`
  );
};
