import type {
  TDocumentDefinitions,
  TVirtualFileSystem,
} from "pdfmake/interfaces";

type PdfMake = typeof import("pdfmake/build/pdfmake");

const ensurePdfFilename = (filename: string) =>
  filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;

// Library save() helpers (jsPDF's, and file-saver, which pdfmake's download() uses) can dispatch a
// click on an <a download> that was never attached to the document. Chrome accepts that; Firefox
// has silently ignored it. Downloading the blob ourselves, through an anchor that's actually
// attached, works the same way in both.
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

let pdfMakePromise: Promise<PdfMake> | null = null;

// pdfmake plus its bundled Roboto fonts is ~2 MB, so it is imported on first use only. Vite splits
// it into its own chunk, which means users who never export a PDF never download it. Roboto
// covers Finnish (ä, ö, å) and the en dash used in the reports, so no extra font is registered.
const loadPdfMake = (): Promise<PdfMake> => {
  pdfMakePromise ??= Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ])
    .then(([pdfMakeModule, vfsModule]) => {
      // Both files are CommonJS/UMD bundles, so depending on how the bundler interops them the
      // exports sit on the module itself or on `.default`.
      const pdfMake: PdfMake =
        (pdfMakeModule as { default?: PdfMake }).default ?? pdfMakeModule;
      const vfs =
        (vfsModule as { default?: TVirtualFileSystem }).default ??
        (vfsModule as unknown as TVirtualFileSystem);
      pdfMake.addVirtualFileSystem(vfs);
      return pdfMake;
    })
    .catch((error) => {
      // Don't cache a failed load (e.g. a dropped connection) - let the next export retry it.
      pdfMakePromise = null;
      throw error;
    });
  return pdfMakePromise;
};

export const downloadPdfmakeDocument = async (
  definition: TDocumentDefinitions,
  filename: string,
) => {
  const pdfMake = await loadPdfMake();
  const blob = await pdfMake.createPdf(definition).getBlob();
  downloadBlob(blob, ensurePdfFilename(filename));
};
