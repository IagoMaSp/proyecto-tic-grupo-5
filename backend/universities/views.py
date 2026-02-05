"""
Vistas (Views) de Django Rest Framework para la API.
Sin paginación: devuelve todas las universidades en una sola respuesta.
"""

# --- Importaciones ---
from django.contrib.auth.models import User
from django.db.models import Avg, F, ExpressionWrapper, FloatField, Count, Q, OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.shortcuts import get_object_or_404  

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


from .models import PhotosUniversity, University, Review, Profile, Wishlist
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
        
        # --- MODIFICADO ---
        # Filtramos las reviews que se muestran en el detalle de la universidad
        user = self.request.user
        if user.is_authenticated:
            # Usuarios logueados ven aprobadas + las suyas pendientes
            reviews_qs = Q(is_approved=True) | Q(user=user)
        else:
            # Anónimos solo ven aprobadas
            reviews_qs = Q(is_approved=True)

        reviews = university.reviews.filter(reviews_qs).select_related('user', 'user__profile').order_by('-start_date')
        # --- FIN MODIFICADO ---
        
        review_data = ReviewSerializer(reviews, many=True, context={'request': request}).data
        latest_review = reviews.filter(is_approved=True).first() # El "latest" debe ser uno aprobado
        latest_date = latest_review.start_date if latest_review else None

        data = serializer.data
        data['reviews'] = review_data
        
        # Recalcular review_count y promedios solo en base a las reviews APROBADAS
        approved_reviews_stats = university.reviews.filter(is_approved=True).aggregate(
            total=Count('id'),
            avg_social=Coalesce(Avg('social_rating'), 0.0, output_field=FloatField()),
            avg_academic=Coalesce(Avg('academic_rating'), 0.0, output_field=FloatField()),
            avg_place=Coalesce(Avg('place_rating'), 0.0, output_field=FloatField())
        )
        
        data['review_stats'] = {
            'total': approved_reviews_stats['total'],
            'avg_social': round(approved_reviews_stats['avg_social'], 2),
            'avg_academic': round(approved_reviews_stats['avg_academic'], 2),
            'avg_place': round(approved_reviews_stats['avg_place'], 2),
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
        # --- MODIFICADO ---
        # Los promedios y conteos ahora se basan SÓLO en reviews aprobadas.

        approved_reviews = Q(reviews__is_approved=True)
        
        avg_social = Coalesce(Avg('reviews__social_rating', filter=approved_reviews), 0.0, output_field=FloatField())
        avg_academic = Coalesce(Avg('reviews__academic_rating', filter=approved_reviews), 0.0, output_field=FloatField())
        avg_place = Coalesce(Avg('reviews__place_rating', filter=approved_reviews), 0.0, output_field=FloatField())
        
        main_photo_sq=PhotosUniversity.objects.filter(university=OuterRef('pk'), photo__isnull=False).order_by('id').values('photo')[:1]

        return University.objects.prefetch_related(
            'reviews', 'reviews__user', 'reviews__user__profile', 'faculties'
        ).annotate(
            review_count=Count('reviews', distinct=True, filter=approved_reviews), # Contar solo aprobadas
            avg_social=avg_social,
            avg_academic=avg_academic,
            avg_place=avg_place,
            main_photo=Subquery(main_photo_sq)
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
        # La anotación ya filtra por reviews aprobadas gracias a _get_annotated_queryset
        annotated_qs = self._get_annotated_queryset().order_by('-review_count')[:limit]
        serializer = self.get_serializer(annotated_qs, many=True)
        return Response(serializer.data)
        


# --- ReviewViewSet ---
class ReviewViewSet(viewsets.ModelViewSet):
    """CRUD para reviews."""
    permission_classes = [IsAuthenticatedOrReadOnly]
    # queryset = Review.objects.all().select_related('user', 'user__profile', 'university') # Queryset base se mueve a get_queryset
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['university', 'user']
    ordering_fields = ['start_date', 'overall_rating', 'academic_rating']
    ordering = ['-start_date']

    def get_queryset(self):
        """
        Filtra las reviews que se devuelven.
        - Usuarios anónimos: solo ven reviews aprobadas.
        - Usuarios autenticados: ven todas las reviews aprobadas Y sus propias reviews pendientes.
        """
        base_qs = Review.objects.all().select_related('user', 'user__profile', 'university')
        
        user = self.request.user
        
        if user.is_authenticated:
            # Muestra las aprobadas O las que son del propio usuario
            return base_qs.filter(Q(is_approved=True) | Q(user=user))
        
        # Muestra solo las aprobadas para anónimos
        return base_qs.filter(is_approved=True)

    def list(self, request, *args, **kwargs):
        """Lista sin paginación."""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        """
        Asigna el usuario autenticado.
        La review se creará con 'is_approved=False' por defecto (definido en el modelo).
        """
        serializer.save(user=self.request.user)

    # AÑADIDO: Acción para "Mis Reseñas"
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_reviews(self, request):
        """
        Retorna todas las reviews (aprobadas o pendientes) escritas por el usuario autenticado.
        Sin paginación.
        """
        # El queryset base (self.get_queryset()) ya no es necesario aquí, 
        # podemos filtrar directamente del modelo.
        reviews = Review.objects.filter(user=request.user).select_related(
            'user', 'user__profile', 'university'
        ).order_by('-id')
        
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


# --- WishlistViewSet ---
class WishlistViewSet(viewsets.ModelViewSet):
    """
    ViewSet para manejar la wishlist de usuarios.
    Solo usuarios autenticados pueden acceder.
    """
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retorna solo la wishlist del usuario autenticado."""
        return Wishlist.objects.filter(user=self.request.user).select_related('university')

    def perform_create(self, serializer):
        """Asigna automáticamente el usuario al crear una entrada."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='add-by-university')
    def add_by_university(self, request):
        """
        Agrega una universidad a la wishlist por su ID.
        Body: { "university": <id> }
        """
        try:
            university_id = request.data.get('university')
            
            if not university_id:
                return Response(
                    {'detail': 'Se requiere el ID de la universidad'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar que la universidad existe
            university = get_object_or_404(University, id=university_id)
            
            # Verificar si ya está en la wishlist
            if Wishlist.objects.filter(user=request.user, university=university).exists():
                return Response(
                    {'detail': 'Esta universidad ya está en tu wishlist'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear la entrada
            wishlist_item = Wishlist.objects.create(
                user=request.user,
                university=university
            )
            
            serializer = self.get_serializer(wishlist_item)
            print(f"[WishlistViewSet] ✅ Universidad {university.name} agregada a wishlist de {request.user.username}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            # Log del error para debugging
            print(f"[WishlistViewSet] ❌ Error en add_by_university: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': f'Error al agregar a wishlist: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['delete'], url_path='remove-by-university')
    def remove_by_university(self, request):
        """
        Elimina una universidad de la wishlist por su ID.
        Query param: ?university=<id>
        """
        try:
            # CAMBIO: Usar query params en lugar de body para DELETE
            university_id = request.query_params.get('university')
            
            if not university_id:
                return Response(
                    {'detail': 'Se requiere el ID de la universidad'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Buscar la entrada
            wishlist_item = Wishlist.objects.filter(
                user=request.user,
                university_id=university_id
            ).first()
            
            if not wishlist_item:
                return Response(
                    {'detail': 'Esta universidad no está en tu wishlist'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            university_name = wishlist_item.university.name
            wishlist_item.delete()
            
            print(f"[WishlistViewSet] ✅ Universidad {university_name} eliminada de wishlist de {request.user.username}")
            return Response(
                {'detail': 'Universidad eliminada de tu wishlist'},
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exception as e:
            # Log del error para debugging
            print(f"[WishlistViewSet] ❌ Error en remove_by_university: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': f'Error al eliminar de wishlist: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )