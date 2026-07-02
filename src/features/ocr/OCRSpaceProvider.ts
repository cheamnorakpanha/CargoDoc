import { BaseOCRProvider } from "./BaseOCRProvider";

export class OCRSpaceProvider implements BaseOCRProvider {
  name = "OCR.Space";

  async parseImage(imageBlob: Blob, apiKey?: string): Promise<string> {
    const activeApiKey = apiKey || process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY || "helloworld";
    
    const formData = new FormData();
    // We name the file 'page.png' to ensure the OCR engine recognizes it as a valid image
    formData.append("file", imageBlob, "page.png");
    formData.append("apikey", activeApiKey);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2"); // Engine 2 is optimized for tabular data and receipts

    try {
      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        const errorMessage = errorText ? ` Message: ${errorText}` : "";
        throw new Error(`OCR.Space API request failed with status: ${response.status}.${errorMessage}`);
      }

      const data = await response.json();

      if (data.IsErroredOnProcessing) {
        const errorMsg = data.ErrorMessage ? data.ErrorMessage.join(", ") : "Unknown OCR.Space error";
        throw new Error(`OCR processing error: ${errorMsg}`);
      }

      if (!data.ParsedResults || data.ParsedResults.length === 0) {
        return "";
      }

      // Merge text from all parsed pages/results
      const extractedText = data.ParsedResults.map(
        (result: { ParsedText?: string }) => result.ParsedText || ""
      ).join("\n");

      return extractedText;
    } catch (error) {
      console.error("OCR.Space Error:", error);
      throw error;
    }
  }
}
