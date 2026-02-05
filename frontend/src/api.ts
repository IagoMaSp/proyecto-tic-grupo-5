const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  if (response.status === 204) {
    return;
  }
  return response.json();
};

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
  review_count?: number;
  avg_social?: number;
  avg_academic?: number;
  avg_place?: number;
  faculties?: string[];
  description: string;
  main_photo?: string | null;
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
  is_approved: boolean;
  username?: string;
  university_name?: string;
  user_profile_photo?: string | null;
}

export interface Wishlist {
  id: number;
  user: number;
  university: number;
  created_at: string;
  updated_at: string;
  university_details?: University;
}

export interface Profile {
  id: number;
  username: string;
  email: string;
  profile: {
    id: number;
    profile_photo_url: string | null;
  };
}

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
  
  return handleResponse(response);
};

export const getUniversity = async (id: number): Promise<University> => {
  const response = await fetch(`${API_BASE_URL}/universities/${id}/`, {
    headers: getHeaders(true),
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

export const incrementUniversityVisits = async (id: number): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/universities/${id}/increment-visits/`, {
      method: 'POST',
      headers: getHeaders(),
    });
  } catch (error) {
    console.warn('Failed to increment visits:', error);
  }
};

export const isInWishlist = async (universityId: number): Promise<boolean> => {
  try {
    const wishlist = await getWishlist();
    return wishlist.some(item => item.university === universityId);
  } catch {
    return false;
  }
};

export const getReviews = async (universityId?: number): Promise<Review[]> => {
  const url = universityId 
    ? `${API_BASE_URL}/reviews/?university=${universityId}`
    : `${API_BASE_URL}/reviews/`;
    
  const response = await fetch(url, {
    headers: getHeaders(true),
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

export const getUserReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_BASE_URL}/reviews/my_reviews/`, {
    headers: getHeaders(true),
  });
  return handleResponse(response);
};

export const getWishlist = async (): Promise<Wishlist[]> => {
  const response = await fetch(`${API_BASE_URL}/wishlists/`, {
    headers: getHeaders(true),
  });
  const data = await handleResponse(response);
  console.log('[API] getWishlist response:', data);
  
  if (data && typeof data === 'object' && 'results' in data) {
    console.log('[API] Respuesta paginada detectada, extrayendo results');
    return data.results;
  }
  
  if (Array.isArray(data)) {
    return data;
  }
  
  console.warn('[API] getWishlist formato inesperado:', data);
  return [];
};

export const addToWishlist = async (universityId: number): Promise<Wishlist> => {
  const response = await fetch(`${API_BASE_URL}/wishlists/add-by-university/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ university: universityId }),
  });
  
  return handleResponse(response);
};

export const removeFromWishlist = async (universityId: number): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/wishlists/remove-by-university/?university=${universityId}`,
    {
      method: 'DELETE',
      headers: getHeaders(true),
    }
  );
  
  if (!response.ok && response.status !== 204 && response.status !== 404) {
    console.log('[API] Universidad eliminada de wishlist correctamente');
    return;
  }

  const errorData = await response.json().catch(() => ({ detail: 'Error al eliminar' }));
  throw new Error(errorData.detail || `HTTP ${response.status}`);
};

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
  
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
  
  return data;
};

export const register = async (data: RegisterData): Promise<Profile> => {
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

export const updateProfile = async (formData: FormData): Promise<Profile> => {
  const response = await fetch(`${API_BASE_URL}/profile/`, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json',
      'Authorization': getHeaders(true)['Authorization'],
    },
    body: formData,
  });
  return handleResponse(response);
};

export interface UniversityFilterOptions {
  countries: string[];
  continents: Continent[];
}

export interface WishlistWithDetails extends Wishlist {
  university_details: University;
}

export const getFilterOptions = async (): Promise<UniversityFilterOptions> => {
  const response = await fetch(`${API_BASE_URL}/universities/countries/`, {
    headers: getHeaders(),
  });
  const data = await handleResponse(response);
  return {
    countries: data.countries || [],
    continents: ["America", "Europe", "Asia", "Oceania", "Africa"]
  };
};

export const getWishlistWithDetails = async (): Promise<WishlistWithDetails[]> => {
  try {
    const wishlistItems = await getWishlist();
    
    console.log('[API] getWishlistWithDetails - items recibidos:', wishlistItems);
    
    if (!Array.isArray(wishlistItems)) {
      console.error('[API] getWishlist no devolvió un array:', wishlistItems);
      return [];
    }
    
    if (wishlistItems.length > 0 && wishlistItems[0].university_details) {
      console.log('[API] Backend ya incluye university_details');
      return wishlistItems as WishlistWithDetails[];
    }
    
    console.log('[API] Fetching detalles de universidades manualmente...');
    const detailedItems = await Promise.all(
      wishlistItems.map(async (item) => {
        try {
          const universityDetails = await getUniversity(item.university);
          return {
            ...item,
            university_details: universityDetails
          } as WishlistWithDetails;
        } catch (error) {
          console.error(`[API] Error al fetch universidad ${item.university}:`, error);
          return null;
        }
      })
    );
    
    return detailedItems.filter((item): item is WishlistWithDetails => item !== null);
    
  } catch (error) {
    console.error('[API] Error en getWishlistWithDetails:', error);
    return [];
  }
};
