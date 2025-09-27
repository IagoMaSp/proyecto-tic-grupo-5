from rest_framework import serializers
from .models import University, Profile, Review

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = '__all__'

class UniversityCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'

class UniversityListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'