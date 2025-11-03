import React from 'react';

export type Column<T> = {
  key: string;
  title: React.ReactNode;
  width?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  expandable?: (row: T) => React.ReactNode | null;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  footer?: React.ReactNode;
  tableClassName?: string;
  noDividers?: boolean;
  // pagination (client-side)
  pagination?: boolean;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
};

export default function DataTable<T>({ columns, data, rowKey, expandable, onRowClick, emptyState, footer, tableClassName = '', noDividers = false, pagination = false, pageSizeOptions = [5,10,20], defaultPageSize = 10 }: Props<T>) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  React.useEffect(() => { setPage(1); }, [pageSize, data]);

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const visibleData = pagination ? data.slice(start, end) : data;

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 ${tableClassName}`}>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-[#5d5448] text-white">
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} style={{ width: col.width }} className={`px-4 py-3 text-xs font-medium uppercase tracking-wider ${col.className || ''} ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={`bg-white ${noDividers ? '' : 'divide-y divide-gray-200'}`}>
            {visibleData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">{emptyState ?? 'No hay datos'}</td>
              </tr>
            ) : (
              visibleData.map((row) => {
                const k = rowKey(row);
                // If the row carries a custom expanded content function or node (e.g. _expandedContent), prefer it.
                const rowExp = (row as any)._expandedContent;
                const extra = typeof rowExp === 'function' ? rowExp() : (rowExp ? rowExp : (expandable ? expandable(row) : null));
                return (
                  <React.Fragment key={String(k)}>
                    <tr
                      className={`transition-colors duration-150 hover:bg-[#f5f1e8] ${ onRowClick ? 'cursor-pointer' : '' }`}
                      onClick={() => onRowClick ? onRowClick(row) : undefined}
                    > 
                      {columns.map(col => (
                        <td key={col.key} className={`px-3 py-3 text-sm text-gray-700 whitespace-normal break-words ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}> 
                          {col.render ? col.render(row) : (row as any)[col.key]}
                        </td>
                      ))}
                    </tr>

                    {extra && (
                      <tr className="bg-gray-50">
                        <td colSpan={columns.length} className="px-4 py-3">{extra}</td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {footer && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-b-lg">
          {footer}
        </div>
      )}

      {pagination && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">Mostrando {Math.min(total, start+1)}-{Math.min(total, end)} de {total}</div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Filas:</label>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
                {pageSizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-2 py-1 border rounded disabled:opacity-50">Anterior</button>
              <div className="px-2 text-sm">{page} / {totalPages}</div>
              <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} className="px-2 py-1 border rounded disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}