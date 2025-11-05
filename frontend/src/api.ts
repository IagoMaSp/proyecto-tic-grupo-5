/**
 * Configuración centralizada de la API
 * Todas las llamadas al backend pasan por aquí
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper para headers comunes
const getHeaders = (includeAuth = false) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper para manejo de errores
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
};

// ===== TIPOS =====

export type Continent = 'Africa' | 'America' | 'Asia' | 'Europe' | 'Oceania';

export interface University {
  id: number;
  name: string;
  country: string;
  continent: Continent;
  qs_rating_top: number;
  qs_rating_bottom: number;
  web_pages: string;
  status: string;
  visits_count: number;
  overall_avg_rating: number | null;
  photos?: Photo[];
}

export interface Photo {
  id: number;
  university: number;
  photo: string;
}

export interface Review {
  id: number;
  description: string;
  start_date: string;
  end_date: string;
  social_rating: number;
  academic_rating: number;
  place_rating: number;
  overall_rating: number;
  user: number;
  university: number;
  username?: string;
  university_name?: string;
}

export interface Wishlist {
  id: number;
  user: number;
  university: number;
  created_at: string;
}

export interface Profile {
  id: number;
  username: string;
  email: string;
  profile_photo: string | null;
}

// ===== UNIVERSITIES =====

export interface UniversityFilters {
  search?: string;
  country?: string;
  continent?: Continent;
  min_qs?: number;
  min_overall_rating?: number;
  min_social_rating?: number;
  min_academic_rating?: number;
  min_place_rating?: number;
  ordering?: string;
}

export const getUniversities = async (filters?: UniversityFilters): Promise<University[]> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const url = `${API_BASE_URL}/universities/?${params.toString()}`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  
  return handleResponse(response);
};

export const getUniversity = async (id: number): Promise<University> => {
  const response = await fetch(`${API_BASE_URL}/universities/${id}/`, {
    headers: getHeaders(),
  });
  
  return handleResponse(response);
};

export const getTopUniversities = async (limit = 10): Promise<University[]> => {
  const response = await fetch(
    `${API_BASE_URL}/universities/?ordering=qs_rating_top&limit=${limit}`,
    {
      headers: getHeaders(),
    }
  );
  
  return handleResponse(response);
};

// ===== REVIEWS =====

export const getReviews = async (universityId?: number): Promise<Review[]> => {
  const url = universityId 
    ? `${API_BASE_URL}/reviews/?university=${universityId}`
    : `${API_BASE_URL}/reviews/`;
    
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  
  return handleResponse(response);
};

export const createReview = async (reviewData: Partial<Review>): Promise<Review> => {
  const response = await fetch(`${API_BASE_URL}/reviews/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(reviewData),
  });
  
  return handleResponse(response);
};

// ===== WISHLIST =====

export const getWishlist = async (): Promise<Wishlist[]> => {
  const response = await fetch(`${API_BASE_URL}/wishlists/`, {
    headers: getHeaders(true),
  });
  
  return handleResponse(response);
};

export const addToWishlist = async (universityId: number): Promise<Wishlist> => {
  const response = await fetch(`${API_BASE_URL}/wishlists/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ university: universityId }),
  });
  
  return handleResponse(response);
};

export const removeFromWishlist = async (wishlistId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
};

// ===== AUTH =====

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export const login = async (credentials: LoginCredentials): Promise<TokenResponse> => {
  const response = await fetch(`${API_BASE_URL}/token/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials),
  });
  
  const data = await handleResponse(response);
  
  // Guardar tokens
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  
  return data;
};

export const register = async (data: RegisterData): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/register/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  
  return handleResponse(response);
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getProfile = async (): Promise<Profile> => {
  const response = await fetch(`${API_BASE_URL}/profile/`, {
    headers: getHeaders(true),
  });
  
  return handleResponse(response);
};