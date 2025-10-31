"""
Vistas (Views) de Django Rest Framework para la API.

Define los endpoints para la autenticación (Registro, Perfil)
y los ViewSets para los modelos principales (University, Review, Wishlist).

Organizado para máxima legibilidad, mantenibilidad y rendimiento.
"""

# --- Importaciones ---

# 1. Importaciones de Django
from django.contrib.auth.models import User
from django.db.models import Avg, F, ExpressionWrapper, FloatField, Count
from django.db.models.functions import Coalesce

# 2. Importaciones de Terceros (DRF, Django-Filters)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, generics, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny, IsAuthenticated
)
from rest_framework.response import Response

# 3. Importaciones locales (Modelos, Serializers, Filtros)
from .models import University, Review, Profile, Wishlist, Faculty
from .serializers import (
    UniversitySerializer,
    ReviewSerializer,
    ProfileSerializer,
    RegisterSerializer,
    WishlistSerializer,
    UniversityListSerializer,
    UniversityDetailSerializer  # REFACTOR: Importación añadida
) 
from .filters import UniversityFilter


# --- Vistas de Autenticación y Perfil (Endpoints Específicos) ---

class RegisterView(generics.CreateAPIView):
    """
    Endpoint: POST /api/register/
    Permite el registro (creación) de nuevos usuarios.
    Accesible por cualquier usuario (AllowAny).
    """
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint: GET /api/profile/, PUT /api/profile/, PATCH /api/profile/
    Permite a un usuario autenticado ver y actualizar su propio perfil.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = ProfileSerializer

    def get_object(self):
        """Asegura que solo se devuelva el perfil del usuario logueado."""
        try:
            # Devuelve el objeto Profile relacionado al usuario actual
            return Profile.objects.get(user=self.request.user)
        except Profile.DoesNotExist:
            # REFACTOR: Usar 404 es más estándar, pero PermissionDenied
            # también es aceptable si la lógica es 'no deberías estar aquí'.
            # Mantenemos PermissionDenied por consistencia con el original.
            raise PermissionDenied("El perfil no existe para el usuario autenticado.")


# --- Vistas de Modelos (ViewSets) ---

class UniversityViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operaciones CRUD sobre universidades.
    
    Endpoints:
    - GET    /api/universities/          → Listar con paginación
    - POST   /api/universities/          → Crear (solo admin)
    - GET    /api/universities/{id}/     → Detalle (auto-incrementa visitas)
    - PUT    /api/universities/{id}/     → Actualizar completo (solo admin)
    - PATCH  /api/universities/{id}/     → Actualizar parcial (solo admin)
    - DELETE /api/universities/{id}/     → Eliminar (solo admin)
    
    Acciones custom:
    - GET /api/universities/top-rated/       → Top por rating (min 3 reviews)
    - GET /api/universities/most-visited/    → Más visitadas
    - GET /api/universities/{id}/full-detail/ → Detalle + reviews + stats
    - GET /api/universities/by-continent/    → Filtrar por continente
    - POST /api/universities/{id}/increment-visits/ → Incrementar visitas manualmente
    """
    
    # --- Configuración Base ---
    permission_classes = [AllowAny]
    
    # --- Configuración de Filtros y Búsqueda ---
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = UniversityFilter
    search_fields = ['name', 'country']
    ordering_fields = [
        'qs_rating_top',
        'visits_count',
        'overall_avg_rating',
        'review_count',
        'name'
    ]
    ordering = ['qs_rating_top']  # Orden por defecto
    
    # ==========================================
    # === MÉTODOS PRINCIPALES DE VIEWSET     ===
    # ==========================================
    
    def get_serializer_class(self):
        """
        Retorna el serializer apropiado según la acción:
        - list: Serializer ligero (solo campos esenciales)
        - retrieve/create/update: Serializer completo
        """
        if self.action == 'list':
            return UniversityListSerializer
        
        # REFACTOR: Asegurar que full_detail use su serializer específico
        if self.action == 'full_detail':
            return UniversityDetailSerializer

        return UniversitySerializer
    
    def get_permissions(self):
        """
        Define permisos dinámicamente:
        - Lectura (list, retrieve, acciones custom): Todos
        - Escritura (create, update, delete): Solo admins
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    def get_queryset(self):
        """
        Retorna el queryset base con todas las optimizaciones y anotaciones.
        Usado automáticamente por list(), retrieve(), etc.
        """
        return self._get_annotated_queryset()
    
    # ==========================================
    # === MÉTODOS DE VIEWSET SOBREESCRITOS   ===
    # ==========================================

    def retrieve(self, request, *args, **kwargs):
        """
        Override del método retrieve para auto-incrementar visitas.
        
        GET /api/universities/{id}/ automáticamente incrementa el contador.
        """
        # Obtener la universidad
        instance = self.get_object()
        
        # Incrementar visitas (F() evita race conditions)
        University.objects.filter(pk=instance.pk).update(
            visits_count=F('visits_count') + 1
        )
        
        # Recargar instancia con contador actualizado para la respuesta
        instance.refresh_from_db()
        
        # Serializar y retornar
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def list(self, request, *args, **kwargs):
        """
        Override opcional para añadir metadata adicional a la respuesta.
        
        GET /api/universities/ retorna además:
        - Cantidad total de universidades (filtradas)
        - Cantidad de países únicos (filtrados)
        - Promedio general de QS ranking (filtrado)
        """
        # Obtener queryset filtrado (pero no paginado)
        queryset = self.filter_queryset(self.get_queryset())
        
        # Obtener respuesta paginada estándar
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
        else:
            serializer = self.get_serializer(queryset, many=True)
            response = Response(serializer.data)

        # Añadir metadata (basada en el queryset ya filtrado)
        # Nota: Esto ejecuta queries adicionales para la metadata.
        stats = queryset.aggregate(
            avg_qs=Avg('qs_rating_top'),
            total_countries=Count('country', distinct=True),
            total_continents=Count('continent', distinct=True)
        )
        
        response.data['metadata'] = {
            'total_universities': self.paginator.count if self.paginator else queryset.count(),
            'unique_countries': stats['total_countries'],
            'unique_continents': stats['total_continents'],
            'avg_qs_rating': stats['avg_qs'],
        }
        
        return response
    
    # ==========================================
    # === ACCIONES PERSONALIZADAS (@action)  ===
    # ==========================================
    
    @action(detail=False, methods=['get'], url_path='top-rated')
    def top_rated(self, request):
        """
        GET /api/universities/top-rated/
        
        Retorna universidades mejor valoradas (mínimo 3 reviews).
        Ordenadas de mayor a menor rating promedio.
        
        Query params opcionales (ej: ?page=1&page_size=10)
        """
        # 1. Obtener queryset base (con anotaciones)
        queryset = self._get_annotated_queryset()
        
        # 2. Filtrar y ordenar
        queryset = queryset.filter(
            review_count__gte=3
        ).order_by('-overall_avg_rating')
        
        # 3. Aplicar filtros adicionales (ej: ?country=España)
        queryset = self.filter_queryset(queryset)
        
        # 4. Paginar resultados y retornar
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='most-visited')
    def most_visited(self, request):
        """
        GET /api/universities/most-visited/
        
        Retorna universidades más visitadas.
        Query params opcionales (ej: ?limit=10)
        """
        # 1. Obtener queryset base
        queryset = self._get_annotated_queryset()
        
        # 2. Ordenar por visitas
        queryset = queryset.order_by('-visits_count')
        
        # 3. Aplicar filtros de URL
        queryset = self.filter_queryset(queryset)
        
        # 4. Límite opcional (ej: top 10)
        limit = request.query_params.get('limit')
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except (ValueError, TypeError):
                pass  # Ignorar límite inválido
        
        # 5. Paginar y serializar
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='full-detail')
    def full_detail(self, request, pk=None):
        """
        GET /api/universities/{id}/full-detail/
        
        Retorna una vista de detalle extendida que incluye:
        - Info de Universidad (con Serializer de detalle)
        - Lista completa de reviews
        - Estadísticas de reviews (agregadas)
        """
        # 1. Obtener la universidad.
        # self.get_object() ya usa el _get_annotated_queryset(),
        # por lo que 'university' ya tiene los campos:
        # review_count, avg_social, avg_academic, avg_place
        university = self.get_object()
        
        # 2. Serializar la universidad con el serializer de detalle
        serializer = self.get_serializer(university, context={'request': request})
        
        # 3. Obtener reviews optimizadas
        reviews = university.reviews.select_related(
            'user', 'user__profile'
        ).order_by('-start_date')
        
        review_data = ReviewSerializer(
            reviews, 
            many=True,
            context={'request': request}
        ).data
        
        latest_review = reviews.first()
        latest_date = latest_review.start_date if latest_review else None
        
        # 4. Construir respuesta
        response_data = serializer.data
        
        # 5. REFACTOR (Optimización):
        # Usar los campos ya anotados en 'university' en lugar de
        # ejecutar un nuevo .aggregate() redundante.
        response_data['reviews'] = review_data
        response_data['review_stats'] = {
            'total': university.review_count,
            'avg_social': round(university.avg_social, 2),
            'avg_academic': round(university.avg_academic, 2),
            'avg_place': round(university.avg_place, 2),
            'latest_review_date': latest_date.isoformat() if latest_date else None
        }
        
        return Response(response_data)
    
    @action(detail=False, methods=['get'], url_path='by-continent')
    def by_continent(self, request):
        """
        GET /api/universities/by-continent/?continent=Europe
        Filtra universidades por continente (case-insensitive).
        """
        continent = request.query_params.get('continent')
        
        if not continent:
            return Response(
                {'error': 'Parámetro "continent" requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Filtrar (case-insensitive)
        queryset = self._get_annotated_queryset().filter(
            continent__iexact=continent
        )
        
        # Aplicar otros filtros de URL (ej: ?search=...)
        queryset = self.filter_queryset(queryset)
        
        # Paginar
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='increment-visits')
    def increment_visits(self, request, pk=None):
        """
        POST /api/universities/{id}/increment-visits/
        
        Incrementa el contador de visitas de una universidad manualmente.
        (Nota: 'retrieve' ya lo hace automáticamente)
        """
        university = self.get_object()
        
        # Incrementar contador (F() evita race conditions)
        university.visits_count = F('visits_count') + 1
        university.save(update_fields=['visits_count'])
        
        # Recargar para obtener el valor actualizado
        university.refresh_from_db()
        
        return Response({
            'id': university.id,
            'name': university.name,
            'visits_count': university.visits_count
        })
    
    # ==========================================
    # === MÉTODO PRIVADO DE OPTIMIZACIÓN     ===
    # ==========================================
    
    def _get_annotated_queryset(self):
        """
        Método privado que contiene la lógica de optimización y anotaciones.
        Reutilizable en todas las acciones que necesiten estos campos calculados.
        
        Optimizaciones:
        - prefetch_related: Carga relaciones en queries separadas (evita N+1)
        - annotate: Calcula campos agregados (COUNT, AVG)
        
        Campos anotados:
        - review_count: Cantidad de reviews
        - avg_social: Promedio de social_rating
        - avg_academic: Promedio de academic_rating
        - avg_place: Promedio de place_rating
        - overall_avg_rating: Promedio general de los 3 anteriores
        """
        # Definir promedios con Coalesce (evita None, retorna 0.0 si no hay reviews)
        avg_social = Coalesce(Avg('reviews__social_rating'), 0.0, output_field=FloatField())
        avg_academic = Coalesce(Avg('reviews__academic_rating'), 0.0, output_field=FloatField())
        avg_place = Coalesce(Avg('reviews__place_rating'), 0.0, output_field=FloatField())
        
        return University.objects.prefetch_related(
            'photos',              # Fotos de la universidad
            'reviews',             # Reviews relacionadas
            'reviews__user',       # Usuario de cada review
            'reviews__user__profile',  # Perfil del usuario
            'faculties'            # Facultades con convenio
        ).annotate(
            # Contadores
            review_count=Count('reviews', distinct=True),
            
            # Promedios individuales
            avg_social=avg_social,
            avg_academic=avg_academic,
            avg_place=avg_place
        ).annotate(
            # Promedio general (calculado a partir de los anteriores)
            overall_avg_rating=ExpressionWrapper(
                (F('avg_social') + F('avg_academic') + F('avg_place')) / 3.0,
                output_field=FloatField()
            )
        )


class ReviewViewSet(viewsets.ModelViewSet):
    """
    Endpoint: /api/reviews/
    Permite CRUD sobre Reviews. Asigna automáticamente el usuario
    autenticado al crear una nueva review (perform_create).
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Review.objects.all().select_related('user', 'user__profile', 'university')
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['university', 'user']
    ordering_fields = ['start_date', 'overall_rating', 'academic_rating']
    ordering = ['-start_date']

    def perform_create(self, serializer):
        """Asigna el usuario de la petición al crear la review."""
        serializer.save(user=self.request.user)


class WishlistViewSet(viewsets.ModelViewSet):
    """
    Endpoint: /api/wishlists/
    Permite a un usuario gestionar su propia lista de deseos.
    Incluye acciones personalizadas para añadir y eliminar por ID de universidad.
    """
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Devuelve la wishlist filtrada por el usuario autenticado."""
        # Optimizar la query incluyendo los detalles de la universidad
        return Wishlist.objects.filter(
            user=self.request.user
        ).select_related('university')
    
    def perform_create(self, serializer):
        """Asigna el usuario autenticado al crear un wishlist."""
        
        # Validar que la universidad no esté ya en la wishlist
        university = serializer.validated_data.get('university')
        if Wishlist.objects.filter(user=self.request.user, university=university).exists():
            raise serializer.ValidationError("Esta universidad ya está en tu wishlist.")
            
        serializer.save(user=self.request.user)
    
    # REFACTOR: Las acciones 'add' y 'remove' son redundantes
    # si se usa el 'perform_create' estándar y el 'destroy' (DELETE /api/wishlists/{id}/)
    # Sin embargo, si el frontend prefiere POST /api/wishlists/remove/
    # en lugar de DELETE, se mantienen. Las organizamos.
    
    @action(detail=False, methods=['post'], url_path='add-by-university')
    def add_by_university(self, request):
        """
        Endpoint: POST /api/wishlists/add-by-university/
        Añade una universidad a la wishlist del usuario.
        Espera: {'university': <university_id>}
        """
        university_id = request.data.get('university')
        if not university_id:
            return Response({"error": "Falta id de la universidad"}, status=status.HTTP_400_BAD_REQUEST)
        
        # get_or_create es atómico y previene duplicados
        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user, 
            university_id=university_id
        )
        
        if not created:
            return Response({"error": "La universidad ya está en la wishlist"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Serializar la entrada creada
        data = self.get_serializer(wishlist).data
        return Response(data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], url_path='remove-by-university')
    def remove_by_university(self, request):
        """
        Endpoint: POST /api/wishlists/remove-by-university/
        Elimina una universidad de la wishlist del usuario por ID de universidad.
        Espera: {'university': <university_id>}
        """
        university_id = request.data.get('university')
        if not university_id:
            return Response({"error": "Falta id de la universidad"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            wishlist_entry = Wishlist.objects.get(
                user=request.user, 
                university_id=university_id
            )
        except Wishlist.DoesNotExist:
            return Response({"error": "La universidad no está en la wishlist"}, status=status.HTTP_404_NOT_FOUND)
        
        wishlist_entry.delete()
        return Response(
            {'message': 'Universidad eliminada de la wishlist'},
            status=status.HTTP_204_NO_CONTENT
        )
