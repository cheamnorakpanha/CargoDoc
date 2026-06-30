import { ExtractedRecord } from "./types";

export abstract class BaseParser {
  abstract parse(text: string, fileName: string): ExtractedRecord[];

  /**
   * Helper to extract all VINs from text.
   * Standard VIN: 17 alphanumeric chars, excluding I, O, Q.
   * Also captures explicitly labeled shorter VINs.
   */
  protected extractVINs(text: string): string[] {
    const vins = new Set<string>();

    // Explicitly labeled VIN (e.g. "VIN: VR25072330")
    const vinLabelRegex = /VIN[:\s]+([A-Z0-9]+)/gi;
    let match;
    while ((match = vinLabelRegex.exec(text)) !== null) {
      if (match[1]) vins.add(match[1].toUpperCase());
    }

    // Standard 17-char VIN
    const vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/gi;
    while ((match = vinRegex.exec(text)) !== null) {
      vins.add(match[0].toUpperCase());
    }

    return Array.from(vins);
  }

  /**
   * Helper to find dates in standard formats.
   */
  protected extractDate(text: string): string {
    // Try YYYY-MM-DD or YYYY/MM/DD
    const isoDateRegex = /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/;
    // Try DD/MM/YYYY or MM/DD/YYYY
    const commonDateRegex = /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{4}\b/;
    // Try DD MMM YYYY or DD-MMM-YYYY (e.g., "25 Jun 2026" or "25-Jun-2026")
    const textMonthDateRegex = /\b\d{1,2}[-/.\s]+[a-zA-Z]{3}[-/.\s]+\d{4}\b/;

    const matchIso = text.match(isoDateRegex);
    if (matchIso) return matchIso[0];

    const matchCommon = text.match(commonDateRegex);
    if (matchCommon) return matchCommon[0];

    const matchText = text.match(textMonthDateRegex);
    if (matchText) return matchText[0];

    // Try finding date label keyword (avoiding newlines so it doesn't grab the next line)
    const labelRegex = /(?:date|datum|fecha)[ \t:]+([^\n\r,;]+)/i;
    const matchLabel = text.match(labelRegex);
    if (matchLabel && matchLabel[1]) {
      return matchLabel[1].trim();
    }

    return "";
  }

  /**
   * Helper to find Export/Reference number.
   */
  protected extractExportNumber(text: string): string {
    // Look for explicitly labeled Export/Ref numbers on the same line
    const exportLabelRegex = /(?:export\s+(?:no|num|number|ref)|ref(?:erence)?)[ \t:#]+([a-z0-9-]+)/i;
    const matchLabel = text.match(exportLabelRegex);
    if (matchLabel && matchLabel[1]) {
      return matchLabel[1].trim();
    }

    // Look for IMP/TMP/EXP/RE numbers (e.g., IMP357/2026, TMP357/2026, EXP357/2026, RE263/2026)
    const impRegex = /\b([A-Z]{2,4}\d+\/\d+)\b/i;
    const matchImp = text.match(impRegex);
    if (matchImp) {
      return matchImp[0];
    }

    // Generic fallback: look for EXP-xxxx or similar prefix
    const genericExpRegex = /\b(EXP-\d+|EX-\d+)\b/i;
    const matchGeneric = text.match(genericExpRegex);
    if (matchGeneric) {
      return matchGeneric[0];
    }

    // Less strict generic fallback (make sure it doesn't steal the VIN)
    const looseGenericRegex = /\b([A-Z]{2,4}\d{5,10})\b/i;
    const matchLoose = text.match(looseGenericRegex);
    if (matchLoose) {
      const isVin = /VIN[:\s]+[A-Z0-9]+/i.test(text.substring(Math.max(0, matchLoose.index! - 10), matchLoose.index! + 20));
      if (!isVin) {
         return matchLoose[0];
      }
    }

    return "";
  }

  /**
   * Helper to find Barge number.
   */
  protected extractBargeNumber(text: string): string {
    // Look for PLATE NUMBER (e.g., "PLATE NUMBER: NB-8312")
    const plateRegex = /PLATE\s+NUMBER[:\s]+([a-z0-9-]+)/i;
    const matchPlate = text.match(plateRegex);
    if (matchPlate && matchPlate[1]) {
      return matchPlate[1].trim();
    }

    // Look for patterns like "Barge No: 12", "Barge: BARGE-123"
    const bargeLabelRegex = /(?:barge\s+(?:no|num|number|name)|barge)[ \t:#]+([a-z0-9-]+)/i;
    const matchLabel = text.match(bargeLabelRegex);
    if (matchLabel && matchLabel[1]) {
      return matchLabel[1].trim();
    }

    // Generic fallback: looks for B-xxxx or BARGE-xxxx
    const genericBargeRegex = /\b(BARGE-\d+|BARGE\s+\d+|B-\d{3,6})\b/i;
    const matchGeneric = text.match(genericBargeRegex);
    if (matchGeneric) {
      return matchGeneric[0];
    }

    return "";
  }

  /**
   * Common validation logic to populate isValid and validationErrors.
   */
  protected validateRecord(record: Omit<ExtractedRecord, "isValid" | "validationErrors">): {
    isValid: boolean;
    validationErrors: string[];
  } {
    const errors: string[] = [];

    if (!record.vin) {
      errors.push("Missing VIN");
    } else if (record.vin.length < 5) {
      errors.push("Invalid VIN length");
    }

    if (!record.exportNumber) {
      errors.push("Missing Export Number");
    }

    if (!record.date) {
      errors.push("Missing Date");
    }

    // Simple date validator: checks if date is readable as a date if it's in a digit format
    if (record.date && /\d/.test(record.date)) {
      const parsedDate = Date.parse(record.date.replace(/[-/.]/g, "/"));
      if (isNaN(parsedDate)) {
        errors.push("Invalid Date format");
      }
    }

    return {
      isValid: errors.length === 0,
      validationErrors: errors,
    };
  }
}
