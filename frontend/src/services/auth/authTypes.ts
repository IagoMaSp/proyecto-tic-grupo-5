export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  profile: {
    id: number;
    profile_photo: string | null;
    profile_photo_url: string | null;
  };
}

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  general?: string;
}

export interface AuthFormData {
  username: string;
  email?: string;
  password: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
  remember?: boolean;
}