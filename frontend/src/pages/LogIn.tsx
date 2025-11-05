import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LogIn() {
  useEffect(() => {
    document.title = "UM Exchange | Iniciar sesión";
  }, []);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
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
      // Aquí irá la lógica real de autenticación con el backend
      console.log("Login attempt:", formData);
    }, 1500);
  };

  return (
    <section className="login-container">
      <div className="login-wrapper">
        {/* Columna izquierda - Branding */}
        <div className="login-brand">
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
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <h2 className="brand-title">UM Exchange</h2>
            <p className="brand-desc">
              Tu plataforma de intercambios estudiantiles. Explorá universidades, 
              compará destinos y leé experiencias reales de alumnos UM.
            </p>
            <div className="brand-stats">
              <div className="stat-item">
                <div className="stat-value">150+</div>
                <div className="stat-label">Universidades</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">40+</div>
                <div className="stat-label">Países</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">500+</div>
                <div className="stat-label">Reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Formulario */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="form-header">
              <h1 className="form-title">Bienvenido de vuelta</h1>
              <p className="form-subtitle">Ingresá a tu cuenta para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {/* Campo Username */}
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

              {/* Campo Password */}
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
                    autoComplete="current-password"
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
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {/* Opciones adicionales */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox" />
                  <span>Recordarme</span>
                </label>
                <Link to="/forgot-password" className="link-text">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón Submit */}
              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar"
                )}
              </button>

              {/* Registro */}
              <div className="form-footer">
                <span className="footer-text">¿No tenés cuenta?</span>
                <Link to="/register" className="link-text strong">
                  Registrate acá
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: linear-gradient(135deg, #eef4ff 0%, #f7fbff 100%);
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(circle at 20% 80%, rgba(31, 94, 209, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(24, 74, 166, 0.06) 0%, transparent 50%);
          animation: gradientShift 20s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10%, -10%); }
        }

        .login-wrapper {
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
        .login-brand {
          background: linear-gradient(180deg, var(--um-blue-700) 0%, var(--um-blue-900) 100%);
          padding: 60px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .login-brand::before {
          content: "";
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        }

        .login-brand::after {
          content: "";
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 250px;
          height: 250px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
          animation: float 10s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 20px); }
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

        .brand-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.15);
        }

        .stat-item {
          text-align: center;
          animation: fadeInUp 0.6s ease-out backwards;
        }

        .stat-item:nth-child(1) { animation-delay: 0.4s; }
        .stat-item:nth-child(2) { animation-delay: 0.5s; }
        .stat-item:nth-child(3) { animation-delay: 0.6s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-value {
          font-size: 28px;
          font-weight: 900;
          color: white;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* === COLUMNA DERECHA - FORMULARIO === */
        .login-form-section {
          padding: 60px 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
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
          margin-bottom: 32px;
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

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
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

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 4px 0;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--muted);
          cursor: pointer;
          user-select: none;
        }

        .checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--um-blue-600);
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
          padding-top: 24px;
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

        /* === RESPONSIVE === */
        @media (max-width: 900px) {
          .login-wrapper {
            grid-template-columns: 1fr;
          }

          .login-brand {
            display: none;
          }

          .login-form-section {
            padding: 40px 24px;
          }
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 20px 16px;
          }

          .login-wrapper {
            border-radius: 16px;
          }

          .form-title {
            font-size: 24px;
          }

          .brand-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }

          .stat-value {
            font-size: 22px;
          }
        }
      `}</style>
    </section>
  );
}