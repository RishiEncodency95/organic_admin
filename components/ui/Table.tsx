"use client";

import { useEffect, useMemo, useState } from "react";
import Spinner from "./Spinner";
import EmptyState from "./EmptyState";
import { Inbox } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

const ALIGN_CLASSES = { left: "text-left", right: "text-right", center: "text-center" };

export default function Table<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyMessage = "Nothing here yet.",
  onRowClick,
  pageSize = 10,
}: TableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => setPage(1), [rows.length, pageSize]);
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);
  if (loading) {
    return (
      <div className="border border-surface-border bg-surface-card">
        <Spinner />
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState icon={Inbox} title={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden border border-surface-border bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-sunken">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted ${col.width ?? ""} ${ALIGN_CLASSES[col.align ?? "left"]}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-surface-border last:border-0 ${onRowClick ? "cursor-pointer hover:bg-surface-sunken" : ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 align-middle text-text-primary ${col.width ?? ""} ${ALIGN_CLASSES[col.align ?? "left"]}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-surface-border px-3 py-2 text-xs text-text-muted">
          <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, rows.length)} of {rows.length}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded border border-surface-border px-2.5 py-1 disabled:opacity-40">Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border border-surface-border px-2.5 py-1 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
