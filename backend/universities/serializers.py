from rest_framework import serializers
from django.contrib.auth.models import User
from .models import University, Profile, Review, PhotosUniversity, Wishlist # Asegúrate de importar todos los modelos necesarios

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('user',) # IMPORTANTE: el usuario se asigna en la vista, no en el formulario

# --- SERIALIZADORES DE AUTENTICACIÓN ---

# 1. Profile Serializer (Para lectura/escritura del perfil)
class ProfileSerializer(serializers.ModelSerializer):
    # Campo para incluir el nombre de usuario del User principal (solo lectura)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Profile
        # Expone la foto de perfil junto con los campos del User principal
        fields = ('id', 'profile_photo', 'username', 'email') 
        read_only_fields = ('user',) 

# 2. Register Serializer (Para la creación de nuevos usuarios)
class RegisterSerializer(serializers.ModelSerializer):
    # Campo anidado para manejar el perfil en la misma solicitud (opcional al registrar)
    profile = ProfileSerializer(required=False, read_only=True) # Lo marcamos como read_only aquí
    
    class Meta:
        model = User
        # Solo se necesita username, email y password para el registro.
        fields = ('id', 'username', 'email', 'password', 'profile')
        extra_kwargs = {
            'password': {'write_only': True}, # Crucial para seguridad: no se expone el password
            'email': {'required': True} # Hacer el email obligatorio
        }

    # Función crucial: define cómo se guarda el User y su Profile
    def create(self, validated_data):
        # El signal de Django (post_save) que hay en models.py ya se encarga de crear el Profile.
        
        # 1. Crea el objeto User de Django (hashing del password)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # 2. Como hay un @receiver(post_save...) en models.py, 
        #    el Profile se crea automáticamente, no se necesita crearlo aquí.
        
        return user
