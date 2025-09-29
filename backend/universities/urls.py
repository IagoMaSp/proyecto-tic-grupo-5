from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UniversityViewSet, ProfileViewSet, ReviewViewSet

router = DefaultRouter()

router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]