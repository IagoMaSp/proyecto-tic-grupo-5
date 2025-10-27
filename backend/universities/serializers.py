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
from .models import University, Profile, Review

# --- Constantes del Módulo ---

# REFACTOR: Movido de 'validate_description' a un ámbito de módulo
# para facilitar su mantenimiento.
FORBIDDEN_WORDS = ['spam', 'test', 'asdfgh']


# --- Serializadores de Modelos ---

class UniversitySerializer(serializers.ModelSerializer):
    """Serializador para el modelo University."""
    
    review_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = University
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Review.
    Incluye lógica de validación compleja para la creación de reviews.
    """
    
    # --- Campos calculados (Solo Lectura) ---
    overall_rating = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    university_name = serializers.CharField(source='university.name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'description', 'start_date', 'end_date',
            'social_rating', 'academic_rating', 'place_rating',
            'user', 'username', 'university', 'university_name',
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

class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Profile.
    Usado para leer y actualizar el perfil de un usuario existente.
    """
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Profile
        fields = ('id', 'profile_photo', 'username', 'email')
        read_only_fields = ('user',)


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializador para el registro (creación) de nuevos usuarios (modelo User).
    """
    # El perfil no se incluye aquí para la escritura,
    # ya que se crea automáticamente mediante una señal en models.py
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'profile')
        extra_kwargs = {
            # El password solo se usa para escribir (write_only)
            'password': {'write_only': True},
            # Asegura que el email sea siempre requerido en el registro
            'email': {'required': True}
        }

    def create(self, validated_data):
        """
        Sobrescribe el método 'create' para usar 'create_user' de Django,
        que maneja correctamente el hash de la contraseña.
        """
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # NOTA: No es necesario crear el Profile aquí.
        # La señal @receiver(post_save, sender=User) en 'models.py'
        # se encarga automáticamente de crear el Profile
        # inmediatamente después de que este 'create_user' se complete.
        
        return user
