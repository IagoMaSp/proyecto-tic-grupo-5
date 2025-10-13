from django.shortcuts import render
from rest_framework import viewsets
from .models import University, Review, Profile
from .serializers import UniversitySerializer, ReviewSerializer, ProfileSerializer

# Create your views here.
class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer

    def get_queryset(self):
        queryset = University.objects.all()

        country = self.request.query_params.get('country')
        min_qs = self.request.query_params.get('min_qs')
        name = self.request.query_params.get('name')
        continent = self.request.query_params.get('continent')

        if country:
            queryset = queryset.filter(country=country)

        if min_qs:
            queryset = queryset.filter(qs_ranking__gte=int(min_qs))

        if name:
            queryset = queryset.filter(name__icontains=name)

        if continent:
            queryset = queryset.filter(continent__icontains=continent) 

        return queryset
        


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ProfileViewSet(viewsets.ModelViewSet()):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer