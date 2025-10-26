from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UniversityViewSet, ProfileViewSet, ReviewViewSet, RegisterView, ProfileView

router = DefaultRouter()

router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'wishlists', ReviewViewSet, basename='wishlist')

urlpatterns = [
    # URLs generadas por el router (ej: /api/universities/, /api/profiles/, etc.)
    path('', include(router.urls)),
    
    # NUEVOS ENDPOINTS DE AUTENTICACIÓN
    # Accedidos como: /api/register/ y /api/profile/ (debido al path('api/', include(...)) en src/urls.py)
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),
]
