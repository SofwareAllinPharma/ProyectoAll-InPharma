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
import type { Pedido } from "../../types/pedido.types";
import type { InsumoRequerido } from "../../utils/insumos.utils";

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

const thinBorder = { style: BorderStyle.SINGLE, size: 3, color: "CCCCCC" };
const accentBorder = { style: BorderStyle.SINGLE, size: 8, color: "9D977B" };

const infoRow = (label: string, value: string) =>
  new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, bold: true, size: 18, font: "Helvetica" })],
            spacing: { before: 40, after: 40 },
            margins: { left: 80 },
          }),
        ],
        width: { size: 40, type: WidthType.PERCENTAGE },
        shading: { fill: "F5F3EB" },
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: value, size: 18, font: "Helvetica" })],
            spacing: { before: 40, after: 40 },
            margins: { left: 80 },
          }),
        ],
        width: { size: 60, type: WidthType.PERCENTAGE },
      }),
    ],
  });

const sectionTitle = (text: string) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, font: "Helvetica", color: "374151" })],
    spacing: { before: 240, after: 80 },
    border: { bottom: accentBorder },
  });

export const generatePedidoWord = async (pedido: Pedido, insumos: InsumoRequerido[]) => {
  const estadoNombre = pedido.cambioActual?.estado?.nombre ?? "";
  const estadoLabel = ESTADO_LABELS[estadoNombre] ?? estadoNombre;
  const cambios = pedido.cambios ?? [];
  const cantReal = pedido.cantElaborada_paquetes;
  const hayDiferencia = cantReal != null && cantReal !== pedido.cantAProducir_paquetes;

  const children: any[] = [
    // Título
    new Paragraph({
      children: [
        new TextRun({ text: `Pedido PED-${pedido.numPedido}`, bold: true, size: 40, font: "Helvetica" }),
      ],
      spacing: { after: 60 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: "000000" } },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Emitido: ${formatDate(new Date())}   ·   Creado: ${formatDate(pedido.createdAt)}`,
          size: 16,
          font: "Helvetica",
          color: "6b7280",
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Estado: ", bold: true, size: 18, font: "Helvetica" }),
        new TextRun({ text: estadoLabel, size: 18, font: "Helvetica", color: "5d5448" }),
      ],
      spacing: { after: 160 },
    }),

    // Información del pedido
    sectionTitle("Información del Pedido"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: accentBorder, bottom: accentBorder,
        left: accentBorder, right: accentBorder,
        insideHorizontal: thinBorder, insideVertical: thinBorder,
      },
      rows: [
        infoRow("Producto", pedido.producto?.nombreComercial ?? `#${pedido.idProducto}`),
        infoRow("Cant. estimada (paquetes)", String(pedido.cantAProducir_paquetes)),
        infoRow("Cant. estimada (gramos)", `${pedido.cantAProducir_gramos} g`),
        infoRow(
          "Cant. estimada (porciones)",
          pedido.producto?.cantPorcionesAportadas
            ? `${Math.round(pedido.cantAProducir_porciones)}  (1 paquete = ${pedido.producto.cantPorcionesAportadas} porciones)`
            : String(Math.round(pedido.cantAProducir_porciones))
        ),
        ...(pedido.observacion ? [infoRow("Observación", pedido.observacion)] : []),
      ],
    }),

    // Cantidad real elaborada
    ...(cantReal != null
      ? [
          sectionTitle("Cantidad Real Elaborada"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: accentBorder, bottom: accentBorder,
              left: accentBorder, right: accentBorder,
              insideHorizontal: thinBorder, insideVertical: thinBorder,
            },
            rows: [
              infoRow("Paquetes elaborados", String(cantReal)),
              ...(pedido.cantElaborada_gramos != null
                ? [infoRow("Gramos elaborados", `${pedido.cantElaborada_gramos} g`)]
                : []),
            ],
          }),
          ...(hayDiferencia
            ? [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Diferencia: ${cantReal! - pedido.cantAProducir_paquetes > 0 ? "+" : ""}${(cantReal! - pedido.cantAProducir_paquetes).toFixed(2)} paquetes respecto a lo estimado`,
                      size: 16,
                      font: "Helvetica",
                      color: "92400e",
                    }),
                  ],
                  spacing: { before: 80, after: 0 },
                  shading: { fill: "fef3c7" } as any,
                }),
              ]
            : []),
        ]
      : []),

    // Responsables
    sectionTitle("Responsables"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: accentBorder, bottom: accentBorder,
        left: accentBorder, right: accentBorder,
        insideHorizontal: thinBorder, insideVertical: thinBorder,
      },
      rows: [
        infoRow("Creador", pedido.mailUsuarioCreador),
        ...(pedido.mailUsuarioCocinero
          ? [infoRow("Técnico asignado", pedido.mailUsuarioCocinero)]
          : []),
      ],
    }),
  ];

  // Insumos
  if (insumos.length > 0) {
    children.push(sectionTitle("Insumos Requeridos (estimado)"));
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: accentBorder, bottom: accentBorder,
          left: accentBorder, right: accentBorder,
          insideHorizontal: thinBorder, insideVertical: thinBorder,
        },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Insumo", bold: true, size: 16, font: "Helvetica" })],
                    spacing: { before: 40, after: 40 },
                    margins: { left: 80 },
                  }),
                ],
                width: { size: 70, type: WidthType.PERCENTAGE },
                shading: { fill: "F5F3EB" },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "Cantidad (g)", bold: true, size: 16, font: "Helvetica" })],
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 40, after: 40 },
                    margins: { right: 80 },
                  }),
                ],
                width: { size: 30, type: WidthType.PERCENTAGE },
                shading: { fill: "F5F3EB" },
              }),
            ],
          }),
          ...insumos.map(
            (ins) =>
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: ins.nombre, size: 18, font: "Helvetica" })],
                        spacing: { before: 40, after: 40 },
                        margins: { left: 80 },
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `${ins.cantidad.toFixed(2)} g`, size: 18, font: "Helvetica" }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 40, after: 40 },
                        margins: { right: 80 },
                      }),
                    ],
                  }),
                ],
              })
          ),
        ],
      })
    );
  }

  // Historial
  if (cambios.length > 0) {
    children.push(sectionTitle("Historial de Estados"));
    [...cambios].reverse().forEach((c) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: ESTADO_LABELS[c.estado?.nombre ?? ""] ?? c.estado?.nombre ?? "",
              bold: true,
              size: 18,
              font: "Helvetica",
            }),
            new TextRun({ text: "  ", size: 18 }),
            new TextRun({
              text: formatDate(c.fechaHoraInicio) + (c.responsable ? ` · ${c.responsable}` : ""),
              size: 16,
              font: "Helvetica",
              color: "6b7280",
            }),
          ],
          spacing: { before: 80, after: 40 },
          indent: { left: 200 },
          border: { left: { style: BorderStyle.SINGLE, size: 8, color: "9D977B" } },
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `pedido-PED-${pedido.numPedido}.docx`);
};
