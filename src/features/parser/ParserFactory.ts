import { BaseParser } from "./BaseParser";
import { ExportParser } from "./ExportParser";
import { ImportParser } from "./ImportParser";

export class ParserFactory {
  static getParser(type: "export" | "import"): BaseParser {
    switch (type) {
      case "export":
        return new ExportParser();
      case "import":
        return new ImportParser();
      default:
        throw new Error(`Unsupported parser type: ${type}`);
    }
  }
}
