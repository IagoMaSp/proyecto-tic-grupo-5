from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Importar vistas de Simple JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Importar tus vistas de registro y perfil DESDE LA APP
from universities.views import RegisterView, ProfileView

urlpatterns = [
    path('admin/', admin.site.urls),

    # --- Endpoints de Autenticación (en el archivo principal) ---
    # Estas rutas, más específicas, DEBEN IR PRIMERO.
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='auth_register'),
    path('api/profile/', ProfileView.as_view(), name='auth_profile'),

    # --- Endpoints de la App (Universidades, Reviews, etc.) ---
    # Esta ruta general 'api/' va AL FINAL.
    # Manejará 'api/universities/', 'api/reviews/', etc.
    path('api/', include('universities.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)