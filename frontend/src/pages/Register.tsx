import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { useAuthForm } from "../hooks/useAuthForm";
import { validateRegister, calculatePasswordStrength, getPasswordStrengthLabel } from "../services/auth/authValidation";
import AuthBranding from "../components/auth/AuthBranding";
import FormField from "../components/auth/FormField";
import * as api from "../api";

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState(0);

  const getLocationPath = () => {
    const stateFrom = location.state?.from;
    if (!stateFrom) {
      return "/";
    }
    if (typeof stateFrom === 'object' && stateFrom.pathname) {
      return stateFrom.pathname;
    }
    if (typeof stateFrom === 'string') {
      return stateFrom;
    }
    return "/";
  };
  const from = getLocationPath();
  
  useEffect(() => {
    document.title = "UM Exchange | Registrarse";
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [navigate, isAuthenticated, from]);

  const {
    formData,
    errors,
    isLoading,
    handleChange: baseHandleChange,
    handleSubmit,
  } = useAuthForm({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    validate: validateRegister,
    onSubmit: async (data) => {
      try {
        await api.register({
          username: data.username,
          email: data.email || '',
          password: data.password,
          password_confirm: data.confirmPassword || '',
        });
      } catch (error) {
        const errorMessage = (error as Error).message;
        let specificError = "Error al registrarse. ";
        if (errorMessage.includes("username")) {
          specificError = "Ese nombre de usuario ya está en uso.";
        } else if (errorMessage.includes("email")) {
          specificError = "Ese email ya está en uso.";
        }
        throw new Error(specificError);
      }

      await login(data.username, data.password);
      
      navigate(from, { replace: true });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    baseHandleChange(e);
    if (e.target.name === "password") {
      setPasswordStrength(calculatePasswordStrength(e.target.value));
    }
  };

  const strengthBar = getPasswordStrengthLabel(passwordStrength);

  return (
    <section className="auth-container">
      <div className="auth-wrapper">
        <AuthBranding
          title="Unite a UM Exchange"
          description="Creá tu cuenta y empezá a explorar las mejores universidades para tu intercambio."
          features={[
            { icon: "✓", text: "Acceso a todas las universidades" },
            { icon: "✓", text: "Compará hasta 3 destinos" },
            { icon: "✓", text: "Leé y dejá reseñas verificadas" },
            { icon: "✓", text: "Guardá tus favoritas en tu Lista de Deseos" },
          ]}
        />
        
        <div className="auth-form-section">
          <div className="form-container">
            <div className="form-header">
              <h1 className="form-title">Crear cuenta</h1>
              <p className="form-subtitle">Completá tus datos para registrarte</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
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
                value={formData.username}
                onChange={handleChange}
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
                label="Email"
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                error={errors.email}
                placeholder="tu@email.com"
                autoComplete="email"
                disabled={isLoading}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                }
              />

              <div className="form-group">
                <FormField
                  label="Contraseña"
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  showPasswordToggle
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  }
                />
                
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar-container">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`strength-bar ${i < passwordStrength ? "active" : ""}`}
                          style={{
                            background: i < passwordStrength ? strengthBar.color : "#e5e7eb",
                          }}
                        />
                      ))}
                    </div>
                    {strengthBar.text && (
                      <span className="strength-label" style={{ color: strengthBar.color }}>
                        {strengthBar.text}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <FormField
                label="Confirmar contraseña"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword || ""}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                showPasswordToggle
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                }
              />

              <div className="form-group">
                <label className="terms-label">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms || false}
                    onChange={handleChange}
                    className={`terms-checkbox ${errors.acceptTerms ? "error" : ""}`}
                    disabled={isLoading}
                  />
                  <span className="terms-text">
                    Acepto los{" "}
                    <Link to="/terms" className="terms-link" target="_blank">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link to="/privacy" className="terms-link" target="_blank">
                      política de privacidad
                    </Link>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <span className="error-message">{errors.acceptTerms}</span>
                )}
              </div>

              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear cuenta
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>

              <div className="form-footer">
                <span className="footer-text">¿Ya tenés cuenta?</span>
                <Link to="/login" state={{ from: from }} className="link-text strong">
                  Iniciá sesión
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}