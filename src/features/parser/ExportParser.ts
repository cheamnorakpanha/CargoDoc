import { BaseParser } from "./BaseParser";
import { ExtractedRecord } from "./types";

export class ExportParser extends BaseParser {
  parse(text: string, fileName: string): ExtractedRecord[] {
    console.log("==== EXTRACTED TEXT FROM EXPORT PDF ====");
    console.log(text);
    console.log("========================================");
    
    const date = this.extractDate(text);
    const exportNumber = this.extractExportNumber(text);
    const bargeNumber = this.extractBargeNumber(text);
    const vins = this.extractVINs(text);

    const baseRecord = {
      sourceFile: fileName,
      date,
      exportNumber,
      bargeNumber,
      firstCheck: "",
      secondCheck: "",
      flaggedNote: "",
    };

    // If no VINs found, generate a single row with empty VIN to flag it
    if (vins.length === 0) {
      const recordWithoutVin = {
        ...baseRecord,
        id: `${fileName}-no-vin-${Date.now()}`,
        vin: "",
      };
      const validation = this.validateRecord(recordWithoutVin);
      return [{ ...recordWithoutVin, ...validation }];
    }

    return vins.map((vin, index) => {
      const record = {
        ...baseRecord,
        id: `${fileName}-${vin}-${index}`,
        vin,
      };
      const validation = this.validateRecord(record);
      return { ...record, ...validation };
    });
  }
}
