export interface ExtractedRecord {
  id: string;
  sourceFile: string;
  date: string;
  exportNumber: string;
  bargeNumber: string;
  vin: string;
  firstCheck: string;
  secondCheck: string;
  flaggedNote: string;
  isValid: boolean;
  validationErrors: string[];
}

export interface ParserResult {
  records: ExtractedRecord[];
  rawText: string;
}
