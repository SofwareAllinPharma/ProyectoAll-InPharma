import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string | null;
  helperText?: string;
};

export default function PasswordField({ id, label, error, helperText, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm mb-1">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...inputProps}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center text-gray-500 focus:outline-none"
          onClick={() => setVisible(v => !v)}
          tabIndex={-1}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOff className= "h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
    );
  }
