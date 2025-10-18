import django_filters
from .models import University 

class UniversityFilter(django_filters.FilterSet):
    # Filtro de Búsqueda por Nombre (icontains = contiene, case-insensitive)
    name = django_filters.CharFilter(lookup_expr='icontains')
    
    # Filtro por País (exact = igualdad)
    country = django_filters.CharFilter(lookup_expr='exact')
    
    # Filtro por Continente (icontains)
    # Asumo que 'continent' es un campo de texto en tu modelo University
    continent = django_filters.CharFilter(lookup_expr='icontains')

    # Filtro de Ranking QS (min_qs)
    # Busca universidades cuyo qs_rating_top sea menor o igual al valor enviado 
    # (es decir, un mejor ranking).
    min_qs = django_filters.NumberFilter(field_name='qs_rating_top', lookup_expr='lte') 

    # Filtros para el Promedio General de Notas (Overall Average Rating)
    # Permite al usuario buscar universidades con un promedio general MÍNIMO.
    min_overall_rating = django_filters.NumberFilter(
        field_name='overall_avg_rating', 
        lookup_expr='gte' # Mayor o igual que (Greater Than or Equal)
    )

    # Filtros para notas individuales (Mínimo requerido)
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
        model = University
        fields = ['name', 'country', 'continent', 'min_qs', 'min_overall_rating', 'min_social_rating', 'min_academic_rating', 'min_place_rating']