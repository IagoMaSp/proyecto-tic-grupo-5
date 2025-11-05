from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Importa SÓLO los ViewSets
from .views import UniversityViewSet, ReviewViewSet, WishlistViewSet

# El router se encarga de crear las rutas para los ViewSets
# (ej: /api/universities/, /api/reviews/, etc.)
router = DefaultRouter()
router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'wishlists', WishlistViewSet, basename='wishlist')

# Las urlpatterns son solo las rutas generadas por el router.
urlpatterns = [
    path('', include(router.urls)),
]

# NO AGREGUES NADA MÁS AQUÍ (ni admin, ni auth, ni static)