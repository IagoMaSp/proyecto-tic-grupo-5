from django.contrib import admin
from .models import University, PhotosUniversity

# Registramos el modelo University (buena práctica)
@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'continent', 'qs_rating_top')
    list_filter = ('continent', 'country','status')
    search_fields = ('name','country')

# Registramos el modelo de Fotos
@admin.register(PhotosUniversity)
class PhotosUniversityAdmin(admin.ModelAdmin):
    list_display = ('get_university_name', 'photo', 'university_name_linker')
    list_filter = ('university',)
    search_fields = ('university__name','university_name_linker')
    def get_university_name(self, obj):
        return obj.university.name if obj.university else "Sin Universidad"
    get_university_name.short_description = 'Universidad (Enlazada)'
    def save_model(self, request, obj, form, change):
        # Si la foto está enlazada a una U, guarda el nombre
        if obj.university:
            obj.university_name_linker=obj.university.name
        
        # Si la foto está huérfana pero tiene un linker
        # y encontramos una U con ese nombre, la re-enlazamos.
        elif obj.university_name_linker:
             try:
                university = University.objects.get(name=obj.university_name_linker)
                obj.university = university
             except University.DoesNotExist:
                 pass # Sigue huérfana si no la encuentra
        
        super().save_model(request, obj, form, change)
        

