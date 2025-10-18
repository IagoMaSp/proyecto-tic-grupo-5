from django.shortcuts import render
from django.db.models import Avg, F, ExpressionWrapper, FloatField
from rest_framework import viewsets
from .models import University, Review, Profile
from .serializers import UniversitySerializer, ReviewSerializer, ProfileSerializer
from .filters import UniversityFilter
from django_filters.rest_framework import DjangoFilterBackend

# Create your views here.
class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer

    filter_backends = [DjangoFilterBackend] 
    filterset_class = UniversityFilter

    # Añade 'overall_avg_rating' para que el frontend pueda ordenar por este campo
    ordering_fields = ['qs_rating_top', 'views', 'overall_avg_rating'] 
    ordering = ['qs_rating_top'] 
    
    # Sobrescribimos el get_queryset para añadir la lógica de promedio
    def get_queryset(self):
        queryset = self.queryset 

        # Usamos 'review' asumiendo que es el related_name o el nombre del modelo en minúscula del ForeignKey
        queryset = queryset.annotate(
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
        # Obtener el objeto de la universidad antes de responder
        instance = self.get_object()
        
        # Aumentar el contador de vistas en 1
        instance.views += 1
        instance.save()
        
        # Llamar al método original para continuar con la respuesta de la API
        return super().retrieve(request, *args, **kwargs)



class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ProfileViewSet(viewsets.ModelViewSet()):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer