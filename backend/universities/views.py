"""
Vistas (Views) de Django Rest Framework para la API.

Define los endpoints para la autenticación (Registro, Perfil)
y los ViewSets para los modelos principales (University, Review, Wishlist).
"""

# --- Importaciones ---

# 1. Importaciones de Django
from django.contrib.auth.models import User
from django.db.models import Avg, F, ExpressionWrapper, FloatField, Count, Case, When, Q
from django.db.models.functions import Coalesce

# 2. Importaciones de Terceros (DRF, Django-Filters)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny, IsAuthenticated

# 3. Importaciones locales (Modelos, Serializers, Filtros)
from .models import University, Review, Profile, Wishlist
from .serializers import (
    UniversitySerializer,
    ReviewSerializer,
    ProfileSerializer,
    RegisterSerializer,
    WishlistSerializer
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
            raise PermissionDenied("El perfil no existe para el usuario autenticado.")


# --- Vistas de Modelos (ViewSets) ---

class UniversityViewSet(viewsets.ModelViewSet):
    """
    Endpoint: /api/universities/
    Permite operaciones CRUD sobre el modelo University.
    Incluye anotaciones para conteo de reviews y ratings promedio.
    """
    serializer_class = UniversitySerializer
    
    permission_classes = [AllowAny]

    # Configuración de Filtros y Ordenación
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = UniversityFilter
    ordering_fields = [
        'qs_rating_top',
        'visits_count',
        'overall_avg_rating',
        'review_count'
    ]
    ordering = ['qs_rating_top']  # Orden por defecto

    def get_permissions(self):
        """Define permisos más estrictos para acciones de escritura."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Solo los Admins pueden modificar universidades
            return [IsAdminUser()]
        # Para 'list', 'retrieve' y acciones personalizadas, se usa 'AllowAny'
        return super().get_permissions()

    def get_queryset(self):
        """
        Sobrescribe el queryset base para incluir anotaciones y prefetching.
        
        NOTA: El cálculo 'overall_avg_rating' se replica aquí (en lugar de
        usar la @property del modelo) para permitir que la base de datos
        ordene y filtre por este valor calculado.
        """
        queryset = University.objects.all()

        # Optimización de base de datos
        queryset = queryset.prefetch_related(
            'photos',
            'reviews',
            'reviews__user',
            'reviews__user__profile'
        )

        # Anotación de conteo y promedios brutos
        queryset = queryset.annotate(
            review_count=Count('reviews'),
            avg_social_raw=Avg('reviews__social_rating'),
            avg_academic_raw=Avg('reviews__academic_rating'),
            avg_place_raw=Avg('reviews__place_rating')
        )

        # Cálculo del numerador (suma de promedios, ignorando nulos)
        numerator = ExpressionWrapper(
            Coalesce(F('avg_social_raw'), 0.0) +
            Coalesce(F('avg_academic_raw'), 0.0) +
            Coalesce(F('avg_place_raw'), 0.0),
            output_field=FloatField()
        )

        # Cálculo del denominador (conteo de promedios no nulos)
        denominator = ExpressionWrapper(
            Case(When(avg_social_raw__isnull=False, then=1), default=0) +
            Case(When(avg_academic_raw__isnull=False, then=1), default=0) +
            Case(When(avg_place_raw__isnull=False, then=1), default=0),
            output_field=FloatField()
        )

        # Cálculo del promedio final, manejando la división por cero
        queryset = queryset.annotate(
            # Guardamos los valores Coalesce para el serializer
            avg_social=Coalesce(F('avg_social_raw'), 0.0),
            avg_academic=Coalesce(F('avg_academic_raw'), 0.0),
            avg_place=Coalesce(F('avg_place_raw'), 0.0),

            # Hacemos la división final
            overall_avg_rating=Case(
                # Si el denominador es 0 (sin reviews), el promedio es None
                When(denominator=0, then=None),
                # Si no, calculamos (Numerador / Denominador)
                default=(numerator / denominator),
                output_field=FloatField()
            )
        )

        return queryset

    def retrieve(self, request, *args, **kwargs):
        """
        Sobrescribe 'retrieve' para incrementar el contador de visitas
        cada vez que se consulta el detalle de una universidad.
        """
        instance = self.get_object()
        
        # Usar F() para una actualización atómica (thread-safe)
        instance.visits_count = F('visits_count') + 1
        instance.save(update_fields=['visits_count'])
        
        # Refrescar la instancia para que el serializer obtenga el valor actualizado
        instance.refresh_from_db()

        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='top-reviews')
    def top_reviews(self, request):
        """
        Endpoint: GET /api/universities/top-reviews/
        Retorna las universidades con más reviews, con filtros opcionales.
        Utiliza la paginación estándar de DRF (ej: ?page=1&page_size=10).
        
        Query params:
        - continent (str): Filtrar por continente.
        - country (str): Filtrar por país (case-insensitive).
        - min_rating (float): Filtrar por rating promedio mínimo.
        """
        queryset = self.get_queryset()

        # 1. Aplicar filtros opcionales
        continent = request.query_params.get('continent')
        if continent:
            queryset = queryset.filter(continent=continent)

        country = request.query_params.get('country')
        if country:
            queryset = queryset.filter(country__icontains=country)

        min_rating = request.query_params.get('min_rating')
        if min_rating:
            try:
                min_rating = float(min_rating)
                queryset = queryset.filter(overall_avg_rating__gte=min_rating)
            except (ValueError, TypeError):
                return Response(
                    {'error': 'min_rating debe ser un número válido.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 2. Aplicar la lógica de la acción (orden y filtro base)
        queryset = queryset.filter(review_count__gt=0).order_by('-review_count')

        # 3. Paginar el queryset resultante
        page = self.paginate_queryset(queryset)
        
        # 4. Devolver respuesta paginada
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # 5. Si no hay paginación, devolver todo
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='top-rated')
    def top_rated(self, request):
        """
        Endpoint: GET /api/universities/top-rated/
        Retorna las universidades mejor valoradas (con al menos 3 reviews).
        Utiliza la paginación estándar.
        """
        queryset = self.get_queryset()
        
        # 1. Aplicar la lógica de la acción
        queryset = queryset.filter(review_count__gte=3).order_by('-overall_avg_rating')

        # 2. Paginar el queryset resultante
        page = self.paginate_queryset(queryset)
        
        # 3. Si se está paginando, devolver la respuesta paginada
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # 4. Si no hay paginación, devolver todo
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='most-visited')
    def most_visited(self, request):
        """
        Endpoint: GET /api/universities/most-visited/
        Retorna las universidades más visitadas en el sitio.
        Utiliza la paginación estándar.
        """
        queryset = self.get_queryset()
        
        # 1. Aplicar la lógica de la acción
        queryset = queryset.order_by('-visits_count')

        # 2. Paginar el queryset resultante
        page = self.paginate_queryset(queryset)
        
        # 3. Devolver respuesta paginada
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # 4. Si no hay paginación
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    """
    Endpoint: /api/reviews/
    Permite CRUD sobre Reviews. Asigna automáticamente el usuario
    autenticado al crear una nueva review (perform_create).
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

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
        return Wishlist.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Asigna el usuario autenticado al crear un wishlist."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'], url_path='add')
    def add(self, request):
        """
        Endpoint: POST /api/wishlists/add/
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
        
        return Response({'message': 'Universidad añadida a la wishlist'})
    
    @action(detail=False, methods=['post'], url_path='remove')
    def remove(self, request):
        """
        Endpoint: POST /api/wishlists/remove/
        Elimina una universidad de la wishlist del usuario.
        Espera: {'university': <university_id>}
        """
        university_id = request.data.get('university')
        if not university_id:
            return Response({"error": "Falta id de la universidad"}, status=status.HTTP_400_BAD_REQUEST)
        
        wishlist = Wishlist.objects.filter(user=request.user, university_id=university_id).first()
        
        if not wishlist:
            return Response({"error": "La universidad no está en la wishlist"}, status=status.HTTP_400_BAD_REQUEST)
        
        wishlist.delete()
        return Response({'message': 'Universidad eliminada de la wishlist'})
