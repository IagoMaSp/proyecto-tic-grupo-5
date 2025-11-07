from django.contrib import admin
from .models import University, PhotosUniversity

# Registramos el modelo University (buena práctica)
@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'continent', 'qs_rating_top')
    list_filter = ('continent', 'country')
    search_fields = ('name',)

# Registramos el modelo de Fotos
@admin.register(PhotosUniversity)
class PhotosUniversityAdmin(admin.ModelAdmin):
    list_display = ('university', 'photo')
    list_filter = ('university',)
    search_fields = ('university__name',)
