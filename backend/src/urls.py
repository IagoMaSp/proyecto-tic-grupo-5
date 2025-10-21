"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/',include('universities.urls'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),)
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,           # '/media/'
        document_root=settings.MEDIA_ROOT  # './backend/media/'
    )

### 🎨 **Estructura de URLs resultante**
'''
    /admin/                          → Panel de administración Django
    /admin/universities/university/  → CRUD de universidades en admin

    /api/universities/               → GET (list), POST (create)
    /api/universities/1/             → GET (retrieve), PUT/PATCH (update), DELETE
    /api/universities/1/reviews/     → GET reviews de esa universidad (custom action)
    /api/universities/top_reviews/   → GET top 10 con más reviews (custom action)

    /api/reviews/                    → GET (list), POST (create)
    /api/reviews/1/                  → GET, PUT/PATCH, DELETE

    /api/profiles/                   → GET (list solo del user autenticado)
    /api/profiles/1/                 → GET, PUT/PATCH

    /api/register/                   → POST (crear cuenta)
    /api/profile/                    → GET/PUT (perfil del user actual)

    /media/profile_photos/user1.jpg  → Foto de perfil (solo dev)
    /media/university_photos/x.jpg   → Foto de universidad
'''