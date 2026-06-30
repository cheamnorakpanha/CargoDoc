export interface BaseOCRProvider {
  name: string;
  parseImage(imageBlob: Blob, apiKey?: string): Promise<string>;
}
