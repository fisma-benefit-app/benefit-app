import type {
  Content,
  ContentTable,
  CustomTableLayout,
  StyleDictionary,
  TableCell,
  TDocumentDefinitions,
} from "pdfmake/interfaces";

// pdfmake measures everything in points (1/72 in), the old CSS reports used mm.
export const mmToPt = (mm: number) => (mm * 72) / 25.4;

export const PDF_COLORS = {
  text: "#202020",
  mutedText: "#5f5f6b",
  heading: "#25205f",
  border: "#999999",
  tableHeaderFill: "#e9e8ef",
  subHeadingFill: "#f4f3f8",
  subRowFill: "#fafafa",
  // Calculation report sub-component rows: "to other applications" / "from other applications"
  sentFill: "#e6f4ea",
  receivedFill: "#fdf0e0",
  changedBlue: "#0000ff",
  changedRed: "#b00020",
  deltaGreen: "#087443",
} as const;

// Style names usable as `style: "..."` on any content node.
export const reportStyles: StyleDictionary = {
  h1: { fontSize: 18, bold: true, margin: [0, 0, 0, 8] },
  h2: {
    fontSize: 14,
    bold: true,
    color: PDF_COLORS.heading,
    margin: [0, 8, 0, 4],
  },
  h3: { fontSize: 11, bold: true, margin: [0, 10, 0, 4] },
  tableHeader: { bold: true, fillColor: PDF_COLORS.tableHeaderFill },
  small: { fontSize: 7 },
};

// Thin grey grid, close to the old `border: 1px solid` table CSS.
export const reportTableLayout: CustomTableLayout = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => PDF_COLORS.border,
  vLineColor: () => PDF_COLORS.border,
  paddingLeft: () => 4,
  paddingRight: () => 4,
  paddingTop: () => 3,
  paddingBottom: () => 3,
};

type ReportDocumentOptions = {
  content: Content;
  title?: string;
  pageOrientation?: "portrait" | "landscape";
  // Defaults to 10 mm sides / 12 mm top / 14 mm bottom (the bottom leaves room for the footer).
  pageMargins?: [number, number, number, number];
  fontSize?: number;
};

// Shared page setup for both reports: A4, Roboto, "page / total" footer.
export const createReportDocument = ({
  content,
  title,
  pageOrientation = "portrait",
  pageMargins = [mmToPt(10), mmToPt(12), mmToPt(10), mmToPt(14)],
  fontSize = 9,
}: ReportDocumentOptions): TDocumentDefinitions => ({
  info: { title },
  pageSize: "A4",
  pageOrientation,
  pageMargins,
  defaultStyle: { font: "Roboto", fontSize, color: PDF_COLORS.text },
  styles: reportStyles,
  content,
  footer: (currentPage, pageCount) => ({
    text: `${currentPage} / ${pageCount}`,
    alignment: "center",
    fontSize: 8,
    margin: [0, mmToPt(5), 0, 0],
  }),
});

export type CellOptions = {
  bold?: boolean;
  color?: string;
  fillColor?: string;
  alignment?: "left" | "center" | "right";
  // Extra left indent in points, e.g. for subcomponent rows.
  indent?: number;
};

const toText = (value: string | number | null | undefined) =>
  value == null ? "" : String(value);

export const headerCell = (
  text: string,
  alignment?: CellOptions["alignment"],
): TableCell => ({
  text,
  style: "tableHeader",
  ...(alignment ? { alignment } : {}),
});

export const textCell = (
  value: string | number | null | undefined,
  { indent, ...options }: CellOptions = {},
): TableCell => ({
  text: toText(value),
  ...options,
  ...(indent ? { margin: [indent, 0, 0, 0] } : {}),
});

// pdfmake spreads a cell over `span` columns by following it with `span - 1` empty placeholders.
export const spanningCell = (
  value: string | number | null | undefined,
  span: number,
  options?: CellOptions,
): TableCell[] => [
  Object.assign(textCell(value, options), { colSpan: span }),
  ...Array.from({ length: span - 1 }, (): TableCell => ({})),
];

// Highlights a value that differs from the previous version in bold `color` (the calculation
// report uses blue).
export const changedCell = (
  value: string | number | null | undefined,
  changed: boolean,
  color: string,
  options?: CellOptions,
): TableCell =>
  changed
    ? textCell(value, { ...options, color, bold: true })
    : textCell(value, options);

type ReportTableOptions = {
  headers: string[];
  rows: TableCell[][];
  widths: (number | string)[];
  margin?: [number, number, number, number];
  // Per-column header alignment, e.g. "right" above right-aligned number columns
  headerAlignments?: CellOptions["alignment"][];
};

// A table with a repeating header row. There is deliberately no bottom margin: when a table ends
// exactly at the bottom of a page, a trailing margin makes pdfmake add an empty extra page. Spacing
// below a table comes from the top margin of whatever follows (e.g. the h3 style).
// Rows never split across a page break, and the first body
// row stays with the header so a header is never left alone at the bottom of a page (replaces the
// old `.keep-together` / `tr { page-break-inside: avoid }` CSS).
export const reportTable = ({
  headers,
  rows,
  widths,
  margin = [0, 4, 0, 0],
  headerAlignments,
}: ReportTableOptions): ContentTable => ({
  table: {
    headerRows: 1,
    keepWithHeaderRows: 1,
    dontBreakRows: true,
    widths,
    body: [
      headers.map((header, index) =>
        headerCell(header, headerAlignments?.[index]),
      ),
      ...rows,
    ],
  },
  layout: reportTableLayout,
  margin,
});

// Keeps a block (e.g. a heading plus its short table) on one page where it fits.
export const keepTogether = (...content: Content[]): Content => ({
  unbreakable: true,
  stack: content,
});
