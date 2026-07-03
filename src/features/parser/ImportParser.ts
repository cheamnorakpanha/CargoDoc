import { BaseParser } from "./BaseParser";
import { ExtractedRecord } from "./types";

export class ImportParser extends BaseParser {
  parse(text: string, fileName: string): ExtractedRecord[] {
    console.log("==== EXTRACTED TEXT FROM PDF ====");
    console.log(text);
    console.log("=================================");

    // Split text by page delimiters added in pdf.ts and useFilePipeline.ts
    const pages = text.split(/--- Page \d+(?: \(OCR\))? ---/i).filter(page => page.trim().length > 0);

    // Fallback if no delimiters are found (e.g., single page without delimiter)
    if (pages.length === 0) {
      pages.push(text);
    }

    const allRecords: ExtractedRecord[] = [];

    for (let i = 0; i < pages.length; i++) {
      const pageText = pages[i];
      const date = this.extractDate(pageText);
      const exportNumber = this.extractExportNumber(pageText);
      const bargeNumber = this.extractBargeNumber(pageText);
      const vins = this.extractVINs(pageText);

      const baseRecord = {
        sourceFile: fileName,
        date,
        exportNumber,
        bargeNumber,
        firstCheck: "",
        secondCheck: "",
        flaggedNote: "",
      };

      // If no VINs found on this page, generate a single row with empty VIN to flag it
      if (vins.length === 0) {
        const recordWithoutVin = {
          ...baseRecord,
          id: `${fileName}-page-${i}-no-vin-${Date.now()}`,
          vin: "",
        };
        const validation = this.validateRecord(recordWithoutVin);
        allRecords.push({ ...recordWithoutVin, ...validation } as ExtractedRecord);
      } else {
        const pageRecords = vins.map((vin, index) => {
          const record = {
            ...baseRecord,
            id: `${fileName}-${vin}-${index}-${i}`,
            vin,
          };
          const validation = this.validateRecord(record);
          return { ...record, ...validation } as ExtractedRecord;
        });
        allRecords.push(...pageRecords);
      }
    }

    return allRecords;
  }
}
