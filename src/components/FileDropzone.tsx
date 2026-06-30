"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, AlertCircle, FileText } from "lucide-react";

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function FileDropzone({ onFilesSelected, disabled = false }: FileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFileList = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMsg(null);

    const validFiles: File[] = [];
    const filesArray = Array.from(filesList);

    // Limits check
    if (filesArray.length > 50) {
      setErrorMsg("You can only upload a maximum of 50 files at once.");
      return;
    }

    for (const file of filesArray) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setErrorMsg(`"${file.name}" is not a PDF file.`);
        return;
      }
      if (file.size > 30 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" exceeds the 30 MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    processFileList(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    processFileList(e.target.files);
  };

  const handleButtonClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`glass-panel border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-primary/80 bg-primary/[0.04] scale-[1.01]"
            : "border-border/80 hover:border-primary/45 hover:bg-secondary/20"
        } ${disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        <div className={`p-4 bg-primary/10 rounded-2xl text-primary mb-4 transition-transform duration-300 ${isDragActive ? "scale-110" : ""}`}>
          <UploadCloud size={32} />
        </div>

        <h3 className="font-bold text-base text-foreground mb-1">
          Drag and drop PDF files here
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          or click to browse from your device
        </p>

        <div className="flex items-center gap-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/30 border border-border/40 px-3 py-1 rounded-lg">
          <span>Max 50 PDFs</span>
          <span className="w-1.5 h-1.5 rounded-full bg-border"></span>
          <span>Max 30MB each</span>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl animate-fade-in">
          <AlertCircle size={14} className="shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
