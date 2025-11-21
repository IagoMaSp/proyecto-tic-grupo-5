import type { FormErrors, AuthFormData } from './authTypes';

export const validateLogin = (data: AuthFormData): FormErrors => {
  const errors: FormErrors = {};
  
  if (!data.username.trim()) {
    errors.username = "El nombre de usuario es requerido";
  }
  
  if (!data.password) {
    errors.password = "La contraseña es requerida";
  } else if (data.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  return errors;
};

export const validateRegister = (data: AuthFormData): FormErrors => {
  const errors: FormErrors = {};
  
  if (!data.username.trim()) {
    errors.username = "El nombre de usuario es requerido";
  } else if (data.username.length < 3) {
    errors.username = "Debe tener al menos 3 caracteres";
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.username = "Solo letras, números y guion bajo";
  }
  
  if (data.email !== undefined) {
    if (!data.email.trim()) {
      errors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Email inválido";
    }
  }
  
  if (!data.password) {
    errors.password = "La contraseña es requerida";
  } else if (data.password.length < 8) {
    errors.password = "Debe tener al menos 8 caracteres";
  }
  
  if (data.confirmPassword !== undefined) {
    if (!data.confirmPassword) {
      errors.confirmPassword = "Confirmá tu contraseña";
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }
  }
  
  if (data.acceptTerms !== undefined && !data.acceptTerms) {
    errors.acceptTerms = "Debes aceptar los términos y condiciones";
  }

  return errors;
};

export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return Math.min(strength, 4);
};

export const getPasswordStrengthLabel = (strength: number) => {
  if (strength === 0) return { text: "", color: "" };
  if (strength === 1) return { text: "Muy débil", color: "#ef4444" };
  if (strength === 2) return { text: "Débil", color: "#f97316" };
  if (strength === 3) return { text: "Buena", color: "#eab308" };
  return { text: "Fuerte", color: "#22c55e" };
};