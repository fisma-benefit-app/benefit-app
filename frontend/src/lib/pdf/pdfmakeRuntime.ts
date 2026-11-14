import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

pdfMake.addVirtualFileSystem(pdfFonts);

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

export const downloadPdfmakeDocument = async (
  definition: TDocumentDefinitions,
  filename: string,
) => {
  const blob = await pdfMake.createPdf(definition).getBlob();
  downloadBlob(blob, ensurePdfFilename(filename));
};
