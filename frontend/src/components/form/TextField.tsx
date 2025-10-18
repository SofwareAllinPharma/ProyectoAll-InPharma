import React from 'react';

type Props = {
  id?: string;
  label?: React.ReactNode;
  error?: string | null;
  helperText?: string | null;
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
};

export default function TextField({ id, label, error, helperText, disabled, inputProps = {}, className = '' }: Props) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        disabled={disabled || inputProps.disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-[#5d5448] focus:border-[#5d5448] ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''} ${className}`}
        {...(inputProps as any)}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {helperText && !error && <p className="text-gray-500 text-xs mt-1">{helperText}</p>}
    </div>
  );
}
