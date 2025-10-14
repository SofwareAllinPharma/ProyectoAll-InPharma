//TABLA GENERICA QUE HAY QUE APLICAR A TODO EL SISTEMA
import React, { useEffect, useMemo, useState } from "react";

type Align = "left" | "center" | "right";

export type Column<T> = {
  id: string;
  header: React.ReactNode;
  accessor?: (row: T) => React.ReactNode | string | number | Date | null | undefined;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: Align;
  className?: string;
  widthClass?: string;
};

export type SortState = {
  columnId: string;
  direction: "asc" | "desc";
} | null;

export type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  searchTerm?: string;
  globalFilter?: (row: T, searchTerm: string) => boolean;
  initialSort?: SortState;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  renderRowActions?: (row: T) => React.ReactNode;
  className?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function DataTable<T extends object>({
  data,
  columns,
  searchTerm = "",
  globalFilter,
  initialSort = null,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  loading = false,
  emptyState = "No hay datos para mostrar",
  onRowClick,
  onRowDoubleClick,
  renderRowActions,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(initialSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return data;
    if (globalFilter) return data.filter((r) => globalFilter(r, searchTerm));

    const st = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val =
          (col.cell ? col.cell(row) : col.accessor ? col.accessor(row) : "") ?? "";
        const txt =
          typeof val === "string"
            ? val
            : val instanceof Date
              ? val.toISOString()
              : typeof val === "number"
                ? String(val)
                : React.isValidElement(val)
                  ? ""
                  : String(val ?? "");
        return txt.toLowerCase().includes(st);
      })
    );
  }, [data, columns, searchTerm, globalFilter]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.id === sort.columnId);
    if (!col) return filtered;

    const getVal = (row: T) => {
      const raw = col.accessor ? col.accessor(row) : col.cell ? col.cell(row) : "";
      if (raw instanceof Date) return raw.getTime();
      if (typeof raw === "number") return raw;
      if (typeof raw === "string") return raw.toLowerCase();
      return String(raw ?? "");
    };

    const arr = [...filtered].sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);

      if (va < vb) return sort.direction === "asc" ? -1 : 1;
      if (va > vb) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort, columns]);

  // Paginación
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const toggleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    setPage(1);
    setSort((prev) => {
      if (!prev || prev.columnId !== col.id) return { columnId: col.id, direction: "asc" };
      if (prev.direction === "asc") return { columnId: col.id, direction: "desc" };
      return null;
    });
  };

  return (
    <div className={cx("bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#5d5448] text-white">
            <tr>
              {columns.map((col) => {
                const isSorted = sort?.columnId === col.id;
                const dir = sort?.direction;
                return (
                  <th
                    key={col.id}
                    onClick={() => toggleSort(col)}
                    className={cx(
                      "px-4 py-3 text-xs font-medium uppercase tracking-wider select-none",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.widthClass,
                      col.sortable && "cursor-pointer"
                    )}
                  >
                    <div
                      className={cx(
                        "flex items-center gap-1",
                        col.align === "center" && "justify-center",
                        col.align === "right" && "justify-end"
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-white/80 text-[10px] leading-none">
                          {isSorted ? (dir === "asc" ? "▲" : "▼") : "↕︎"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              {renderRowActions && (
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-center w-20">
                  Acciones
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (renderRowActions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  Cargando…
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (renderRowActions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  {emptyState}
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr
                  key={idx}
                  className={cx(
                    "transition-colors duration-150",
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                    (onRowClick || onRowDoubleClick) && "hover:bg-[#f5f1e8]"
                  )}
                  onClick={() => onRowClick?.(row)}
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                >
                  {columns.map((col) => {
                    let content = col.cell
                      ? col.cell(row)
                      : col.accessor
                        ? col.accessor(row)
                        : null;
                    if (content instanceof Date) {
                      content = content.toLocaleString();
                    }
                    return (
                      <td
                        key={col.id}
                        className={cx(
                          "px-4 py-3 text-sm text-gray-700",
                          col.align === "center" && "text-center",
                          col.align === "right" && "text-right",
                          col.className,
                          col.widthClass
                        )}
                      >
                        {content}
                      </td>
                    );
                  })}
                  {renderRowActions && (
                    <td className="px-4 py-3 text-sm text-center">
                      {renderRowActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
        <div className="text-sm text-gray-600">
          {total > 0 ? (
            <>
              Mostrando{" "}
              <strong>
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
              </strong>{" "}
              de <strong>{total}</strong> registro{total !== 1 ? "s" : ""}
              {searchTerm ? ` (filtrado por "${searchTerm}")` : ""}
            </>
          ) : (
            "Sin resultados"
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Por página</label>
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize);
              setPage(1);
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 ml-2">
            <button
              className="px-2 py-1 text-sm rounded-md border bg-white hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              «
            </button>
            <button
              className="px-2 py-1 text-sm rounded-md border bg-white hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span className="px-2 text-sm text-gray-700">
              Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            </span>
            <button
              className="px-2 py-1 text-sm rounded-md border bg-white hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </button>
            <button
              className="px-2 py-1 text-sm rounded-md border bg-white hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
