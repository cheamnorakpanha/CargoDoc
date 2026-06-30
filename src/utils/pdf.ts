/**
 * PDF Processing utilities using pdfjs-dist.
 * Runs entirely on the client-side.
 */

// Dynamically load pdfjs to keep initial bundle size small
const loadPdfJS = async () => {
  if (typeof window === "undefined") {
    throw new Error("PDF.js must be executed in a browser environment");
  }

  const pdfjs = await import("pdfjs-dist");

  // Set CDN worker for pdfjs-dist to avoid local loader configuration problems
  const version = pdfjs.version;
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  return pdfjs;
};

/**
 * Extracts text content directly from the PDF's text layer if it exists.
 */
export async function extractTextFromPdf(
  file: File
): Promise<{ text: string; pageCount: number; isOcrRequired: boolean }> {
  const pdfjs = await loadPdfJS();
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  let fullText = "";
  let textLayerHasContent = false;

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => {
        if ("str" in item) {
          return item.str + (item.hasEOL ? "\n" : "");
        }
        return "";
      })
      .join("");

    fullText += `--- Page ${i} ---\n${pageText}\n\n`;

    // Check if we actually extracted characters or if it's just whitespace/empty
    if (pageText.trim().length > 10) {
      textLayerHasContent = true;
    }
  }

  // If the extracted text layer has almost no content, OCR is required (e.g. scanned image PDF)
  const isOcrRequired = !textLayerHasContent;

  return {
    text: fullText,
    pageCount,
    isOcrRequired,
  };
}

/**
 * Renders a specific PDF page to an image Blob for OCR processing.
 */
export async function renderPageToImage(file: File, pageNumber: number): Promise<Blob> {
  const pdfjs = await loadPdfJS();
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);

  // Render page to canvas at 1.5x scale (good balance between image size and OCR quality)
  const viewport = page.getViewport({ scale: 1.5 });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2d context for rendering PDF page to canvas");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error(`Failed to convert canvas to blob for page ${pageNumber}`));
      }
    }, "image/png");
  });
}
