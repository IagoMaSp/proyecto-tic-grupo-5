from django.shortcuts import render
from django.db.models import Avg, F, ExpressionWrapper, FloatField, Count
from rest_framework import viewsets, filters, generics, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action

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
from rest_framework.exceptions import PermissionDenied


# Vista de Registro (Sign Up) - POST /api/register/
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    # Permitir a cualquiera acceder a esta vista para poder registrarse
    permission_classes = (permissions.AllowAny,) 
    serializer_class = RegisterSerializer

# Vista para ver y actualizar el perfil del usuario autenticado - GET/PUT /api/profile/
class ProfileView(generics.RetrieveUpdateAPIView):
    # Solo usuarios autenticados (con Token JWT válido) pueden acceder
    permission_classes = (permissions.IsAuthenticated,) 
    serializer_class = ProfileSerializer

    # Asegura que solo se pueda acceder al perfil del usuario logueado
    def get_object(self):
        # Devuelve el objeto Profile relacionado al usuario actual de la petición
        try:
            return Profile.objects.get(user=self.request.user)
        except Profile.DoesNotExist:
            raise PermissionDenied("El perfil no existe para el usuario autenticado.")


class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter] 
    filterset_class = UniversityFilter

    ordering_fields = ['qs_rating_top', 'visits_count', 'overall_avg_rating', 'reviews_count'] 
    ordering = ['qs_rating_top'] 
    
    def get_queryset(self):
        queryset = super().get_queryset()

        # CÁLCULO DE PROMEDIOS (ANOTACIÓN)
        queryset = queryset.annotate(
            reviews_count = Count('reviews'),
            avg_social=Avg('review__social_rating'),
            avg_academic=Avg('review__academic_rating'),
            avg_place=Avg('review__place_rating')
        ).annotate(
            overall_avg_rating=ExpressionWrapper(
                (F('avg_social') + F('avg_academic') + F('avg_place')) / 3.0,
                output_field=FloatField()
            )
        )
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        # Incremento del contador de visitas (visits_count)
        instance = self.get_object()
        instance.visits_count += 1 
        instance.save()
        
        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def top_reviews(self, request):
        query_set = self.get_queryset()

        top_universities = query_set.order_by('-reviews_count')[:10]

        serializer = self.get_serializer(top_universities, many=True)  
        return Response(serializer.data)
class ReviewViewSet(viewsets.ModelViewSet):
    # Solo usuarios autenticados pueden crear/modificar reseñas
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    # Sobrescribir perform_create para asignar el usuario automáticamente
    def perform_create(self, serializer):
        # Antes de guardar, asigna el usuario autenticado al campo 'user' de la reseña
        serializer.save(user=self.request.user)
    

class ProfileViewSet(viewsets.ModelViewSet):
    # Limitar el acceso a solo lectura para listar perfiles
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    
    # Sobrescribir queryset para que los usuarios normales solo vean su propio perfil
    # Si dejas la lista abierta, la gente podrá ver todas las fotos de perfil.
    def get_queryset(self):
        if self.request.user.is_authenticated:
            # Los usuarios solo ven su propio perfil
            return Profile.objects.filter(user=self.request.user)
        return Profile.objects.none() # Anónimo no ve nada

    # Desactivar la creación a través del ViewSet (el registro maneja la creación)
    def create(self, request, *args, **kwargs):
        return Response({"detail": "La creación de perfiles se realiza a través del endpoint de registro (/api/register/)."}, status=403)

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

