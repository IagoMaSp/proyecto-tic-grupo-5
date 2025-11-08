"""
Vistas (Views) de Django Rest Framework para la API.
Sin paginación: devuelve todas las universidades en una sola respuesta.
"""

# --- Importaciones ---
from django.contrib.auth.models import User
from django.db.models import Avg, F, ExpressionWrapper, FloatField, Count
from django.db.models.functions import Coalesce

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters, generics, status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly, IsAdminUser, AllowAny, IsAuthenticated
)
from rest_framework.response import Response
from rest_framework import serializers
# AÑADIDO: Parsers para subida de archivos
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


from .models import University, Review, Profile, Wishlist
from .serializers import (
    UniversitySerializer,
    ReviewSerializer,
    UserSerializer,
    RegisterSerializer,
    WishlistSerializer,
    UniversityListSerializer,
    UniversityDetailSerializer
)
from .filters import UniversityFilter


# --- Autenticación y Perfil ---
class RegisterView(generics.CreateAPIView):
    """Registro de nuevos usuarios."""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Perfil del usuario autenticado.
    IMPORTANTE: Usa UserSerializer (no ProfileSerializer) para que funcione con el frontend.
    """
    queryset = User.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer
    # AÑADIDO: Parsers para subida de foto de perfil
    parser_classes = [MultiPartParser, FormParser, JSONParser]


    def get_object(self):
        """Devuelve el usuario logueado."""
        return self.request.user

    def get_serializer_context(self):
        """Pasa el request al contexto para URLs absolutas."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


# --- UniversityViewSet ---
class UniversityViewSet(viewsets.ModelViewSet):
    """
    ViewSet para universidades.
    SIN PAGINACIÓN: Devuelve todas las universidades en una sola respuesta.
    """
    queryset = University.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_class = UniversityFilter
    search_fields = ['name', 'country']
    ordering_fields = ['qs_rating_top', 'visits_count', 'overall_avg_rating', 'review_count', 'name']
    ordering = ['qs_rating_top']

    def get_serializer_class(self):
        """Serializer según la acción."""
        if self.action == 'list':
            return UniversityListSerializer
        if self.action == 'full_detail':
            return UniversityDetailSerializer
        return UniversitySerializer

    def get_permissions(self):
        """Solo admins pueden crear/editar/eliminar."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()

    def get_queryset(self):
        """Queryset con anotaciones."""
        return self._get_annotated_queryset()

    def retrieve(self, request, *args, **kwargs):
        """Incrementa visitas al ver detalle."""
        instance = self.get_object()
        University.objects.filter(pk=instance.pk).update(visits_count=F('visits_count') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        """
        Lista SIN paginación.
        Devuelve TODAS las universidades con metadata.
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Metadata
        stats = queryset.aggregate(
            avg_qs=Avg('qs_rating_top'),
            total_countries=Count('country', distinct=True),
            total_continents=Count('continent', distinct=True)
        )
        
        return Response({
            'results': serializer.data,
            'metadata': {
                'total_universities': queryset.count(),
                'unique_countries': stats['total_countries'],
                'unique_continents': stats['total_continents'],
                'avg_qs_rating': stats['avg_qs'],
        }
})

    # --- Custom actions ---
    @action(detail=False, methods=['get'], url_path='top-rated')
    def top_rated(self, request):
        """Top por rating (mínimo 3 reviews)."""
        queryset = self._get_annotated_queryset().filter(review_count__gte=3).order_by('-overall_avg_rating')
        queryset = self.filter_queryset(queryset)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='most-visited')
    def most_visited(self, request):
        """Más visitadas."""
        queryset = self._get_annotated_queryset().order_by('-visits_count')
        queryset = self.filter_queryset(queryset)
        limit = request.query_params.get('limit')
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except (ValueError, TypeError):
                pass
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='full-detail')
    def full_detail(self, request, pk=None):
        """Detalle completo con reviews."""
        university = self.get_object()
        serializer = self.get_serializer(university, context={'request': request})
        reviews = university.reviews.select_related('user', 'user__profile').order_by('-start_date')
        review_data = ReviewSerializer(reviews, many=True, context={'request': request}).data
        latest_review = reviews.first()
        latest_date = latest_review.start_date if latest_review else None

        data = serializer.data
        data['reviews'] = review_data
        data['review_stats'] = {
            'total': university.review_count,
            'avg_social': round(university.avg_social, 2),
            'avg_academic': round(university.avg_academic, 2),
            'avg_place': round(university.avg_place, 2),
            'latest_review_date': latest_date.isoformat() if latest_date else None
        }
        return Response(data)

    @action(detail=False, methods=['get'], url_path='by-continent')
    def by_continent(self, request):
        """Filtrar por continente."""
        continent = request.query_params.get('continent')
        if not continent:
            return Response({'error': 'Parámetro "continent" requerido'}, status=status.HTTP_400_BAD_REQUEST)
        queryset = self._get_annotated_queryset().filter(continent__iexact=continent)
        queryset = self.filter_queryset(queryset)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='increment-visits')
    def increment_visits(self, request, pk=None):
        """Incrementar visitas manualmente."""
        university = self.get_object()
        university.visits_count = F('visits_count') + 1
        university.save(update_fields=['visits_count'])
        university.refresh_from_db()
        return Response({
            'id': university.id,
            'name': university.name,
            'visits_count': university.visits_count
        })

    @action(detail=False, methods=['get'], url_path='countries')
    def countries(self, request):
        """Lista de países con convenios."""
        countries = list(University.objects.values_list('country', flat=True).distinct().order_by('country'))
        return Response({'countries': countries})

    def _get_annotated_queryset(self):
        """Queryset optimizado con anotaciones."""
        avg_social = Coalesce(Avg('reviews__social_rating'), 0.0, output_field=FloatField())
        avg_academic = Coalesce(Avg('reviews__academic_rating'), 0.0, output_field=FloatField())
        avg_place = Coalesce(Avg('reviews__place_rating'), 0.0, output_field=FloatField())

        return University.objects.prefetch_related(
            'photos', 'reviews', 'reviews__user', 'reviews__user__profile', 'faculties'
        ).annotate(
            review_count=Count('reviews', distinct=True),
            avg_social=avg_social,
            avg_academic=avg_academic,
            avg_place=avg_place
        ).annotate(
            overall_avg_rating=ExpressionWrapper(
                (F('avg_social') + F('avg_academic') + F('avg_place')) / 3.0,
                output_field=FloatField()
            )
        )
    @action(detail=False, methods=['get'], url_path='most-reviewed')
    def most_reviewed(self, request):
        try:
            limit = int(request.query_params.get('limit', 10))
        except ValueError:
            limit = 10
        annotated_qs = University.objects.annotate(review_count=Count('reviews')).order_by('-review_count')[:limit]
        serializer = self.get_serializer(annotated_qs, many=True)
        return Response(serializer.data)
        


# --- ReviewViewSet ---
class ReviewViewSet(viewsets.ModelViewSet):
    """CRUD para reviews."""
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Review.objects.all().select_related('user', 'user__profile', 'university')
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['university', 'user']
    ordering_fields = ['start_date', 'overall_rating', 'academic_rating']
    ordering = ['-start_date']

    def list(self, request, *args, **kwargs):
        """Lista sin paginación."""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """Asigna el usuario autenticado."""
        serializer.save(user=self.request.user)

    # AÑADIDO: Acción para "Mis Reseñas"
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_reviews(self, request):
        """
        Retorna todas las reviews escritas por el usuario autenticado.
        Sin paginación.
        """
        reviews = self.get_queryset().filter(user=request.user).order_by('-id')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


# --- WishlistViewSet ---
class WishlistViewSet(viewsets.ModelViewSet):
    """CRUD para wishlist."""
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Solo wishlist del usuario autenticado."""
        return Wishlist.objects.filter(user=self.request.user).select_related('university')
    
    def perform_create(self, serializer):
        """Crear entrada en wishlist."""
        university = serializer.validated_data.get('university')
        if Wishlist.objects.filter(user=self.request.user, university=university).exists():
            raise serializers.ValidationError("Esta universidad ya está en tu wishlist.")
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='university-ids')
    def get_university_ids(self, request):
        """
        Obtiene solo los IDs de las universidades en la wishlist del usuario.
        Más eficiente que traer toda la información.
        """
        university_ids = Wishlist.objects.filter(
            user=request.user
        ).values_list('university_id', flat=True)
        
        return Response({
            'wishlist': list(university_ids)
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='add-by-university')
    def add_by_university(self, request):
        """Añadir universidad a wishlist."""
        university_id = request.data.get('university')
        if not university_id:
            return Response(
                {"error": "Falta id de la universidad"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user, 
            university_id=university_id
        )
        
        if not created:
            # No es error, simplemente ya existe
            return Response(
                {"message": "La universidad ya está en la wishlist"}, 
                status=status.HTTP_200_OK
            )
        
        data = self.get_serializer(wishlist).data
        return Response(data, status=status.HTTP_201_CREATED)
    

    @action(detail=False, methods=['post'], url_path='remove-by-university')
    def remove_by_university(self, request):
        """Eliminar universidad de wishlist."""
        university_id = request.data.get('university')
        if not university_id:
            return Response(
                {"error": "Falta id de la universidad"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            wishlist_entry = Wishlist.objects.get(
                user=self.request.user, 
                university_id=university_id
            )
        except Wishlist.DoesNotExist:
            return Response(
                {"error": "La universidad no está en la wishlist"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        wishlist_entry.delete()
        return Response(
            {'message': 'Universidad eliminada de la wishlist'}, 
            status=status.HTTP_204_NO_CONTENT
        )