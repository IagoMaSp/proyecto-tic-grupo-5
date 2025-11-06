// frontend/src/pages/LogIn.tsx (SIMPLIFICADO)
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { useAuthForm } from "../hooks/useAuthForm";
import { validateLogin } from "../services/auth/authValidation";
import AuthBranding from "../components/auth/AuthBranding";
import LoginForm from "../components/auth/LoginForm";

export default function LogIn() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  useEffect(() => {
    document.title = "UM Exchange | Iniciar sesión";
    if (isAuthenticated) {
      navigate("/");
    }
  }, [navigate, isAuthenticated]);

  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
  } = useAuthForm({
    initialValues: {
      username: "",
      password: "",
    },
    validate: validateLogin,
    onSubmit: async (data) => {
      await login(data.username, data.password);
      navigate("/");
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
            { value: "500+", label: "Reviews" },
          ]}
        />
        
        <div className="auth-form-section">
          <LoginForm
            formData={formData}
            errors={errors}
            isLoading={isLoading}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
}