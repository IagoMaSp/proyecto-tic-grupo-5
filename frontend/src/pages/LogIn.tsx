import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext.tsx";
import { useAuthForm } from "../hooks/useAuthForm.ts";
import { validateLogin } from "../services/auth/authValidation.ts";
import AuthBranding from "../components/auth/AuthBranding.tsx";
import LoginForm from "../components/auth/LoginForm.tsx";

export default function LogIn() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { login, isAuthenticated } = useAuth();
  
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
    document.title = "UM Exchange | Iniciar sesión";
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [navigate, isAuthenticated, from]);

  const rememberedUsername = localStorage.getItem('rememberedUsername');

  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  } = useAuthForm({
    initialValues: {
      username: rememberedUsername || "",
      password: "",
      remember: !!rememberedUsername,
    },
    validate: validateLogin,
    onSubmit: async (data) => {
      if (data.remember) {
        localStorage.setItem('rememberedUsername', data.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      await login(data.username, data.password);
      navigate(from, { replace: true });
    },
  });

  return (
    <section className="auth-container">
      <div className="auth-wrapper">
        <AuthBranding
          title="UM Exchange"
          description="Tu plataforma de intercambios estudiantiles. Explorá universidades, 
            compará destinos y leé experiencias reales de alumnos UM."
          stats={[
            { value: "150+", label: "Universidades" },
            { value: "40+", label: "Países" },
            { value: "500+", label: "Reseñas" },
          ]}
        />
        
        <div className="auth-form-section">
          <LoginForm
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            onChange={handleChange}
            onSubmit={handleSubmit}
            from={from}
          />
        </div>
      </div>
    </section>
  );
}