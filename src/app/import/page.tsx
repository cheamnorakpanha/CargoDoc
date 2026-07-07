"use client";

import React, { useEffect, useState } from "react";
import { useFilePipeline } from "@/hooks/useFilePipeline";
import { FileDropzone } from "@/components/FileDropzone";
import { DataTable } from "@/components/DataTable";
import {
  ArrowDownLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  FileCheck2,
  AlertCircle,
} from "lucide-react";

export default function ImportModule() {
  const {
    records,
    isProcessing,
    currentFileName,
    progress,
    clearRecords,
    updateRecord,
    deleteRecord,
    undoDelete,
    canUndo,
    processFiles,
  } = useFilePipeline("import");

  const [ocrApiKey, setOcrApiKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Read the session key on mount
    const key = sessionStorage.getItem("cargodoc_ocr_key") || undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOcrApiKey(key);
  }, []);

  const handleFilesSelected = (files: File[]) => {
    processFiles(files, ocrApiKey);
  };

  return (
    <div className="w-full flex flex-col h-full py-4 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
            <ArrowDownLeft size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Import Module
            </h1>
            <p className="text-xs text-muted-foreground">
              Extract and verify shipping data from Import taxation/customs
              declarations.
            </p>
          </div>
        </div>

        {/* Floating warning if no API key is set */}
        {!ocrApiKey && records.length === 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg text-[10px] font-semibold animate-pulse">
            <AlertCircle size={12} /> Using free-tier OCR Space (Key:
            helloworld)
          </div>
        )}
      </div>

      {/* Upload Zone (Show if no records and not processing) */}
      {!isProcessing && records.length === 0 && (
        <div className="flex-1 flex flex-col justify-center py-12">
          <FileDropzone onFilesSelected={handleFilesSelected} />
        </div>
      )}

      {/* Processing Loader Overlay */}
      {isProcessing && (
        <div className="grow flex flex-col items-center justify-center py-16 max-w-xl mx-auto w-full">
          <div className="glass-panel w-full rounded-2xl p-8 shadow-lg flex flex-col items-center text-center space-y-6 animate-pulse">
            <div className="relative flex items-center justify-center">
              <Loader2 className="text-primary animate-spin" size={40} />
              <span className="absolute text-xs font-bold text-primary">
                {Math.round((progress.current / progress.total) * 100)}%
              </span>
            </div>

            <div className="space-y-1.5 w-full">
              <h3 className="font-bold text-base text-foreground">
                Processing Documents
              </h3>
              <p className="text-xs text-muted-foreground truncate px-4">
                Parsing:{" "}
                <span className="font-mono font-medium text-foreground">
                  {currentFileName}
                </span>
              </p>
            </div>

            {/* Progress stats */}
            <div className="grid grid-cols-3 gap-2 w-full pt-2 text-xs font-semibold">
              <div className="bg-secondary/40 p-2.5 rounded-xl border border-border/40">
                <span className="text-[10px] text-muted-foreground block uppercase">
                  Completed
                </span>
                <span className="text-foreground font-mono">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="bg-emerald-500/5 text-emerald-500 p-2.5 rounded-xl border border-emerald-500/10 flex flex-col items-center justify-center">
                <span className="text-[10px] text-muted-foreground block uppercase">
                  Success
                </span>
                <span className="font-mono flex items-center gap-1">
                  <CheckCircle2 size={12} /> {progress.successCount}
                </span>
              </div>
              <div className="bg-red-500/5 text-red-500 p-2.5 rounded-xl border border-red-500/10 flex flex-col items-center justify-center">
                <span className="text-[10px] text-muted-foreground block uppercase">
                  Failed
                </span>
                <span className="font-mono flex items-center gap-1">
                  <XCircle size={12} /> {progress.failedCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main interactive table */}
      {!isProcessing && records.length > 0 && (
        <div className="flex-1 flex flex-col">
          {/* Quick upload-more drop zone */}
          <div className="flex justify-end mb-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-all">
              <FileCheck2 size={14} /> Add More PDFs
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  if (e.target.files)
                    handleFilesSelected(Array.from(e.target.files));
                }}
                className="hidden"
              />
            </label>
          </div>

          <DataTable
            data={records}
            moduleType="import"
            updateRecord={updateRecord}
            deleteRecord={deleteRecord}
            undoDelete={undoDelete}
            canUndo={canUndo}
            clearRecords={clearRecords}
          />
        </div>
      )}
    </div>
  );
}
