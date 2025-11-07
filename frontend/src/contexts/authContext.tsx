import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback, // Importar useCallback
} from "react";
import * as api from "../api"; // Importar todas las funciones de la api
import type { Profile } from "../api"; // Importar el tipo Profile

// 1. Definir el tipo para el contexto
interface AuthContextType {
  isAuthenticated: boolean;
  user: Profile | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>; // <-- AÑADIR LA FUNCIÓN AL TIPO
}

// 2. Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Crear el componente Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  // 4. Implementar fetchProfile
  // Usamos useCallback para que la función no se recree en cada render
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setIsLoading(false);
      setUser(null);
      return;
    }

    try {
      setIsLoading(true); // Indicar que estamos cargando
      const profileData = await api.getProfile();
      setUser(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUser(null);
      // Si falla (ej. token expirado), limpiar tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Efecto para cargar el perfil al iniciar la app
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); // fetchProfile es ahora una dependencia

  // Implementar login
  const login = async (username: string, password: string) => {
    try {
      await api.login({ username, password });
      await fetchProfile(); // Usar fetchProfile para cargar el usuario después del login
    } catch (error) {
      console.error("Login failed:", error);
      // Relanzar el error para que el formulario lo maneje
      throw error;
    }
  };

  // Implementar logout
  const logout = () => {
    api.logout(); // Limpia localStorage
    setUser(null);
  };

  // 5. Pasar la función en el value
  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    fetchProfile, // <-- PASAR LA FUNCIÓN AL CONTEXTO
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 6. Crear el hook 'useAuth'
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}