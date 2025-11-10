import { Link } from "react-router-dom";
import FormField from "./FormField.tsx";
import type { AuthFormData, FormErrors } from "../../services/auth/authTypes";

interface LoginFormProps {
  formData: Partial<AuthFormData>;
  errors: FormErrors;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  from: string; // Prop para pasar la URL de redirección
}

export default function LoginForm({
  formData,
  errors,
  isLoading,
  onChange,
  onSubmit,
  from,
}: LoginFormProps) {
  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="form-title">¡Hola de nuevo!</h1>
        <p className="form-subtitle">Iniciá sesión para continuar</p>
      </div>

      <form onSubmit={onSubmit} className="auth-form" noValidate>
        {errors.general && (
          <div className="alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errors.general}</span>
          </div>
        )}

        <FormField
          label="Nombre de usuario"
          id="username"
          name="username"
          value={formData.username || ""}
          onChange={onChange}
          error={errors.username}
          placeholder="tu_usuario"
          autoComplete="username"
          disabled={isLoading}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />

        <FormField
          label="Contraseña"
          id="password"
          name="password"
          type="password"
          value={formData.password || ""}
          onChange={onChange}
          error={errors.password}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
          showPasswordToggle
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
        />
        
        <div className="form-options">
          <label className="remember-me">
            <input type="checkbox" name="remember" />
            Recordarme
          </label>
          <a href="/reset-password" tabIndex={-1} className="link-text">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" />
              Ingresando...
            </>
          ) : (
            "Ingresar"
          )}
        </button>

        <div className="form-footer">
          <span className="footer-text">¿No tenés cuenta?</span>
          <Link 
            to="/register" 
            state={{ from: from }} // Aquí pasamos el estado 'from'
            className="link-text strong"
          >
            Registrate
          </Link>
        </div>
      </form>
    </div>
  );
}