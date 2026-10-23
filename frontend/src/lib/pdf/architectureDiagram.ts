import type { Content } from "pdfmake/interfaces";
import { PDF_COLORS } from "./pdfReportLayout";

export type DiagramLayer = {
  title: string;
  points: string;
  // Difference to the previous report version, already formatted like the report tables print it,
  // e.g. "(+3.50)". Left out when nothing changed or there is no previous version.
  delta?: string;
  detail: string;
  // The same for the count in `detail` (functions, concepts, interfaces).
  detailDelta?: string;
};

export type DiagramConnector = {
  text: string;
  // Difference of the count in `text` to the previous report version, e.g. "(+2)".
  delta?: string;
};

// What flows between the business layer and one neighbour: `in` towards the business layer,
// `out` away from it.
export type DiagramInterfaces = { in: DiagramConnector; out: DiagramConnector };

export type ArchitectureDiagramData = {
  ui: DiagramLayer;
  business: DiagramLayer;
  database: DiagramLayer;
  external: DiagramLayer;
  uiBusiness: DiagramInterfaces;
  businessDatabase: DiagramInterfaces;
  businessExternal: DiagramInterfaces;
};

// The width of the report's content area on A4 (210 mm minus 12 mm margins), in pt.
export const ARCHITECTURE_DIAGRAM_WIDTH = 527;
const HEIGHT = 296;

const COLORS = {
  ink: "#1d2b44",
  muted: "#4f5f78",
  layerBorder: "#5b8cc5",
  ui: "#dbe8f6",
  business: "#bcd5ee",
  database: "#9fc2e6",
};

// Layer boxes stacked in the middle, the external applications on both sides: what flows in comes
// from the left pillar and what flows out goes to the right one. All geometry is in pt.
const PILLAR_WIDTH = 104;
const SIDE_GAP = 34;
const STACK_X = PILLAR_WIDTH + SIDE_GAP;
// One pt short of the full width so a stroke on the outermost box is not clipped by the viewport.
const STACK_WIDTH = ARCHITECTURE_DIAGRAM_WIDTH - 2 * STACK_X - 2;
const LAYER_PADDING = 14;

type Box = { x: number; y: number; w: number; h: number };
const UI_BOX: Box = { x: STACK_X, y: 0, w: STACK_WIDTH, h: 56 };
const UI_BUSINESS_GAP: Box = { x: STACK_X, y: 56, w: STACK_WIDTH, h: 34 };
const BUSINESS_BOX: Box = { x: STACK_X, y: 90, w: STACK_WIDTH, h: 76 };
const BUSINESS_DATABASE_GAP: Box = {
  x: STACK_X,
  y: 166,
  w: STACK_WIDTH,
  h: 34,
};
const DATABASE_BOX: Box = { x: STACK_X, y: 200, w: STACK_WIDTH, h: 56 };
const CAPTION_Y = 284;

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type TextOptions = {
  x: number;
  y: number;
  size: number;
  bold?: boolean;
  fill?: string;
  anchor?: "start" | "middle" | "end";
};

const textAttributes = ({
  x,
  y,
  size,
  bold = false,
  fill = COLORS.ink,
  anchor = "start",
}: TextOptions) =>
  `x="${x}" y="${y}" font-family="Roboto" font-size="${size}" font-weight="${bold ? "bold" : "normal"}" fill="${fill}" text-anchor="${anchor}"`;

const text = (value: string, options: TextOptions) =>
  `<text ${textAttributes(options)}>${escapeXml(value)}</text>`;

// The delta is a separate, bold blue run after the value, so a changed figure keeps its normal
// colour and only the difference is highlighted.
const deltaRun = (delta: string | undefined) =>
  delta
    ? `<tspan fill="${PDF_COLORS.changedBlue}" font-weight="bold"> ${escapeXml(delta)}</tspan>`
    : "";

const textWithDelta = (
  value: string,
  delta: string | undefined,
  options: TextOptions,
) =>
  `<text ${textAttributes(options)}>${escapeXml(value)}${deltaRun(delta)}</text>`;

const rect = (
  { x, y, w, h }: Box,
  fill: string,
  stroke: string,
  radius: number,
  strokeWidth = 1,
) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;

// A straight arrow whose head ends exactly at (x2, y2). Drawn as a line plus a triangle because
// Roboto has no arrow glyphs.
const arrow = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number,
  head: number,
) => {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / length;
  const uy = (y2 - y1) / length;
  const baseX = x2 - ux * head;
  const baseY = y2 - uy * head;
  const wingX = -uy * head * 0.55;
  const wingY = ux * head * 0.55;
  return (
    `<line x1="${x1}" y1="${y1}" x2="${baseX + ux}" y2="${baseY + uy}" stroke="${color}" stroke-width="${width}"/>` +
    `<polygon points="${x2},${y2} ${baseX + wingX},${baseY + wingY} ${baseX - wingX},${baseY - wingY}" fill="${color}"/>`
  );
};

// Title and count on the left, the points large on the right with their delta underneath.
const layer = (box: Box, data: DiagramLayer, fill: string) => {
  const centerY = box.y + box.h / 2;
  const pointsY = centerY + 5 - (data.delta ? 3 : 0);
  const right = box.x + box.w - LAYER_PADDING;
  return (
    rect(box, fill, COLORS.layerBorder, 7) +
    text(data.title, {
      x: box.x + LAYER_PADDING,
      y: centerY - 2,
      size: 9,
      bold: true,
    }) +
    textWithDelta(data.detail, data.detailDelta, {
      x: box.x + LAYER_PADDING,
      y: centerY + 11,
      size: 8,
      fill: COLORS.muted,
    }) +
    text(data.points, {
      x: right,
      y: pointsY,
      size: 15,
      bold: true,
      anchor: "end",
    }) +
    (data.delta
      ? text(data.delta, {
          x: right,
          y: pointsY + 13,
          size: 8.5,
          bold: true,
          fill: PDF_COLORS.changedBlue,
          anchor: "end",
        })
      : "")
  );
};

// The two arrows between the business layer and a neighbouring layer, each with its label.
// `inDown` says which way "in" (towards the business layer) points: down when the neighbour is
// above the business layer.
const verticalInterfaces = (
  gap: Box,
  interfaces: DiagramInterfaces,
  inDown: boolean,
) => {
  const one = (
    connector: DiagramConnector,
    x: number,
    down: boolean,
    color: string,
  ) =>
    arrow(
      x,
      down ? gap.y + 3 : gap.y + gap.h - 3,
      x,
      down ? gap.y + gap.h - 3 : gap.y + 3,
      color,
      1.6,
      7,
    ) +
    textWithDelta(connector.text, connector.delta, {
      x: x + 10,
      y: gap.y + gap.h / 2 + 3,
      size: 8,
    });
  // The first arrow lines up with the layer text above it; the second leaves room for a long
  // first label.
  const leftX = gap.x + LAYER_PADDING;
  const rightX = gap.x + gap.w * 0.58;
  const [first, second] = inDown
    ? [
        {
          connector: interfaces.in,
          down: true,
          color: PDF_COLORS.receivedAccent,
        },
        {
          connector: interfaces.out,
          down: false,
          color: PDF_COLORS.sentAccent,
        },
      ]
    : [
        { connector: interfaces.out, down: true, color: PDF_COLORS.sentAccent },
        {
          connector: interfaces.in,
          down: false,
          color: PDF_COLORS.receivedAccent,
        },
      ];
  return (
    one(first.connector, leftX, first.down, first.color) +
    one(second.connector, rightX, second.down, second.color)
  );
};

const pillar = (
  x: number,
  title: string,
  connector: DiagramConnector,
  fill: string,
  stroke: string,
) => {
  const box: Box = {
    x: x + 1,
    y: BUSINESS_BOX.y - 16,
    w: PILLAR_WIDTH,
    h: BUSINESS_BOX.h + 32,
  };
  const centerX = x + PILLAR_WIDTH / 2;
  const countY = box.y + box.h / 2 + (connector.delta ? 2 : 8);
  return (
    rect(box, fill, stroke, 8, 1.2) +
    text(title, {
      x: centerX,
      y: box.y + 22,
      size: 8,
      bold: true,
      anchor: "middle",
    }) +
    text(connector.text, {
      x: centerX,
      y: countY,
      size: 12,
      bold: true,
      anchor: "middle",
    }) +
    (connector.delta
      ? text(connector.delta, {
          x: centerX,
          y: countY + 14,
          size: 9,
          bold: true,
          fill: PDF_COLORS.changedBlue,
          anchor: "middle",
        })
      : "")
  );
};

const diagramSvg = (data: ArchitectureDiagramData) => {
  const middleY = BUSINESS_BOX.y + BUSINESS_BOX.h / 2;
  const rightPillarX = ARCHITECTURE_DIAGRAM_WIDTH - 1 - PILLAR_WIDTH - 1;
  return (
    layer(UI_BOX, data.ui, COLORS.ui) +
    layer(BUSINESS_BOX, data.business, COLORS.business) +
    layer(DATABASE_BOX, data.database, COLORS.database) +
    verticalInterfaces(UI_BUSINESS_GAP, data.uiBusiness, true) +
    verticalInterfaces(BUSINESS_DATABASE_GAP, data.businessDatabase, false) +
    pillar(
      0,
      data.external.title,
      data.businessExternal.in,
      PDF_COLORS.receivedFill,
      PDF_COLORS.receivedAccent,
    ) +
    pillar(
      rightPillarX,
      data.external.title,
      data.businessExternal.out,
      PDF_COLORS.sentFill,
      PDF_COLORS.sentAccent,
    ) +
    arrow(
      PILLAR_WIDTH,
      middleY,
      STACK_X,
      middleY,
      PDF_COLORS.receivedAccent,
      2.2,
      9,
    ) +
    arrow(
      STACK_X + STACK_WIDTH,
      middleY,
      rightPillarX + 1,
      middleY,
      PDF_COLORS.sentAccent,
      2.2,
      9,
    ) +
    // The external applications' own total, which belongs to both pillars, centred beneath them.
    `<text ${textAttributes({ x: ARCHITECTURE_DIAGRAM_WIDTH / 2, y: CAPTION_Y, size: 8.5, fill: COLORS.muted, anchor: "middle" })}>` +
    `${escapeXml(`${data.external.title}: ${data.external.points}`)}${deltaRun(data.external.delta)} · ` +
    `${escapeXml(data.external.detail)}${deltaRun(data.external.detailDelta)}</text>`
  );
};

// The multilayer architecture picture on the overview report's calculation page: the three layers
// with the interfaces between them, and the interfaces to and from other applications. Drawn as
// one SVG so the layout is free of table-cell limits; its text stays text in the PDF.
export const createArchitectureDiagram = (
  data: ArchitectureDiagramData,
  margin?: [number, number, number, number],
): Content => ({
  margin,
  width: ARCHITECTURE_DIAGRAM_WIDTH,
  height: HEIGHT,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${ARCHITECTURE_DIAGRAM_WIDTH}" height="${HEIGHT}" viewBox="0 0 ${ARCHITECTURE_DIAGRAM_WIDTH} ${HEIGHT}">${diagramSvg(data)}</svg>`,
});
