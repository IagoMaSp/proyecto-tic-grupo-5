from django.shortcuts import render
from rest_framework import viewsets
from .models import University, Review, Profile
from .serializers import UniversitySerializer, ReviewSerializer, ProfileSerializer

# Create your views here.
class UniversityViewSet(viewsets.ModelViewSet):
    queryset = University.objects.all()
    serializer_class = UniversitySerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ProfileViewSet(viewsets.ModelViewSet()):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer