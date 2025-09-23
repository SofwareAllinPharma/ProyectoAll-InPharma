import { useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string | null;
  helperText?: string;
};

export default function PasswordField({ id, label, error, helperText, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="input-group">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={`form-control ${error ? "is-invalid" : ""}`}
          {...inputProps}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setVisible(v => !v)}
        >
          {visible ? "🙈" : "👁"}
        </button>
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
      {helperText && !error && <div className="form-text">{helperText}</div>}
    </div>
  );
}
