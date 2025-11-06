// frontend/src/components/auth/FormField.tsx
import { useState } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  autoComplete?: string;
  showPasswordToggle?: boolean;
}

export default function FormField({
  label,
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled,
  icon,
  autoComplete,
  showPasswordToggle = false,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = showPasswordToggle && showPassword ? "text" : type;

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="input-wrapper">
        <input
          type={inputType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`form-input ${error ? "error" : ""}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
        />
        {icon && <div className="input-icon">{icon}</div>}
        
        {showPasswordToggle && (
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            disabled={disabled}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="error-message">{error}</span>
      )}
    </div>
  );
}