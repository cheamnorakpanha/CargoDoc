import { BaseOCRProvider } from "./BaseOCRProvider";
import { OCRSpaceProvider } from "./OCRSpaceProvider";

export class OCRProviderFactory {
  static getProvider(name = "ocrspace"): BaseOCRProvider {
    switch (name.toLowerCase()) {
      case "ocrspace":
      case "ocr.space":
        return new OCRSpaceProvider();
      default:
        throw new Error(`Unsupported OCR provider: ${name}`);
    }
  }
}
