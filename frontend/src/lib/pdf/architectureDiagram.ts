import type { Column, Content, TableCell } from "pdfmake/interfaces";
import { PDF_COLORS, mmToPt } from "./pdfReportLayout";

export type DiagramLayer = {
  title: string;
  points: string;
  detail: string;
};

// One arrow-prefixed note on a connector, e.g. "↓ 3 interfaces in".
export type DiagramConnector = { arrow: "↓" | "↑" | "→" | "←"; text: string };

export type ArchitectureDiagramData = {
  ui: DiagramLayer;
  business: DiagramLayer;
  database: DiagramLayer;
  external: DiagramLayer;
  uiBusiness: [DiagramConnector, DiagramConnector];
  businessDatabase: [DiagramConnector, DiagramConnector];
  businessExternal: [DiagramConnector, DiagramConnector];
};

const LAYER_BORDER = "#5b8cc5";
const LAYER_FILL = "#b9d2ec";
const CONNECTOR_FILL = "#e5eff9";

const COLUMN_WIDTHS = [mmToPt(75), mmToPt(26), mmToPt(40)];
const ROW_HEIGHTS = [
  mmToPt(17),
  mmToPt(13),
  mmToPt(19),
  mmToPt(13),
  mmToPt(17),
];
export const ARCHITECTURE_DIAGRAM_WIDTH = COLUMN_WIDTHS.reduce(
  (sum, width) => sum + width,
  0,
);

type Sides<T> = [T, T, T, T];
const boxBorder = {
  border: [true, true, true, true] as Sides<boolean>,
  borderColor: [
    LAYER_BORDER,
    LAYER_BORDER,
    LAYER_BORDER,
    LAYER_BORDER,
  ] as Sides<string>,
};

// pdfmake has no vertical alignment inside a fixed-height cell, so the content is nudged down by
// `lines` worth of leading to look centered.
const topMargin = (rowHeight: number, lines: number, fontSize = 9) =>
  Math.max(0, (rowHeight - lines * fontSize * 1.2) / 2 - 3);

const layerCell = (layer: DiagramLayer, rowHeight: number): TableCell => ({
  stack: [
    { text: layer.title, fontSize: 9 },
    { text: layer.points, fontSize: 11, bold: true },
    { text: layer.detail, fontSize: 9 },
  ],
  alignment: "center",
  fillColor: LAYER_FILL,
  margin: [0, topMargin(rowHeight, 3, 10), 0, 0],
  ...boxBorder,
});

// Roboto has no arrow glyphs (they render as empty boxes), so the arrowheads are small inline SVG
// triangles instead of characters. pdfmake's `canvas` was tried first, but inside these table
// cells it drew the triangles at the wrong y position.
const ARROW_POINTS: Record<DiagramConnector["arrow"], string> = {
  "↓": "0,1 8,1 4,8",
  "↑": "0,8 8,8 4,1",
  "→": "1,0 1,8 8,4",
  "←": "8,0 8,8 1,4",
};

const arrowSvg = (arrow: DiagramConnector["arrow"]) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 9 9"><polygon points="${ARROW_POINTS[arrow]}" fill="${LAYER_BORDER}"/></svg>`;

// An arrowhead followed by its text, as two column items. A row of connectors is a single flat
// `columns` of [arrow, text, arrow, text].
const connectorParts = ({ arrow, text }: DiagramConnector): Column[] => [
  { width: 10, svg: arrowSvg(arrow), margin: [0, 1, 0, 0] },
  { width: "*", text, fontSize: 8, alignment: "left" },
];

const connectorBox = (
  connectors: DiagramConnector[],
  layout: "row" | "column",
  rowHeight: number,
): TableCell => ({
  ...(layout === "row"
    ? {
        // A one-item stack: a bare `columns` as the cell content misplaces its canvas arrows.
        stack: [{ columns: connectors.flatMap(connectorParts), columnGap: 2 }],
      }
    : {
        stack: connectors.map((connector) => ({
          columns: connectorParts(connector),
          columnGap: 2,
        })),
      }),
  alignment: "center",
  fillColor: CONNECTOR_FILL,
  margin: [
    0,
    topMargin(rowHeight, layout === "row" ? 2 : connectors.length, 8),
    0,
    0,
  ],
  ...boxBorder,
});

// Simplified version of the old CSS-grid diagram: the three MLA layers stacked on the left with
// their connectors between them, and the external applications on the right of the business layer.
// Flat boxes and text arrows instead of gradients and drawn arrowheads, so everything stays text.
export const createArchitectureDiagram = (
  data: ArchitectureDiagramData,
  margin?: [number, number, number, number],
): Content => ({
  margin,
  table: {
    widths: COLUMN_WIDTHS,
    heights: ROW_HEIGHTS,
    body: [
      [layerCell(data.ui, ROW_HEIGHTS[0]), { text: "" }, { text: "" }],
      [
        connectorBox(data.uiBusiness, "row", ROW_HEIGHTS[1]),
        { text: "" },
        { text: "" },
      ],
      [
        layerCell(data.business, ROW_HEIGHTS[2]),
        connectorBox(data.businessExternal, "column", ROW_HEIGHTS[2]),
        layerCell(data.external, ROW_HEIGHTS[2]),
      ],
      [
        connectorBox(data.businessDatabase, "row", ROW_HEIGHTS[3]),
        { text: "" },
        { text: "" },
      ],
      [layerCell(data.database, ROW_HEIGHTS[4]), { text: "" }, { text: "" }],
    ],
  },
  layout: {
    defaultBorder: false,
    hLineColor: () => PDF_COLORS.border,
    paddingLeft: () => 4,
    paddingRight: () => 4,
    paddingTop: () => 0,
    paddingBottom: () => 0,
  },
});
