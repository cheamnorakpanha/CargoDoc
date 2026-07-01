"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { ExtractedRecord } from "@/features/parser/types";
import {
  ArrowUpDown,
  Trash2,
  Undo2,
  Download,
  Search,
  FileSpreadsheet,
  FileCode,
  Copy,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import * as XLSX from "xlsx";

interface DataTableProps {
  data: ExtractedRecord[];
  moduleType: "export" | "import";
  updateRecord: (updated: ExtractedRecord) => void;
  deleteRecord: (id: string) => void;
  undoDelete: () => void;
  canUndo: boolean;
  clearRecords: () => void;
}

export function DataTable({
  data,
  moduleType,
  updateRecord,
  deleteRecord,
  undoDelete,
  canUndo,
  clearRecords,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showSourceFile, setShowSourceFile] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (value: string, cellId: string) => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopyFeedback(cellId);
    setTimeout(() => setCopyFeedback(null), 1500);
  };

  // Define Columns
  const columns = useMemo<ColumnDef<ExtractedRecord>[]>(() => {
    const cols: ColumnDef<ExtractedRecord>[] = [
      {
        id: "no",
        header: "No",
        cell: (info) => info.row.index + 1,
      },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row, getValue }) => {
          const val = getValue<string>();
          const hasError =
            row.original.validationErrors.includes("Missing Date") ||
            row.original.validationErrors.includes("Invalid Date format");
          return (
            <div
              className={`font-mono text-sm px-2 py-1 rounded select-all cursor-pointer flex items-center justify-between group ${
                hasError ? "bg-red-500/10 text-red-500 font-semibold" : ""
              }`}
              onDoubleClick={() => handleCopy(val, `${row.id}-date`)}
              title="Double click to copy"
            >
              <span>{val || "MISSING"}</span>
              <Copy
                size={12}
                className="opacity-0 group-hover:opacity-60 transition-opacity ml-2"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "exportNumber",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Export Number <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row, getValue }) => {
          const val = getValue<string>();
          const hasError = row.original.validationErrors.includes(
            "Missing Export Number",
          );
          return (
            <div
              className={`font-mono text-sm px-2 py-1 rounded select-all cursor-pointer flex items-center justify-between group ${
                hasError ? "bg-red-500/10 text-red-500 font-semibold" : ""
              }`}
              onDoubleClick={() => handleCopy(val, `${row.id}-exp`)}
              title="Double click to copy"
            >
              <span>{val || "MISSING"}</span>
              <Copy
                size={12}
                className="opacity-0 group-hover:opacity-60 transition-opacity ml-2"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "bargeNumber",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Barge Number <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row, getValue }) => {
          const val = getValue<string>();
          return (
            <div
              className="font-mono text-sm px-2 py-1 rounded select-all cursor-pointer flex items-center justify-between group"
              onDoubleClick={() => handleCopy(val, `${row.id}-barge`)}
              title="Double click to copy"
            >
              <span>{val || "-"}</span>
              <Copy
                size={12}
                className="opacity-0 group-hover:opacity-60 transition-opacity ml-2"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "vin",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            VIN <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row, getValue }) => {
          const val = getValue<string>();
          const errors = row.original.validationErrors;
          const isDuplicate = errors.includes("Duplicate VIN");
          const isMissing = errors.includes("Missing VIN");
          const isInvalidLen = errors.includes(
            "Invalid VIN length (must be 17 characters)",
          );

          let vinStyle = "";
          if (isDuplicate) {
            vinStyle =
              "bg-amber-500/10 text-amber-500 font-semibold border border-amber-500/20";
          } else if (isMissing || isInvalidLen) {
            vinStyle =
              "bg-red-500/10 text-red-500 font-semibold border border-red-500/20";
          }

          return (
            <div
              className={`font-mono text-sm px-2 py-1 rounded select-all cursor-pointer flex items-center justify-between group ${vinStyle}`}
              onDoubleClick={() => handleCopy(val, `${row.id}-vin`)}
              title={
                isDuplicate ? "Duplicate VIN detected" : "Double click to copy"
              }
            >
              <span>{val || "MISSING"}</span>
              <Copy
                size={12}
                className="opacity-0 group-hover:opacity-60 transition-opacity ml-2"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "firstCheck",
        header: "First Check",
        cell: ({ row, getValue }) => {
          const initialValue = getValue<string>();
          return (
            <EditableCell
              value={initialValue}
              onSave={(newValue) =>
                updateRecord({ ...row.original, firstCheck: newValue })
              }
            />
          );
        },
      },
      {
        accessorKey: "secondCheck",
        header: "Second Check",
        cell: ({ row, getValue }) => {
          const initialValue = getValue<string>();
          return (
            <EditableCell
              value={initialValue}
              onSave={(newValue) =>
                updateRecord({ ...row.original, secondCheck: newValue })
              }
            />
          );
        },
      },
    ];

    cols.push(
      {
        accessorKey: "flaggedNote",
        header: "Flagged Note",
        cell: ({ row, getValue }) => {
          const initialValue = getValue<string>();
          return (
            <EditableCell
              value={initialValue}
              onSave={(newValue) =>
                updateRecord({ ...row.original, flaggedNote: newValue })
              }
              placeholder="Add note..."
            />
          );
        },
      },
      {
        id: "validation",
        header: "Status",
        cell: ({ row }) => {
          const errors = row.original.validationErrors;
          const isValid = row.original.isValid;

          if (isValid) {
            return (
              <div className="flex items-center gap-1 text-emerald-500 text-xs font-semibold">
                <CheckCircle size={14} /> Valid
              </div>
            );
          }

          return (
            <div className="flex flex-wrap gap-1 max-w-[150px]">
              {errors.map((err, i) => {
                const isWarning = err.includes("Duplicate");
                return (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      isWarning
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}
                  >
                    <AlertTriangle size={10} />
                    {err}
                  </span>
                );
              })}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => deleteRecord(row.original.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer"
            title="Delete row"
          >
            <Trash2 size={16} />
          </button>
        ),
      },
    );

    return cols;
  }, [moduleType, updateRecord, deleteRecord]);

  // Filter columns based on visibility states
  const visibleColumns = useMemo(() => {
    if (showSourceFile) {
      const sourceCol: ColumnDef<ExtractedRecord> = {
        accessorKey: "sourceFile",
        header: "Source PDF",
        cell: ({ getValue }) => (
          <span
            className="text-xs text-muted-foreground truncate max-w-[120px] block"
            title={getValue<string>()}
          >
            {getValue<string>()}
          </span>
        ),
      };
      // Insert source PDF column before validation column
      const copy = [...columns];
      const valIdx = copy.findIndex((c) => c.id === "validation");
      copy.splice(valIdx, 0, sourceCol);
      return copy;
    }
    return columns;
  }, [columns, showSourceFile]);

  // Table setup
  const table = useReactTable({
    data,
    columns: visibleColumns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Export handlers
  const handleExportExcel = () => {
    if (data.length === 0) return;

    // Process only active table records sorted/filtered in their current order
    const rows = table.getRowModel().rows.map((r, i) => {
      const rec = r.original;
      const formatted: any = {
        No: i + 1,
        Date: rec.date,
        "Export Number": rec.exportNumber,
        "Barge Number": rec.bargeNumber,
        VIN: rec.vin,
        "First Check": rec.firstCheck,
        "Second Check": rec.secondCheck,
      };

      formatted["Flagged Note"] = rec.flaggedNote;

      if (showSourceFile) {
        formatted["Source PDF"] = rec.sourceFile;
      }

      return formatted;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Records");

    // Fit columns width helper
    const maxLens = Object.keys(rows[0] || {}).map((key) =>
      Math.max(key.length, ...rows.map((r) => String(r[key] || "").length)),
    );
    worksheet["!cols"] = maxLens.map((len) => ({ wch: len + 3 }));

    XLSX.writeFile(workbook, `CargoDoc_${moduleType}_records.xlsx`);
  };

  const handleExportJSON = () => {
    if (data.length === 0) return;

    const rows = table.getRowModel().rows.map((r, i) => {
      const rec = r.original;
      const formatted: any = {
        no: i + 1,
        date: rec.date,
        exportNumber: rec.exportNumber,
        bargeNumber: rec.bargeNumber,
        vin: rec.vin,
        firstCheck: rec.firstCheck,
        secondCheck: rec.secondCheck,
      };

      formatted.flaggedNote = rec.flaggedNote;
      formatted.sourceFile = rec.sourceFile;
      return formatted;
    });

    const blob = new Blob([JSON.stringify(rows, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CargoDoc_${moduleType}_records.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (data.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-4 mt-8 animate-fade-in">
      {/* Undo banner & Global Tools */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/30 border border-border/50 rounded-xl p-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {canUndo && (
            <button
              onClick={undoDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
            >
              <Undo2 size={13} /> Undo Delete
            </button>
          )}
          <span className="text-xs text-muted-foreground">
            Total records: {data.length} | Showing{" "}
            {table.getRowModel().rows.length} rows
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSourceFile(!showSourceFile)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Toggle Source File Column"
          >
            {showSourceFile ? <EyeOff size={14} /> : <Eye size={14} />}
            Source PDF
          </button>

          <button
            onClick={clearRecords}
            className="text-xs text-red-500 hover:underline hover:text-red-400 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Main Table Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full grow">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            placeholder="Search records..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card/50 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm"
          />
        </div>

        {/* Exports */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <FileSpreadsheet size={16} /> Export to Excel
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <FileCode size={16} /> Export to JSON
          </button>
        </div>
      </div>

      {/* Copy notification popup */}
      {copyFeedback && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium z-50 animate-bounce flex items-center gap-1">
          <CheckCircle size={12} /> Value copied to clipboard!
        </div>
      )}

      {/* Table Container */}
      <div className="w-full overflow-hidden border border-border/80 rounded-2xl bg-card/30 backdrop-blur-md shadow-sm">
        <div className="overflow-x-auto w-full max-h-[600px] scrollbar-thin">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="sticky top-0 bg-background/90 dark:bg-background/95 backdrop-blur-md border-b border-border/80 z-10 text-xs font-semibold text-muted-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3.5 select-none font-semibold"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {table.getRowModel().rows.map((row) => {
                const isRowInvalid = !row.original.isValid;
                return (
                  <tr
                    key={row.id}
                    className={`hover:bg-accent/40 transition-colors ${
                      isRowInvalid
                        ? "bg-red-500/[0.015] hover:bg-red-500/[0.035]"
                        : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 align-middle">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/10 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="bg-card border border-border rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-primary"
            >
              {[10, 20, 55, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-2 py-1 border border-border rounded disabled:opacity-40 disabled:pointer-events-none hover:bg-accent transition-colors"
            >
              Previous
            </button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-2 py-1 border border-border rounded disabled:opacity-40 disabled:pointer-events-none hover:bg-accent transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Internal helper sub-component for inline editable fields */
interface EditableCellProps {
  value: string;
  onSave: (val: string) => void;
  placeholder?: string;
}

function EditableCell({
  value,
  onSave,
  placeholder = "Verify...",
}: EditableCellProps) {
  const [val, setVal] = useState(value);

  // Sync state if cell value changes externally (e.g. undo, delete, or file imports)
  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleBlur = () => {
    if (val !== value) {
      onSave(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="text"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="w-full px-2 py-1 text-xs border border-transparent hover:border-border/60 focus:border-primary/80 focus:bg-card/80 rounded bg-transparent outline-none transition-all placeholder:text-muted-foreground/50"
    />
  );
}
