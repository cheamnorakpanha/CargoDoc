import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ExtractedRecord } from "@/features/parser/types";
import { extractTextFromPdf, renderPageToImage } from "@/utils/pdf";
import { OCRProviderFactory } from "@/features/ocr/OCRProviderFactory";
import { ParserFactory } from "@/features/parser/ParserFactory";
import * as XLSX from "xlsx";

export interface ProgressState {
  current: number;
  total: number;
  successCount: number;
  failedCount: number;
}

export function useFilePipeline(moduleType: "export" | "import") {
  const [records, setRecords] = useState<ExtractedRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileName, setCurrentFileName] = useState("");
  const [progress, setProgress] = useState<ProgressState>({
    current: 0,
    total: 0,
    successCount: 0,
    failedCount: 0,
  });

  // History stack for undo deleted records
  const [deletedHistory, setDeletedHistory] = useState<ExtractedRecord[][]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`cargodoc_records_${moduleType}`);
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved records", e);
      }
    }
    setIsLoaded(true);
  }, [moduleType]);

  // Save to local storage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`cargodoc_records_${moduleType}`, JSON.stringify(records));
    }
  }, [records, moduleType, isLoaded]);

  // Clear all data
  const clearRecords = useCallback(() => {
    setRecords([]);
    setDeletedHistory([]);
  }, []);

  // Update a single record (for inline editing)
  const updateRecord = useCallback((updated: ExtractedRecord) => {
    setRecords((prev) =>
      prev.map((rec) => (rec.id === updated.id ? updated : rec))
    );
  }, []);

  // Delete a single record
  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => {
      const recordToDelete = prev.find((rec) => rec.id === id);
      if (recordToDelete) {
        // Save the current state of records to history before deleting
        setDeletedHistory((history) => [...history, prev]);
      }
      return prev.filter((rec) => rec.id !== id);
    });
  }, []);

  // Undo last delete
  const undoDelete = useCallback(() => {
    setDeletedHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;
      const lastState = prevHistory[prevHistory.length - 1];
      setRecords(lastState);
      return prevHistory.slice(0, -1);
    });
  }, []);

  // Sequential file processing pipeline
  const processFiles = useCallback(
    async (files: File[], ocrApiKey?: string) => {
      if (files.length === 0) return;
      setIsProcessing(true);

      const total = files.length;
      let successCount = 0;
      let failedCount = 0;

      setProgress({ current: 0, total, successCount: 0, failedCount: 0 });

      const newRecords: ExtractedRecord[] = [];

      for (let i = 0; i < total; i++) {
        const file = files[i];
        setCurrentFileName(file.name);
        setProgress((prev) => ({ ...prev, current: i + 1 }));

        try {
          // 1. Validation checks
          const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");
          const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

          if (!isPDF && !isExcel) {
            throw new Error("File is not a supported format (PDF/Excel)");
          }
          if (file.size > 30 * 1024 * 1024) {
            throw new Error("File size exceeds 30 MB limit");
          }

          // Handle Excel files directly
          if (isExcel) {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

            const parsedRecords: ExtractedRecord[] = jsonData.map((row) => ({
              id: crypto.randomUUID(),
              sourceFile: row["Source PDF"] || file.name,
              date: row["Date"] || "",
              exportNumber: row["Export Number"] || row["Invoice No"] || "",
              bargeNumber: row["Barge Number"] || "",
              vin: row["VIN"] || "",
              power: row["Power"] || "",
              year: row["Year"] || "",
              amount: row["Amount"] || "",
              firstCheck: row["First Check"] || "",
              secondCheck: row["Second Check"] || "",
              thirdCheck: row["Third Check"] || "",
              flaggedNote: row["Flagged Note"] || "",
              isValid: true,
              validationErrors: [],
            }));

            newRecords.push(...parsedRecords);
            successCount++;
            setProgress((prev) => ({
              ...prev,
              successCount,
              failedCount,
            }));
            continue;
          }

          // 2. Direct PDF Text Layer Extraction
          const extraction = await extractTextFromPdf(file);
          let text = extraction.text;

          // 3. Fallback to OCR if direct text layer is missing or empty
          if (extraction.isOcrRequired) {
            console.log(`Text layer empty for ${file.name}. Converting pages to images for OCR...`);
            let ocrText = "";
            const ocrProvider = OCRProviderFactory.getProvider("ocrspace");

            for (let pageNum = 1; pageNum <= extraction.pageCount; pageNum++) {
              const imageBlob = await renderPageToImage(file, pageNum);
              const pageOcrText = await ocrProvider.parseImage(imageBlob, ocrApiKey);
              ocrText += `--- Page ${pageNum} (OCR) ---\n${pageOcrText}\n\n`;
            }
            text = ocrText;
          }

          // 4. Parser Selection & Parsing
          const parser = ParserFactory.getParser(moduleType);
          const parsedRecords = parser.parse(text, file.name);

          newRecords.push(...parsedRecords);
          successCount++;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error(`Error processing file ${file.name}:`, error);
          toast.error(`Error processing ${file.name}: ${error.message || "Unknown error"}`);
          failedCount++;
        }

        setProgress((prev) => ({
          ...prev,
          successCount,
          failedCount,
        }));
      }

      setRecords((prev) => [...prev, ...newRecords]);
      setIsProcessing(false);
      setCurrentFileName("");
    },
    [moduleType]
  );

  // Dynamic Validation Engine (calculates errors reactively, e.g., duplicate VINs)
  const validatedRecords = useMemo(() => {
    // Count VIN occurrences across the entire table
    const vinCounts = new Map<string, number>();
    records.forEach((rec) => {
      if (rec.vin) {
        const normalized = rec.vin.trim().toUpperCase();
        vinCounts.set(normalized, (vinCounts.get(normalized) || 0) + 1);
      }
    });

    return records.map((rec) => {
      const errors = [...rec.validationErrors];

      // Dynamic check for duplicate VINs
      if (rec.vin) {
        const normalized = rec.vin.trim().toUpperCase();
        const count = vinCounts.get(normalized) || 0;
        if (count > 1) {
          if (!errors.includes("Duplicate VIN")) {
            errors.push("Duplicate VIN");
          }
        }
      }

      const isValid = errors.length === 0;

      return {
        ...rec,
        validationErrors: errors,
        isValid,
      };
    });
  }, [records]);

  return {
    records: validatedRecords,
    isProcessing,
    currentFileName,
    progress,
    clearRecords,
    updateRecord,
    deleteRecord,
    undoDelete,
    canUndo: deletedHistory.length > 0,
    processFiles,
  };
}
