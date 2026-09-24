import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { TGenericComponent } from "./types";

const PDF_PAGE_WIDTH_MM = 210;
const PDF_PAGE_HEIGHT_MM = 297;
const PDF_CANVAS_MAX_PX = 32767;
const KEEP_TOGETHER_CLASS = "keep-together";

type KeepTogetherRange = { start: number; end: number };

const getOffsetTopRelativeTo = (element: HTMLElement, root: HTMLElement) => {
  const rootRect = root.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  return elementRect.top - rootRect.top + root.scrollTop;
};

const rangeFromElement = (
  block: HTMLElement,
  root: HTMLElement,
): KeepTogetherRange | null => {
  const view = root.ownerDocument.defaultView;
  const style = view?.getComputedStyle(block);
  const marginTop = style ? Number.parseFloat(style.marginTop) || 0 : 0;
  const marginBottom = style ? Number.parseFloat(style.marginBottom) || 0 : 0;
  const start = getOffsetTopRelativeTo(block, root) - marginTop;
  const end = start + block.offsetHeight + marginTop + marginBottom;
  return end > start ? { start: Math.max(0, start), end } : null;
};

const getKeepTogetherRanges = (root: HTMLElement): KeepTogetherRange[] => {
  const seen = new Set<HTMLElement>();
  const ranges: KeepTogetherRange[] = [];

  const add = (block: HTMLElement | null) => {
    if (!block || seen.has(block)) return;
    seen.add(block);
    const range = rangeFromElement(block, root);
    if (range) ranges.push(range);
  };

  root
    .querySelectorAll<HTMLElement>(`.${KEEP_TOGETHER_CLASS}`)
    .forEach((block) => add(block));

  root.querySelectorAll<HTMLElement>("h2, h3").forEach((heading) => {
    const table = heading.nextElementSibling;
    if (table instanceof HTMLTableElement) {
      add(
        heading.parentElement instanceof HTMLElement
          ? heading.parentElement
          : heading,
      );
    }
  });

  return ranges;
};

const toCanvasRanges = (
  ranges: KeepTogetherRange[],
  cssHeight: number,
  canvasHeight: number,
): KeepTogetherRange[] => {
  const scaleY = canvasHeight / Math.max(cssHeight, 1);
  return ranges.map((range) => ({
    start: range.start * scaleY,
    end: range.end * scaleY,
  }));
};

const nextSliceEnd = (
  renderedY: number,
  pageHeightPx: number,
  canvasHeight: number,
  ranges: KeepTogetherRange[],
) => {
  let sliceEnd = Math.min(renderedY + pageHeightPx, canvasHeight);

  for (const range of ranges) {
    const rangeHeight = range.end - range.start;
    if (rangeHeight >= pageHeightPx - 1) continue;
    if (
      range.start < sliceEnd &&
      range.end > sliceEnd &&
      range.start > renderedY
    ) {
      sliceEnd = Math.floor(range.start);
    }
  }

  if (sliceEnd <= renderedY) {
    sliceEnd = Math.min(renderedY + pageHeightPx, canvasHeight);
  }

  return sliceEnd;
};

const ensurePdfFilename = (filename: string) =>
  filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;

// jsPDF's own pdf.save() builds a detached <a download> and dispatches a synthetic click on it
// without ever attaching it to the document. Chrome accepts that; Firefox silently ignores a
// download click on an element that was never in the DOM. Downloading the blob ourselves, through
// an anchor that's actually attached, works the same way in both.
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 40000);
};

const waitForNextPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

// A hidden, shadow-DOM-isolated host in the main document, used instead of a hidden iframe to
// build report content for html2canvas to capture. html2canvas itself clones whatever it captures
// into its own temporary iframe to measure styles - that's a normal, well-supported case. Doing
// the same from inside a hidden iframe of our own meant html2canvas's iframe was nested inside
// ours, and that double nesting is unreliable in Firefox: html2canvas's clone can fail to pick up
// a contentWindow for its iframe, or hang indefinitely waiting on it, well past a single retry (see
// git history for this file). The shadow root gives the same style isolation (report CSS can't
// leak onto the app, app CSS can't leak into the report) without a second browsing context.
export const createHiddenContainer = (): {
  host: HTMLDivElement;
  root: ShadowRoot;
} => {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:fixed;left:-10000px;top:0;width:210mm;pointer-events:none;background:#ffffff;";
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });
  return { host, root };
};

export const waitForContentReady = async () => {
  await waitForNextPaint();
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const CAPTURE_TIMEOUT_MS = 20000;

// html2canvas can hang indefinitely instead of resolving or rejecting - seen in Firefox, where it
// never settles at all (no error, no timeout of its own), unlike the occasional immediate
// rejection this same wrapper also retries below. Race it against a timeout so a browser where
// this hangs fails with a message the user can see instead of silently never finishing.
const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });

// html2canvas clones the target into a temporary same-origin iframe of its own (separate from
// the hidden iframe this file uses) to measure styles accurately, and occasionally rejects with
// "Unable to find iframe window" if that iframe's contentWindow isn't ready yet - a known race in
// html2canvas itself (not specific to our markup), not consistently reproducible. One retry after
// a short delay is the accepted workaround.

// 3x a CSS pixel is roughly 288 DPI-equivalent - crisp on a 4K/high-DPI display (and when a
// viewer zooms into the PDF a bit), not just at 100% zoom on a standard display. Verified: text
// that was visibly soft when magnified at the old scale of 2 is clean and sharp at the same
// magnification here. Only affordable file-size-wise because pages are JPEG, not PNG (see
// addCanvasToPdf below) - the same jump at scale 2 with lossless PNG is what produced 70MB+ PDFs
// for larger projects. WebP was tried too (better compression than JPEG at equal quality) but PDF
// has no native WebP image filter, so jsPDF just decodes and re-encodes it as JPEG anyway - not
// worth the extra lossy compression pass for no benefit.
const CAPTURE_SCALE = 3;

// The largest vertical window of the element (in CSS px) that can be captured in one html2canvas
// call without the resulting canvas exceeding the browser's max canvas dimension at CAPTURE_SCALE.
// 5% headroom under the true ceiling to absorb rounding.
//
// This is what downloadElementsAsPdf uses to split a tall element into multiple capture calls
// (captureElementChunks below) instead of capturing it in one shot. The calculation report builds
// its *entire* multi-page content as a single element and only slices the resulting canvas into
// pages afterwards (see addCanvasToPdf), unlike the overview report, which captures each already
// page-sized `.page` element separately. For a small project that one giant capture stays under
// the canvas size ceiling and CAPTURE_SCALE applies in full; for a large one it doesn't, and
// captureElement used to silently divide the scale down to whatever fit - down to a fraction of a
// CSS pixel for a large enough report, i.e. far blurrier than even the old scale of 2, with no
// error or indication anywhere that it had happened. Confirmed directly: a 300-component project's
// calculation report page images were 617px wide (effective scale ~0.78) despite CAPTURE_SCALE
// being 3, while the same project's overview report stayed at the full scale throughout, since its
// captured elements are always page-sized regardless of the project's total size. Chunking the
// capture keeps every element's effective scale at the full CAPTURE_SCALE regardless of how much
// content it holds.
const MAX_CHUNK_CSS_HEIGHT = Math.max(
  1,
  Math.floor((PDF_CANVAS_MAX_PX * 0.95) / CAPTURE_SCALE),
);

const captureElement = async (
  element: HTMLElement,
  y: number,
  height: number,
) => {
  const options = {
    scale: CAPTURE_SCALE,
    y,
    height,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  };
  const timeoutMessage = "Timed out capturing PDF page content";
  try {
    return await withTimeout(
      html2canvas(element, options),
      CAPTURE_TIMEOUT_MS,
      timeoutMessage,
    );
  } catch {
    await sleep(300);
    return withTimeout(
      html2canvas(element, options),
      CAPTURE_TIMEOUT_MS,
      timeoutMessage,
    );
  }
};

type PdfLayoutState = {
  isEmpty: boolean;
  // How much vertical space (mm) is left on the current PDF page. Only meaningful once
  // isEmpty is false. Lets addCanvasToPdf be called more than once per logical page (once
  // per capture chunk - see MAX_CHUNK_CSS_HEIGHT) without starting a new PDF page at every
  // chunk boundary: later chunks of the *same* element continue filling wherever the
  // previous chunk left off, rather than each chunk always starting its own fresh page.
  pageRemainingMm: number;
};

// Called once a full element has been fully written (all its chunks placed), for the case where
// each *element* in `elements` (e.g. each overview-report `.page`) is meant to start its own PDF
// page - as opposed to chunks of a single element, which should flow onto the current page.
const forceNewPageNext = (state: PdfLayoutState) => {
  state.pageRemainingMm = 0;
};

const addCanvasToPdf = (
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  state: PdfLayoutState,
  keepTogetherRanges: KeepTogetherRange[] = [],
) => {
  const pxPerMm = canvas.width / PDF_PAGE_WIDTH_MM;
  const pageCanvas = document.createElement("canvas");
  const pageCtx = pageCanvas.getContext("2d");
  if (!pageCtx) {
    throw new Error("Could not create PDF page canvas");
  }

  let renderedY = 0;
  while (renderedY < canvas.height) {
    if (!state.isEmpty && state.pageRemainingMm <= 0) {
      pdf.addPage();
      state.pageRemainingMm = PDF_PAGE_HEIGHT_MM;
    }
    // How much of the *current* PDF page this slice may fill: the whole page for the very
    // first slice ever (isEmpty, using the page new jsPDF() already starts with), otherwise
    // whatever's left on the page chunks before this one have already partially filled.
    const availableMm = state.isEmpty
      ? PDF_PAGE_HEIGHT_MM
      : state.pageRemainingMm;
    const availablePx = Math.max(1, Math.floor(availableMm * pxPerMm));

    const sliceEnd = nextSliceEnd(
      renderedY,
      availablePx,
      canvas.height,
      keepTogetherRanges,
    );
    const sliceHeight = sliceEnd - renderedY;
    const sliceHeightMm = sliceHeight / pxPerMm;
    const yMm = PDF_PAGE_HEIGHT_MM - availableMm;

    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    pageCtx.fillStyle = "#ffffff";
    pageCtx.fillRect(0, 0, canvas.width, sliceHeight);
    pageCtx.drawImage(
      canvas,
      0,
      renderedY,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );
    pdf.addImage(
      // PDF has no native WebP image filter (only JPEG/JPEG2000/CCITT fax/Flate), so jsPDF can't
      // actually embed a WebP page as-is - it silently decodes and re-encodes it as JPEG
      // internally, which just means paying for two lossy compression passes for nothing. Encode
      // straight to JPEG.
      pageCanvas.toDataURL("image/jpeg", 0.85),
      "JPEG",
      0,
      yMm,
      PDF_PAGE_WIDTH_MM,
      sliceHeightMm,
    );

    state.isEmpty = false;
    state.pageRemainingMm = availableMm - sliceHeightMm;
    renderedY = sliceEnd;
  }
};

export const downloadElementsAsPdf = async (
  elements: HTMLElement[],
  filename: string,
) => {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const state: PdfLayoutState = { isEmpty: true, pageRemainingMm: 0 };

  for (const element of elements) {
    const cssRanges = getKeepTogetherRanges(element);
    const cssHeight = Math.max(element.scrollHeight, element.offsetHeight, 1);

    let chunkStart = 0;
    while (chunkStart < cssHeight) {
      const chunkCssHeight = Math.min(
        MAX_CHUNK_CSS_HEIGHT,
        cssHeight - chunkStart,
      );
      const canvas = await captureElement(element, chunkStart, chunkCssHeight);
      // Keep-together ranges are in the whole element's CSS-px coordinate space; re-window them
      // to this chunk's own [0, chunkCssHeight) before converting to this chunk's canvas space.
      const chunkRanges = cssRanges
        .filter(
          (range) =>
            range.end > chunkStart && range.start < chunkStart + chunkCssHeight,
        )
        .map((range) => ({
          start: Math.max(0, range.start - chunkStart),
          end: Math.min(chunkCssHeight, range.end - chunkStart),
        }));
      addCanvasToPdf(
        pdf,
        canvas,
        state,
        toCanvasRanges(chunkRanges, chunkCssHeight, canvas.height),
      );
      chunkStart += chunkCssHeight;
    }
    // Each *element* (e.g. each overview-report `.page`) still starts its own PDF page, same as
    // before chunking existed - only chunks *within* one element's capture should flow together.
    forceNewPageNext(state);
  }

  downloadBlob(pdf.output("blob"), ensurePdfFilename(filename));
};

export const downloadHtmlAsPdf = async (
  html: string,
  filename: string,
  pageSelector?: string,
) => {
  const { host, root } = createHiddenContainer();
  try {
    // DOMParser, not an iframe's doc.write: parsing a full document string this way never creates
    // a browsing context at all, so there's nothing for html2canvas's own iframe to nest inside.
    const parsed = new DOMParser().parseFromString(html, "text/html");
    parsed.querySelectorAll("style").forEach((styleEl) => {
      root.appendChild(document.importNode(styleEl, true));
    });

    // A real <body> element (not a <div>), so the report's own `body { ... }` CSS selector still
    // matches it - html elements can be created and placed anywhere via the DOM API even though
    // the HTML parser itself only allows one, as the child of <html>.
    const body = document.createElement("body");
    body.lang = parsed.documentElement.lang;
    Array.from(parsed.body.childNodes).forEach((node) => {
      body.appendChild(document.importNode(node, true));
    });
    root.appendChild(body);

    await waitForContentReady();

    const pages = pageSelector
      ? Array.from(root.querySelectorAll<HTMLElement>(pageSelector))
      : [];
    const targets = pages.length > 0 ? pages : [body];
    await downloadElementsAsPdf(targets, filename);
  } finally {
    host.remove();
  }
};

export const TGenericComponentKeys: (keyof TGenericComponent)[] = Object.keys(
  {} as TGenericComponent,
).filter(
  (k) => !["functionalPoints", "totalPossiblePoints"].includes(k),
) as (keyof TGenericComponent)[];

// Localizes the date to a readable form
export const dateLocalizer = (insertedDate: string) => {
  return new Date(insertedDate)
    .toLocaleTimeString("fi-FI", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace("klo", "");
};

// Calculation functions moved to centralizedCalculations.ts

export const getAllComponents = (
  components: TGenericComponent[],
): TGenericComponent[] => {
  return components.flatMap((comp) => [comp, ...(comp.subComponents || [])]);
};

/**
 * Escape HTML-merkkejä turvallisuuden vuoksi
 */
export const escapeHtmlForSummary = (text?: string | null): string => {
  if (!text) return "";
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};
