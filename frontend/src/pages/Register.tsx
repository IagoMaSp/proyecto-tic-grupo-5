import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "UM Exchange | Registrarse";
  }, []);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    
    // Limpiar error del campo
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Calcular fuerza de contraseña
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    setPasswordStrength(Math.min(strength, 4));
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { text: "", color: "" };
    if (passwordStrength === 1) return { text: "Muy débil", color: "#ef4444" };
    if (passwordStrength === 2) return { text: "Débil", color: "#f97316" };
    if (passwordStrength === 3) return { text: "Buena", color: "#eab308" };
    return { text: "Fuerte", color: "#22c55e" };
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    
    // Username
    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length < 3) {
      newErrors.username = "Debe tener al menos 3 caracteres";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Solo letras, números y guion bajo";
    }
    
    // Email
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    // Password
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "Debe tener al menos 8 caracteres";
    }
    
    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmá tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    // Terms
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los términos y condiciones";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    
    // Simulación de llamada a la API
    setTimeout(() => {
      setIsLoading(false);
      console.log("Register attempt:", formData);
      // Después del registro exitoso, redirigir al login
      // navigate("/login");
    }, 2000);
  };

  const strengthBar = getPasswordStrengthLabel();

  return (
    <section className="register-container">
      <div className="register-wrapper">
        {/* Columna izquierda - Branding */}
        <div className="register-brand">
          <div className="brand-content">
            <div className="brand-logo">
              <div className="logo-circle">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              </div>
            </div>
            <h2 className="brand-title">Unite a UM Exchange</h2>
            <p className="brand-desc">
              Creá tu cuenta y empezá a explorar las mejores universidades 
              para tu intercambio.
            </p>
            
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Acceso a todas las universidades</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Compará hasta 3 destinos</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Leé y dejá reviews verificadas</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">Guardá tus favoritas en wishlist</div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="register-form-section">
          <div className="form-container">
            <div className="form-header">
              <h1 className="form-title">Crear cuenta</h1>
              <p className="form-subtitle">Completá tus datos para registrarte</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form" noValidate>
              {/* Username */}
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Nombre de usuario
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`form-input ${errors.username ? "error" : ""}`}
                    placeholder="tu_usuario"
                    autoComplete="username"
                  />
                  <div className="input-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                </div>
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="tu@email.com"
                    autoComplete="email"
                  />
                  <div className="input-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <div className="input-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
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
                </div>
                
                {/* Password strength indicator */}
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
                
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar contraseña
                </label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <div className="input-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
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
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="form-group">
                <label className="terms-label">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className={`terms-checkbox ${errors.acceptTerms ? "error" : ""}`}
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

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear cuenta
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="form-footer">
                <span className="footer-text">¿Ya tenés cuenta?</span>
                <Link to="/login" className="link-text strong">
                  Iniciá sesión
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .register-container {
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: linear-gradient(135deg, #eef4ff 0%, #f7fbff 100%);
          position: relative;
          overflow: hidden;
        }

        .register-container::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(circle at 80% 20%, rgba(31, 94, 209, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(24, 74, 166, 0.06) 0%, transparent 50%);
          animation: gradientShift 25s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-5%, -5%) rotate(180deg); }
        }

        .register-wrapper {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 20px 60px rgba(10, 42, 106, 0.12),
            0 0 0 1px rgba(24, 74, 166, 0.08);
          animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* === COLUMNA IZQUIERDA - BRANDING === */
        .register-brand {
          background: linear-gradient(180deg, var(--um-blue-700) 0%, var(--um-blue-900) 100%);
          padding: 60px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .register-brand::before {
          content: "";
          position: absolute;
          top: -80px;
          right: -80px;
          width: 280px;
          height: 280px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          animation: float 10s ease-in-out infinite;
        }

        .register-brand::after {
          content: "";
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
          animation: float 12s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, 15px); }
        }

        .brand-content {
          position: relative;
          z-index: 1;
          animation: fadeInLeft 0.8s ease-out 0.2s backwards;
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .brand-logo {
          margin-bottom: 24px;
        }

        .logo-circle {
          width: 72px;
          height: 72px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .brand-title {
          font-size: 32px;
          font-weight: 900;
          color: white;
          margin: 0 0 16px;
          letter-spacing: 0.3px;
        }

        .brand-desc {
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 40px;
        }

        .brand-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: slideInLeft 0.5s ease-out backwards;
        }

        .feature-item:nth-child(1) { animation-delay: 0.4s; }
        .feature-item:nth-child(2) { animation-delay: 0.5s; }
        .feature-item:nth-child(3) { animation-delay: 0.6s; }
        .feature-item:nth-child(4) { animation-delay: 0.7s; }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .feature-icon {
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 14px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          flex-shrink: 0;
        }

        .feature-text {
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
        }

        /* === COLUMNA DERECHA - FORMULARIO === */
        .register-form-section {
          padding: 50px 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-container {
          width: 100%;
          max-width: 420px;
          animation: fadeInRight 0.8s ease-out 0.3s backwards;
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .form-header {
          margin-bottom: 28px;
        }

        .form-title {
          font-size: 28px;
          font-weight: 900;
          color: var(--um-blue-900);
          margin: 0 0 8px;
        }

        .form-subtitle {
          font-size: 15px;
          color: var(--muted);
          margin: 0;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          height: 48px;
          padding: 0 44px 0 44px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          color: var(--ink);
          background: white;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .form-input:focus {
          border-color: var(--um-blue-600);
          box-shadow: 0 0 0 4px rgba(31, 94, 209, 0.08);
        }

        .form-input.error {
          border-color: #ef4444;
        }

        .form-input.error:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.08);
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .form-input:focus + .input-icon {
          color: var(--um-blue-600);
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 6px;
          color: #9ca3af;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .toggle-password:hover {
          color: var(--um-blue-600);
          background: rgba(31, 94, 209, 0.05);
        }

        .error-message {
          font-size: 13px;
          color: #ef4444;
          display: flex;
          align-items: center;
          gap: 4px;
          animation: shake 0.4s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* Password Strength Indicator */
        .password-strength {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }

        .strength-bar-container {
          flex: 1;
          display: flex;
          gap: 4px;
          height: 4px;
        }

        .strength-bar {
          flex: 1;
          background: #e5e7eb;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .strength-bar.active {
          animation: growBar 0.3s ease;
        }

        @keyframes growBar {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        .strength-label {
          font-size: 12px;
          font-weight: 600;
          min-width: 70px;
        }

        /* Terms and Conditions */
        .terms-label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          user-select: none;
          padding: 12px;
          border-radius: 10px;
          transition: background 0.2s ease;
        }

        .terms-label:hover {
          background: rgba(31, 94, 209, 0.03);
        }

        .terms-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--um-blue-600);
          margin-top: 2px;
          flex-shrink: 0;
        }

        .terms-checkbox.error {
          outline: 2px solid #ef4444;
          outline-offset: 2px;
          border-radius: 4px;
        }

        .terms-text {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.5;
        }

        .terms-link {
          color: var(--um-blue-700);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .terms-link:hover {
          color: var(--um-blue-600);
          text-decoration: underline;
        }

        .submit-button {
          width: 100%;
          height: 48px;
          background: var(--um-blue-700);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .submit-button:hover:not(:disabled) {
          background: var(--um-blue-600);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 94, 209, 0.3);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .form-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .footer-text {
          font-size: 14px;
          color: var(--muted);
        }

        .link-text {
          font-size: 14px;
          color: var(--um-blue-700);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .link-text:hover {
          color: var(--um-blue-600);
          text-decoration: underline;
        }

        .link-text.strong {
          font-weight: 700;
        }

        /* === RESPONSIVE === */
        @media (max-width: 1024px) {
          .register-wrapper {
            grid-template-columns: 1fr;
          }

          .register-brand {
            padding: 40px 30px;
          }

          .register-form-section {
            padding: 40px 30px;
            max-height: none;
          }
        }

        @media (max-width: 480px) {
          .register-container {
            padding: 20px 16px;
          }

          .register-wrapper {
            border-radius: 16px;
          }

          .register-brand {
            padding: 30px 24px;
          }

          .register-form-section {
            padding: 30px 24px;
          }

          .form-title {
            font-size: 24px;
          }

          .brand-title {
            font-size: 26px;
          }

          .form-input {
            height: 44px;
          }

          .submit-button {
            height: 44px;
          }
        }
      `}</style>
    </section>
  );
}