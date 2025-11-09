/**
 * Configuración centralizada de la API
 * Todas las llamadas al backend pasan por aquí
 */

// MODIFICACIÓN: Usar ruta relativa para que funcione el proxy de Vite
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';


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
  // MODIFICACIÓN: Manejar respuestas vacías (como en DELETE)
  if (response.status === 204) {
    return;
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
  // Añadido para que coincida con el serializer
  review_count?: number; 
  avg_social?: number;
  avg_academic?: number;
  avg_place?: number;
  faculties?: string[]; // o Faculty[] si usamos el serializer de detalle
  description: string;
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
  user_profile_photo?: string | null;
}

export interface Wishlist {
  id: number;
  user: number;
  university: number;
  created_at: string;
  // Añadido para que coincida con el serializer
  university_detail?: University; 
}

export interface Profile {
  id: number;
  username: string;
  email: string;
  // Modificado para que coincida con el serializer
  profile: {
    id: number;
    // 'profile_photo' es write-only en el backend, no se incluye en la RTA
    profile_photo_url: string | null;
  };
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

// MODIFICACIÓN: El backend devuelve un objeto { results: [], metadata: {} }
export interface UniversityListResponse {
  results: University[];
  metadata: {
    total_universities: number;
    unique_countries: number;
    unique_continents: number;
    avg_qs_rating: number | null;
  };
}

export const getUniversities = async (filters?: UniversityFilters): Promise<UniversityListResponse> => {
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
  
  // El backend siempre devuelve el objeto, incluso si no hay filtros
  return handleResponse(response);
};

export const getUniversity = async (id: number): Promise<University> => {
  const response = await fetch(`${API_BASE_URL}/universities/${id}/`, {
    headers: getHeaders(),
  });
  
  return handleResponse(response);
};

export const getTopUniversities = async (limit = 10): Promise<UniversityListResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/universities/?ordering=qs_rating_top&limit=${limit}`,
    {
      headers: getHeaders(),
    }
  );
  
  return handleResponse(response);
};

// Incrementar contador de visitas
export const incrementUniversityVisits = async (id: number): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/universities/${id}/increment-visits/`, {
      method: 'POST',
      headers: getHeaders(),
    });
  } catch (error) {
    // Silenciosamente fallar, no es crítico
    console.warn('Failed to increment visits:', error);
  }
};

// Verificar si una universidad está en la wishlist
export const isInWishlist = async (universityId: number): Promise<boolean> => {
  try {
    const wishlist = await getWishlist();
    return wishlist.some(item => item.university === universityId);
  } catch {
    return false;
  }
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

// FUNCIÓN FALTANTE (AÑADIDA)
/**
 * Obtiene solo las reviews del usuario autenticado.
 */
export const getUserReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_BASE_URL}/reviews/my_reviews/`, {
    headers: getHeaders(true),
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
  // MODIFICACIÓN: Usar el endpoint 'add-by-university'
  const response = await fetch(`${API_BASE_URL}/wishlists/add-by-university/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ university: universityId }),
  });
  
  return handleResponse(response);
};

export const removeFromWishlist = async (universityId: number): Promise<void> => {
  // MODIFICACIÓN: Usar el endpoint 'remove-by-university' y enviar ID de universidad
  const response = await fetch(`${API_BASE_URL}/wishlists/remove-by-university/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ university: universityId })
  });
  
  if (!response.ok && response.status !== 204) {
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
  password_confirm: string; // Añadido para que coincida con el serializer
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

export const register = async (data: RegisterData): Promise<Profile> => { // Devuelve el perfil de usuario
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

// FUNCIÓN FALTANTE (AÑADIDA)
/**
 * Actualiza el perfil del usuario (username y/o profile_photo).
 * Usa FormData para permitir la subida de archivos.
 */
export const updateProfile = async (formData: FormData): Promise<Profile> => {
  const response = await fetch(`${API_BASE_URL}/profile/`, {
    method: 'PATCH',
    headers: {
      // No setear 'Content-Type', el navegador lo hace por FormData
      'Accept': 'application/json',
      // @ts-ignore
      'Authorization': getHeaders(true)['Authorization'], // Solo header de Auth
    },
    body: formData,
  });
  return handleResponse(response);
};


// ===== ADICIONES =====

// Tipos nuevos para las funciones agregadas

export interface UniversityFilterOptions {
  countries: string[];
  continents: Continent[];
}

export interface WishlistWithDetails extends Wishlist {
  university_details: University;
}

/**
 * Obtiene las opciones disponibles para los filtros de universidades.
 * Asume un endpoint 'universities/filter-options/' que devuelve las listas.
 */
export const getFilterOptions = async (): Promise<UniversityFilterOptions> => {
  // MODIFICACIÓN: Este endpoint no existe, pero getUniversities/countries/ sí
  const response = await fetch(`${API_BASE_URL}/universities/countries/`, {
    headers: getHeaders(),
  });
  const data = await handleResponse(response);
  // Simulado, ya que no hay endpoint para continentes
  return {
    countries: data.countries || [],
    continents: ["America", "Europe", "Asia", "Oceania", "Africa"]
  };
};

/**
 * Obtiene la wishlist del usuario y la enriquece con los detalles
 * de cada universidad, ya que la API base de wishlist solo devuelve IDs.
 */
export const getWishlistWithDetails = async (): Promise<WishlistWithDetails[]> => {
  // 1. Obtener la lista de la wishlist
  const wishlistItems = await getWishlist(); // Esto ya tiene university_detail
  
  // 2. Mapear para asegurar el formato
  const detailedItems = wishlistItems.map(item => ({
    ...item,
    university_details: item.university_detail as University
  }));
  
  return detailedItems;
};