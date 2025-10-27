"""
Configuración de URL para la API de la aplicación.

Define las rutas para los ViewSets (Universities, Profiles, Reviews)
y las vistas personalizadas de autenticación (Register, Profile, JWT).
"""

# --- Importaciones ---

# 1. Importaciones de Django
from django.urls import path, include

# 2. Importaciones de terceros (DRF y SimpleJWT)
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

# 3. Importaciones locales (Vistas de esta aplicación)
from .views import (
    UniversityViewSet,
    ProfileViewSet,
    ReviewViewSet,
    RegisterView,
    ProfileView
)

# --- Configuración del Router ---

# DefaultRouter crea automáticamente las rutas estándar para ViewSets
# y la vista raíz de la API.
router = DefaultRouter()

router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'reviews', ReviewViewSet, basename='review')


# --- Patrones de URL Principales ---

# Estas rutas generalmente se incluyen bajo un prefijo (ej: /api/)
# en el archivo urls.py principal del proyecto (src/urls.py).
urlpatterns = [
    # 1. Rutas generadas por el Router
    # (ej: /universities/, /reviews/, /profiles/)
    path('', include(router.urls)),
    
    # 2. Rutas de autenticación personalizadas
    # (ej: /register/, /profile/)
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),

    # 3. Rutas de autenticación JWT (Token)
    # (ej: /token/, /token/refresh/)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
