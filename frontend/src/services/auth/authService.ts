import type { LoginCredentials, LoginResponse, UserProfile } from './authTypes';

class AuthService {
  private baseURL = '/api';

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
        return this.getProfile(); 
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