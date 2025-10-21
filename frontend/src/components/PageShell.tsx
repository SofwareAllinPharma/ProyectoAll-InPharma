import React from 'react';
import { useToast } from './ui';

type PageShellProps = {
  title: string;
  subtitle?: string;
  onCreate?: () => void;
  createLabel?: string;
  loading?: boolean;
  error?: string | null;
  onDismissError?: () => void;
  searchNode?: React.ReactNode;
  helpTip?: React.ReactNode;
  extraActions?: React.ReactNode;
  children?: React.ReactNode;
  modals?: React.ReactNode;
  noContainer?: boolean;
  containerClassName?: string;
  preTitle?: React.ReactNode;
};

export default function PageShell({
  title,
  subtitle,
  onCreate,
  createLabel,
  loading = false,
  error = null,
  onDismissError,
  searchNode,
  helpTip,
  extraActions,
  children,
  modals,
  noContainer = false,
  containerClassName,
  preTitle,
}: PageShellProps) {
  const toastCtx = (() => {
    try {
      return useToast() as any;
    } catch {
      return null;
    }
  })();
  const toasts = toastCtx?.toasts as any[] | undefined;
  const hide = toastCtx?.hide as ((id: number) => void) | undefined;
  const containerClasses = containerClassName ?? 'bg-white rounded-lg shadow-sm border border-gray-200 p-4';

  return (
    <div className="space-y-6">
      {preTitle && <div className="mb-2">{preTitle}</div>}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-3">
          {extraActions}
          {onCreate && (
            <button
              onClick={onCreate}
              className="px-4 py-2 rounded-lg bg-[#5d5448] text-white hover:bg-[#5d5448]/90 focus:ring-2 focus:ring-[#5d5448]/50 focus:outline-none transition-all duration-200 flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{createLabel ? createLabel : `Agregar ${title}`}</span>
            </button>
          )}
        </div>
      </div>

      {error && onDismissError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
            <button onClick={onDismissError} className="text-red-400 hover:text-red-600 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {toasts && toasts.length > 0 && (
        <div className="mb-4">
          {toasts.map((t: any) => (
            <div key={t.id} className="mb-3">
              <div className={`w-full rounded-md ${t.type !== 'custom' ? (t.type === 'success' ? 'bg-green-50' : t.type === 'error' ? 'bg-red-50' : t.type === 'info' ? 'bg-blue-50' : 'bg-yellow-50') : ''} border ${t.type === 'error' ? 'border-red-200' : 'border-green-200'}`}>
                <div className="p-4 flex items-start gap-3">
                  <div className={`${t.type === 'success' ? 'text-green-800' : t.type === 'error' ? 'text-red-800' : t.type === 'info' ? 'text-blue-800' : 'text-yellow-800'} flex-1`}>{t.title ? <div className="font-semibold">{t.title}</div> : null}<div className="text-sm mt-1">{t.message}</div></div>
                  <div>
                    <button onClick={() => hide && hide(t.id)} className="text-gray-400 hover:text-gray-600">×</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchNode}

      {noContainer ? (
        loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-[#5d5448]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Cargando...</span>
            </div>
          </div>
        ) : (
          children
        )
      ) : (
        <div className={containerClasses}>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-[#5d5448]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-gray-600">Cargando...</span>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      )}

      {helpTip}

      {modals}
    </div>
  );
}
