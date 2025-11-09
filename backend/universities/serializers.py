"""
Serializadores de Django Rest Framework para la aplicación.

Organizado para claridad, legibilidad y adherencia a las
mejores prácticas de DRF y PEP 8.
"""

# --- Importaciones ---
# 1. Importaciones de la librería estándar
from datetime import date

# 2. Importaciones de terceros (Django, DRF)
from django.contrib.auth.models import User
from rest_framework import serializers

# 3. Importaciones locales (Modelos de esta aplicación)
from .models import University, Profile, Review, Wishlist, Faculty

# --- Constantes del Módulo ---

# REFACTOR: Movido de 'validate_description' a un ámbito de módulo
# para facilitar su mantenimiento.
FORBIDDEN_WORDS = ['spam', 'test', 'asdfgh']


# --- Serializadores de Modelos Auxiliares ---

class FacultySerializer(serializers.ModelSerializer):
    """
    Serializador simple para Faculty.
    Usado cuando necesitas mostrar info completa de facultades.
    """
    class Meta:
        model = Faculty
        fields = ['id', 'name']


# --- Serializadores de University ---

class UniversityListSerializer(serializers.ModelSerializer):
    """
    Serializer LIGERO para listados (cards, grids).
    
    Solo incluye campos esenciales para mostrar en tarjetas:
    - Identificación básica (id, name, country)
    - Ranking QS
    - Métricas calculadas (review_count, overall_avg_rating)
    
    Usado en: GET /api/universities/
    """
    review_count = serializers.IntegerField(read_only=True)
    overall_avg_rating = serializers.FloatField(read_only=True)
    
    class Meta:
        model = University
        fields = [
            'id', 
            'name', 
            'country', 
            'continent',
            'qs_rating_top', 
            'qs_rating_bottom',
            'review_count', 
            'overall_avg_rating',
            # 'faculties', # Quitado para aligerar la respuesta de lista
            'review_count',
            'overall_avg_rating',
            'description'
        ]
    


class UniversitySerializer(serializers.ModelSerializer):
    """
    Serializer COMPLETO para detalle de universidad.
    
    Incluye:
    - Todos los campos del modelo
    - Campos calculados (review_count, overall_avg_rating)
    - Facultades (como lista de nombres legibles)
    - Fotos (como lista de URLs absolutas)
    
    Usado en: 
    - GET /api/universities/{id}/
    - POST/PUT/PATCH /api/universities/
    """
    
    # Campos calculados (vienen del annotate en el ViewSet)
    review_count = serializers.IntegerField(read_only=True)
    overall_avg_rating = serializers.FloatField(read_only=True)
    avg_social = serializers.FloatField(read_only=True)
    avg_academic = serializers.FloatField(read_only=True)
    avg_place = serializers.FloatField(read_only=True)
    
    # Facultades como lista de nombres (en lugar de IDs)
    # Usa el método __str__() del modelo Faculty
    faculties = serializers.StringRelatedField(many=True, read_only=True)
    
    # Fotos como lista de URLs absolutas
    photos = serializers.SerializerMethodField()
    
    class Meta:
        model = University
        fields = [
            # Campos básicos del modelo
            'id',
            'name',
            'country',
            'continent',
            'qs_rating_top',
            'qs_rating_bottom',
            'web_pages',
            'status',
            'visits_count',
            
            # Relaciones
            'faculties',
            'photos',
            
            # Campos calculados (read-only)
            'review_count',
            'overall_avg_rating',
            'avg_social',
            'avg_academic',
            'avg_place',
        ]
        read_only_fields = ('visits_count',)  # No editable por usuarios
    
    def get_photos(self, obj):
        """
        Retorna lista de URLs absolutas de fotos.
        
        Si el request está disponible en el contexto, construye URLs completas:
        http://localhost:8000/media/university_photos/uam.jpg
        
        Si no hay request (ej: en tests), retorna URLs relativas:
        /media/university_photos/uam.jpg
        """
        request = self.context.get('request')
        photos = obj.photos.all()
        
        if request:
            # URLs absolutas (con dominio)
            return [
                request.build_absolute_uri(photo.photo.url) 
                for photo in photos
            ]
        
        # Fallback: URLs relativas
        return [photo.photo.url for photo in photos]


class UniversityDetailSerializer(UniversitySerializer):
    """
    Serializer EXTENDIDO para vista full-detail.
    
    Hereda de UniversitySerializer y añade:
    - Facultades con info completa (id + name)
    - Usado solo en acción custom full_detail
    
    Diferencia con UniversitySerializer:
    - faculties: StringRelatedField → FacultySerializer completo
    """
    
    # Override: Facultades con objeto completo (id, name)
    faculties = FacultySerializer(many=True, read_only=True)


# --- Serializadores de Review ---

class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Review.
    Incluye lógica de validación compleja para la creación de reviews.
    """
    
    # --- Campos calculados (Solo Lectura) ---
    overall_rating = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    university_name = serializers.CharField(source='university.name', read_only=True)
    
    # Opcional: Foto de perfil del usuario que hizo la review
    user_profile_photo = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 
            'description', 
            'start_date', 
            'end_date',
            'social_rating', 
            'academic_rating', 
            'place_rating',
            'user', 
            'username',
            'user_profile_photo',  # Nuevo campo
            'university', 
            'university_name',
            'overall_rating'
        ]
        # El usuario se infiere del contexto de la solicitud (request)
        read_only_fields = ('user',)
    
    def get_overall_rating(self, obj):
        """
        Calcula el promedio para esta review específica.
        Nota: Asume que las 3 notas son campos requeridos en el modelo.
        """
        return round((obj.social_rating + obj.academic_rating + obj.place_rating) / 3, 2)
    
    def get_user_profile_photo(self, obj):
        """
        Retorna URL de la foto de perfil del usuario.
        Útil para mostrar avatar junto a la review en el frontend.
        """
        # MODIFICACIÓN: Asegurarse de que obj.user.profile exista
        if not hasattr(obj.user, 'profile') or not obj.user.profile.profile_photo:
            return None
        
        request = self.context.get('request')
        photo_url = obj.user.profile.profile_photo.url
        
        if request:
            return request.build_absolute_uri(photo_url)
        
        return photo_url
    
    # --- Métodos de Validación ---
    
    def validate(self, data):
        """
        Validaciones a nivel de objeto (requieren múltiples campos).
        Se ejecuta después de las validaciones individuales de campo.
        """
        # Se usa .get() porque los campos pueden no estar presentes
        # durante una actualización parcial (PATCH).
        start = data.get('start_date')
        end = data.get('end_date')
        university = data.get('university')
        user = self.context['request'].user
        
        # 1. Validar fechas (solo si ambas están presentes)
        if start and end:
            if end <= start:
                raise serializers.ValidationError({
                    'end_date': 'La fecha de fin debe ser posterior a la fecha de inicio.'
                })
            
            # Validar duración mínima (lógica de negocio)
            if (end - start).days < 7:
                raise serializers.ValidationError({
                    'end_date': 'El intercambio debe durar al menos 1 semana.'
                })
            
        # 2. Validar que no se pueda hacer review de un intercambio futuro
        if start and start > date.today():
            raise serializers.ValidationError({
                'start_date': 'No puedes hacer una review de un intercambio que aún no ha comenzado.'
            })
        
        # 3. Validar review única por usuario/universidad (solo al crear)
        # 'self.instance' es None durante un POST (creación),
        # y es el objeto durante un PUT/PATCH (edición).
        if not self.instance:
            if university and Review.objects.filter(user=user, university=university).exists():
                raise serializers.ValidationError({
                    'university': f'Ya tienes una review en {university.name}. Puedes editarla pero no crear otra.'
                })
        
        return data
    
    def validate_social_rating(self, value):
        """Validación individual del campo social_rating."""
        if not 0 <= value <= 5:
            raise serializers.ValidationError('La nota debe estar entre 0 y 5.')
        return value
    
    def validate_academic_rating(self, value):
        """Validación individual del campo academic_rating."""
        if not 0 <= value <= 5:
            raise serializers.ValidationError('La nota debe estar entre 0 y 5.')
        return value
    
    def validate_place_rating(self, value):
        """Validación individual del campo place_rating."""
        if not 0 <= value <= 5:
            raise serializers.ValidationError('La nota debe estar entre 0 y 5.')
        return value
    
    def validate_description(self, value):
        """Validación individual de la descripción."""
        cleaned_value = value.strip()
        
        if len(cleaned_value) < 20:
            raise serializers.ValidationError(
                'La descripción debe tener al menos 20 caracteres.'
            )
        
        # Validar palabras prohibidas usando la constante del módulo
        if any(word in cleaned_value.lower() for word in FORBIDDEN_WORDS):
            raise serializers.ValidationError('La descripción contiene contenido no permitido.')
        
        return cleaned_value


# --- SERIALIZADORES DE AUTENTICACIÓN ---

class ProfileNestedSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Profile *anidado* dentro del usuario.
    Coincide con la interfaz 'profile' del frontend.
    """
    profile_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ('id', 'profile_photo', 'profile_photo_url')
        read_only_fields = ('id', 'profile_photo_url')
        # Hacemos profile_photo write_only para que no intente devolverlo
        # al leer, solo al escribir (subir).
        extra_kwargs = {
            'profile_photo': {'write_only': True, 'required': False}
        }
    
    def get_profile_photo_url(self, obj):
        """Retorna URL absoluta de la foto de perfil"""
        if not obj.profile_photo:
            return None
        
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.profile_photo.url)
        
        return obj.profile_photo.url


class UserSerializer(serializers.ModelSerializer):
    """
    Serializador principal para el modelo User.
    Este es el formato que espera tu frontend (authContext.tsx).
    
    CORRECCIÓN: Se añade método update() para manejar la subida
    de fotos de perfil desde FormData.
    """
    profile = ProfileNestedSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile')
        # Marcamos email como read_only, ya que la UI no permite cambiarlo
        extra_kwargs = {
            'email': {'read_only': True}
        }

    def update(self, instance, validated_data):
        # 'instance' es el objeto User
        
        # 1. Actualizar campos del User (ej. username)
        # validated_data solo contiene 'username' si se envió y cambió
        instance.username = validated_data.get('username', instance.username)
        instance.save()

        # 2. Actualizar campos del Profile (la foto)
        # La foto no está en validated_data porque es FormData.
        # Debemos buscarla en self.context['request'].data.
        request = self.context.get('request')
        
        # El frontend envía la foto con la clave 'profile.profile_photo'
        # (según se definió en ProfileDetails.tsx)
        if request and request.data.get('profile.profile_photo'):
            photo_file = request.data.get('profile.profile_photo')
            
            # 'instance.profile' es el objeto Profile relacionado al User
            profile_instance = instance.profile
            profile_instance.profile_photo = photo_file
            profile_instance.save()

        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializador para el registro (creación) de nuevos usuarios (modelo User).
    Optimizado para devolver el UserSerializer completo al crear.
    """
    profile = ProfileNestedSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=True)
    
    # Añadimos la confirmación de contraseña para validación
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_confirm', 'profile')
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate_email(self, value):
        """Validar que el email no esté en uso."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email ya está en uso.")
        return value

    def validate_username(self, value):
        """Validar que el nombre de usuario no esté en uso."""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value
        
    def validate(self, attrs):
        """Validar que las contraseñas coincidan."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        """
        Sobrescribe 'create' para usar 'create_user' (maneja hash de contraseña)
        y asegura que la señal de Profile se ejecute.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


# --- SERIALIZADORES DE WISHLIST ---

class WishlistSerializer(serializers.ModelSerializer):
    """
    Serializer para Wishlist que incluye los detalles de la universidad.
    """
    university_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'university', 'created_at', 'updated_at', 'university_details']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_university_details(self, obj):
        """
        Retorna los detalles completos de la universidad asociada.
        """
        from .serializers import UniversitySerializer  # Import local para evitar ciclos
        
        if obj.university:
            return UniversitySerializer(obj.university).data
        return None

class WishlistCreateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para crear wishlist items.
    Solo necesita el ID de la universidad.
    """
    class Meta:
        model = Wishlist
        fields = ['university']

# --- ProfileSerializer que faltaba ---
class ProfileSerializer(serializers.ModelSerializer):
    """Serializer para perfil de usuario."""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'profile_photo']