"""
Configuración de URL (URLconf) para la API de la aplicación.

Define las rutas para los ViewSets (University, Review, Wishlist)
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
    ReviewViewSet,
    RegisterView,
    ProfileView,
    WishlistViewSet
)

# --- Configuración del Router ---

# DefaultRouter crea automáticamente las rutas estándar para ViewSets
# (list, create, retrieve, update, destroy) y la vista raíz de la API.
router = DefaultRouter()

router.register(r'universities', UniversityViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'wishlists', WishlistViewSet)
# NOTA: ProfileView se maneja como una vista estándar (no ViewSet) más abajo.


# --- Patrones de URL Principales ---

# Estas rutas generalmente se incluyen bajo un prefijo (ej: /api/)
# en el archivo urls.py principal del proyecto (src/urls.py).
urlpatterns = [
    # 1. Rutas generadas por el Router
    # (ej: /api/universities/, /api/reviews/, /api/wishlists/)
    path('', include(router.urls)),
    
    # 2. Rutas de autenticación personalizadas
    # (ej: /api/register/, /api/profile/)
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),

    # 3. Rutas de autenticación JWT (Token)
    # (ej: /api/token/, /api/token/refresh/)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
