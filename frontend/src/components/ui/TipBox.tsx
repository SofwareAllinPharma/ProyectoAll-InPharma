import React from 'react';

export default function TipBox({
  children,
  centered = false,
  maxWidth = 'max-w-3xl',
  mt = 'mt-0',
}: {
  children: React.ReactNode;
  centered?: boolean;
  maxWidth?: string;
  mt?: string;
}) {
  const container = (
    <div className={`${mt} p-4 bg-[#f3efe6] rounded-lg border-l-4 border-[#7c6a55] ${maxWidth} w-full`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-[#7c6a55]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-[#3e3529] font-roboto">{children}</p>
        </div>
      </div>
    </div>
  );

  if (centered) return <div className="flex justify-center">{container}</div>;
  return container;
}
