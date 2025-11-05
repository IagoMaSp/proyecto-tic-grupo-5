interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

// 1. ACTUALIZACIÓN: Añadir 'password_confirm'
interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string; 
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  profile: {
    id: number;
    profile_photo: string | null;
    profile_photo_url: string | null;
  };
}

class AuthService {
  private baseURL = '/api';

  // ... (login sin cambios) ...
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al iniciar sesión');
    }

    const data = await response.json();
    
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    return data;
  }

  // 2. ACTUALIZACIÓN: El 'body' ahora envía todos los campos
  async register(userData: RegisterData): Promise<UserProfile> {
    const response = await fetch(`${this.baseURL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData), // userData ahora incluye password_confirm
    });

    if (!response.ok) {
      const error = await response.json();
      // Manejar errores de validación
      if (error.username) {
        throw new Error(`Usuario: ${error.username[0]}`);
      }
      if (error.email) {
        throw new Error(`Email: ${error.email[0]}`);
      }
      if (error.password) {
        throw new Error(`Contraseña: ${error.password[0]}`);
      }
      // Error genérico
      const detail = Object.values(error).flat().join(' ');
      throw new Error(detail || 'Error al registrarse');
    }

    return response.json();
  }

  // ... (el resto del archivo authService.ts sin cambios) ...
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      this.logout();
      throw new Error('Session expired');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    
    return data.access;
  }

  async getProfile(): Promise<UserProfile> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No token available');
    }

    const response = await fetch(`${this.baseURL}/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      try {
        await this.refreshToken();
        return this.getProfile(); // Reintentar
      } catch {
        this.logout();
        throw new Error('Session expired');
      }
    }

    if (!response.ok) {
      throw new Error('Error al obtener perfil');
    }

    return response.json();
  }
}

export const authService = new AuthService();