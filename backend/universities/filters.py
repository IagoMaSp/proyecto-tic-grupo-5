"""
Definición de Filtros (django-filters) para la API.

Provee la clase UniversityFilter para filtrar el ViewSet de University
basado en parámetros de la URL.
"""

# --- Importaciones ---

# 1. Importaciones de terceros (django-filters)
import django_filters

# 2. Importaciones locales
from .models import University


# --- Definiciones de Filtros ---

class UniversityFilter(django_filters.FilterSet):
    """
    Filtro personalizado para el modelo University.
    
    Permite filtrar por nombre, país, continente y por rangos
    mínimos de ratings (QS, general y específicos).
    """
    
    # --- Filtros de Texto ---
    
    # Búsqueda por Nombre (case-insensitive)
    name = django_filters.CharFilter(lookup_expr='icontains')
    
    # Búsqueda por País (coincidencia exacta)
    country = django_filters.CharFilter(lookup_expr='exact')
    
    # Búsqueda por Continente (case-insensitive)
    continent = django_filters.CharFilter(lookup_expr='icontains')

    # --- CORRECCIÓN ---
    # Renombrado de 'faculties' a 'faculty' para que coincida con el
    # parámetro 'faculty' enviado desde el frontend (useUniversitySearch.ts).
    # El 'field_name' sigue apuntando al campo correcto en el modelo.
    faculty = django_filters.CharFilter(
        field_name='faculties__name',
        lookup_expr='iexact'  # Coincidencia exacta, case-insensitive
    )

    # --- Filtros Numéricos (Ratings) ---
    
    # Filtro de Ranking QS (mínimo)
    # Busca 'qs_rating_bottom' >= valor (mejor ranking)
    min_qs = django_filters.NumberFilter(
        field_name='qs_rating_bottom',
        lookup_expr='gte'  # Greater Than or Equal
    ) 

    # Filtro de Promedio General (mínimo)
    # Nota: 'overall_avg_rating' es un campo anotado en el ViewSet
    min_overall_rating = django_filters.NumberFilter(
        field_name='overall_avg_rating', 
        lookup_expr='gte'
    )

    # Filtros para notas individuales (mínimo)
    # Nota: Estos campos (avg_social, etc.) son anotados en el ViewSet
    min_social_rating = django_filters.NumberFilter(
        field_name='avg_social', 
        lookup_expr='gte'
    )
    min_academic_rating = django_filters.NumberFilter(
        field_name='avg_academic', 
        lookup_expr='gte'
    )
    min_place_rating = django_filters.NumberFilter(
        field_name='avg_place', 
        lookup_expr='gte'
    )

    class Meta:
        """Configuración interna del FilterSet."""
        model = University
        
        # REFACTOR: Lista de campos formateada para legibilidad
        # --- CORRECCIÓN ---
        # Actualizado de 'faculties' a 'faculty'
        fields = [
            'name',
            'country',
            'continent',
            'faculty',
            'min_qs',
            'min_overall_rating',
            'min_social_rating',
            'min_academic_rating',
            'min_place_rating'
        ]