"""
Vistas (Views) de Django Rest Framework para la API.

Define los endpoints para la autenticación (Registro, Perfil)
y los ViewSets para los modelos principales (University, Review, Profile).
"""

# --- Importaciones ---

# 1. Importaciones de Django
from django.contrib.auth.models import User
from django.db.models import Avg, F, ExpressionWrapper, FloatField, Count

# 2. Importaciones de Terceros (DRF, Django-Filters)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from django.contrib.auth.models import User
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
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint: GET /api/profile/, PUT /api/profile/, PATCH /api/profile/
    Permite a un usuario autenticado ver y actualizar su propio perfil.
    """
    permission_classes = (permissions.IsAuthenticated,)
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

    def get_queryset(self):
        """
        Sobrescribe el queryset base para incluir anotaciones y prefetching.
        - prefetch_related: Optimiza la carga de relaciones (reviews, fotos).
        - annotate (review_count): Cuenta las reviews.
        - annotate (ratings): Calcula los promedios de ratings.
        - annotate (overall_avg_rating): Calcula el promedio general.
        """
        queryset = University.objects.all()

        # Optimización de base de datos
        queryset = queryset.prefetch_related(
            'photos',
            'reviews',
            'reviews__user',
            'reviews__user__profile'
        )

        # Anotaciones
        queryset = queryset.annotate(
            review_count=Count('reviews'),
            avg_social=Avg('reviews__social_rating'),
            avg_academic=Avg('reviews__academic_rating'),
            avg_place=Avg('reviews__place_rating')
        ).annotate(
            # Calcula el promedio general usando F() para campos anotados
            overall_avg_rating=ExpressionWrapper(
                (F('avg_social') + F('avg_academic') + F('avg_place')) / 3.0,
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
        
        # CORRECCIÓN: Usar F() para una actualización atómica (thread-safe)
        # y evitar condiciones de carrera (race conditions).
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
        
        Query params:
        - limit (int): Cantidad (default: 10, max: 50).
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

        # 2. Parsear límite (preservando la lógica original)
        limit = 10  # Default
        limit_param = request.query_params.get('limit', '10')
        try:
            limit = int(limit_param)
            if limit > 50:
                limit = 50
            if limit < 1:
                # Se preserva la lógica original: si es < 1, usa 10.
                limit = 10
        except ValueError:
            limit = 10  # Default si no es un número

        # 3. Filtrar y Ordenar
        queryset = queryset.filter(review_count__gt=0)
        top_universities = queryset.order_by('-review_count')[:limit]

        # 4. Serializar y retornar
        serializer = self.get_serializer(top_universities, many=True)

        return Response({
            'count': len(top_universities),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='top-rated')
    def top_rated(self, request):
        """
        Endpoint: GET /api/universities/top-rated/
        Retorna las universidades con mejor rating promedio (mín 3 reviews).
        """
        queryset = self.get_queryset()

        # CORRECCIÓN: Parseo de 'limit' robusto (anti-ValueError)
        limit = 10  # Default
        limit_param = request.query_params.get('limit', '10')
        try:
            limit = int(limit_param)
            if limit > 50:
                limit = 50
            if limit < 1:
                limit = 1  # Límite mínimo 1
        except ValueError:
            limit = 10  # Default en caso de error

        # Filtrar por confiabilidad (al menos 3 reviews) y ordenar
        queryset = queryset.filter(review_count__gte=3)
        top_universities = queryset.order_by('-overall_avg_rating')[:limit]

        serializer = self.get_serializer(top_universities, many=True)

        return Response({
            'count': len(top_universities),
            'results': serializer.data
        })

    @action(detail=False, methods=['get'], url_path='most-visited')
    def most_visited(self, request):
        """
        Endpoint: GET /api/universities/most-visited/
        Retorna las universidades más visitadas en el sitio.
        """
        queryset = self.get_queryset()

        # CORRECCIÓN: Parseo de 'limit' robusto (anti-ValueError)
        limit = 10  # Default
        limit_param = request.query_params.get('limit', '10')
        try:
            limit = int(limit_param)
            if limit > 50:
                limit = 50
            if limit < 1:
                limit = 1  # Límite mínimo 1
        except ValueError:
            limit = 10  # Default en caso de error

        most_visited = queryset.order_by('-visits_count')[:limit]

        serializer = self.get_serializer(most_visited, many=True)

        return Response({
            'count': len(most_visited),
            'results': serializer.data
        })


class ReviewViewSet(viewsets.ModelViewSet):
    """
    Endpoint: /api/reviews/
    Permite CRUD sobre Reviews. Asigna automáticamente el usuario
    autenticado al crear una nueva review (perform_create).
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def perform_create(self, serializer):
        """Asigna el usuario de la petición al crear la review."""
        serializer.save(user=self.request.user)


class ProfileViewSet(viewsets.ModelViewSet):
    """
    Endpoint: /api/profiles/
    Permite a los usuarios ver (GET) su propio perfil.
    Deshabilita la creación (POST), que se maneja en /api/register/.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = ProfileSerializer

    def get_queryset(self):
        """
        Filtra el queryset para que los usuarios autenticados
        solo vean su propio perfil. Los anónimos no ven ninguno.
        """
        if self.request.user.is_authenticated:
            return Profile.objects.filter(user=self.request.user)
        return Profile.objects.none()

    def create(self, request, *args, **kwargs):
               """Deshabilita la creación de perfiles vía este endpoint."""
        return Response(
            {"detail": "La creación de perfiles se realiza a través del endpoint de registro (/api/register/)."},
            status=status.HTTP_403_FORBIDDEN
        )

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        # returnear wishlist por usuario
        return Wishlist.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        # Asigna el usuario autenticado al crear un wishlist
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def add(self, request):
        university_id=request.data.get('university')
        if not university_id:
            return Response({"error":"Falta id de la unviersidad"},status=400)
        wishlist, created=Wishlist.objects.get_or_create(user=request.user,university_id=university_id)
        if not created:
            return Response({"error":"La universidad ya está en la wishlist"},status=400)
        return Response({'message':'Universidad añadida a la wishlist'})
    
    @action(detail=False, methods=['post'])
    def remove(self, request):
        unviersity_id=request.data.get('university')
        if not unviersity_id:
            return Response({"error":"Falta id de la unviersidad"},status=400)
        wishlist=Wishlist.objects.filter(user=request.user,university_id=unviersity_id).first()
        if not wishlist:
            return Response({"error":"La universidad no está en la wishlist"},status=400)
        wishlist.delete()
        return Response({'message':'Universidad eliminada de la wishlist'})

