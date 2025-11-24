import { useState } from 'react';
import type { FormErrors, AuthFormData } from '../services/auth/authTypes';

interface UseAuthFormProps {
  initialValues: AuthFormData;
  validate: (data: AuthFormData) => FormErrors;
  onSubmit: (data: AuthFormData) => Promise<void>;
}

export const useAuthForm = ({ initialValues, validate, onSubmit }: UseAuthFormProps) => {
  const [formData, setFormData] = useState<AuthFormData>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: newValue as any }));
    
    if (errors[name as keyof FormErrors] || errors.general) {
      setErrors((prev) => ({ 
        ...prev, 
        [name]: undefined, 
        general: undefined 
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({
        general: error instanceof Error 
          ? error.message 
          : "Ocurrió un error inesperado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit,
    setErrors,
  };
};