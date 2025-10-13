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
};

export default function DataTable<T>({ columns, data, rowKey, expandable, onRowClick, emptyState, footer, tableClassName = '' }: Props<T>) {

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

          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">{emptyState ?? 'No hay datos'}</td>
              </tr>
            ) : (
              data.map((row) => {
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
    </div>
  );
}
