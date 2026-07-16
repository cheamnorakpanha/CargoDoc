export interface ExtractedRecord {
  id: string;
  sourceFile: string;
  date: string;
  exportNumber: string;
  bargeNumber: string;
  vin: string;
  power?: string;
  year?: string;
  amount?: string;
  firstCheck: string;
  secondCheck: string;
  thirdCheck?: string;
  fourthCheck?: string;
  flaggedNote: string;
  isValid: boolean;
  validationErrors: string[];
}

export interface ParserResult {
  records: ExtractedRecord[];
  rawText: string;
}
