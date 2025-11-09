"""
Modelos de base de datos para la aplicación.

Organizado y refactorizado para claridad, corrección sintáctica y
adherencia a las mejores prácticas de Django.
"""

# --- Importaciones ---
# Agrupadas por origen (Django, luego librerías de terceros, luego locales)
# y ordenadas alfabéticamente.

from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.db.models import Avg, F, Q
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

# --- Constantes del Módulo ---
# Definir constantes a nivel de módulo para valores reutilizables
# (como 'choices') mejora la mantenibilidad.

CONTINENT_CHOICES = [
    ('Africa', 'África'),
    ("America", "América"),
    ("Asia", "Asia"),
    ("Europe", "Europa"),
    ("Oceania", "Oceania"),
]

# --- Modelos Principales ---
# Los modelos se organizan lógicamente. Los modelos de los que
# otros dependen (como Faculty) se definen primero.


class Faculty(models.Model):
    """Modelo simple para almacenar facultades."""
    name = models.CharField(max_length=16, null=False, blank=False, unique=True)

    def __str__(self):
        return self.name


class University(models.Model):
    """Almacena información sobre una universidad específica."""
    
    name = models.CharField(max_length=255, null=False, blank=False, unique=True)
    country = models.CharField(max_length=255, null=False, blank=False)
    qs_rating_top = models.IntegerField(null=False, blank=False)
    qs_rating_bottom = models.IntegerField(null=False, blank=False)
    web_pages = models.URLField(null=False, blank=False)
    status = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(max_length=511, null=True, blank=True)
    continent = models.CharField(
        max_length=50,
        choices=CONTINENT_CHOICES,
        null=False,
        blank=False
    )
    
    visits_count = models.IntegerField(
        default=0,
        help_text="Número de veces que se ha visto la universidad"
    )

    faculties = models.ManyToManyField(
        Faculty,
        blank=True,
        related_name='universities',
        help_text='Facultades con las que esta universidad tiene convenio'
    )
    """
    @property
    def overall_avg_rating(self):
        
        Calcula el promedio general de las calificaciones (social, académica, lugar)
        de todas las revisiones asociadas, ignorando los valores nulos.
        
        Nota: La lógica existente divide la suma de los promedios válidos por 3
        (el número total de categorías), no por el número de categorías
        que tienen calificaciones.
        
        avg_ratings = self.reviews.aggregate(
            social=Avg('social_rating'),
            academic=Avg('academic_rating'),
            place=Avg('place_rating')
        )

        # Filtra las calificaciones que no son nulas (None)
        valid_ratings = [
            rating for rating in avg_ratings.values() if rating is not None
        ]

        if valid_ratings:
            # Calcula el promedio solo de las calificaciones válidas
            return sum(valid_ratings) / 3
        
        # Retorna None si no hay calificaciones válidas
        return None
    """

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Universidad"
        verbose_name_plural = "Universidades"
        indexes = [
            models.Index(fields=['country']),     
            models.Index(fields=['continent']),    
            models.Index(fields=['qs_rating_top']), 
        ]
        constraints = [
            # Asegura que el rango de rating sea lógico
            models.CheckConstraint(
                check=Q(qs_rating_bottom__gte=F('qs_rating_top')),
                name="qs_rating_bottom_gte_qs_rating_top"
            )
        ]


class PhotosUniversity(models.Model):
    """Almacena imágenes asociadas a una universidad."""
    
    # Relaciona cada foto con una única universidad.
    university = models.ForeignKey(
        University,
        on_delete=models.SET_NULL,
        related_name='photos',
        null=True,
        blank=False
    )
    university_name_linker = models.CharField(max_length=255, null=True, blank=True, db_index=True, help_text="Usado internamente para re-enlazar fotos si las universidades se recargan.")
    photo = models.ImageField(upload_to='university_photos/', blank=False, null=False)

    def __str__(self):
        if self.university is None:
            return f'Foto sin universidad asociada (antes de {self.univeersity_name_linker or "desconocido"})'
        return f'Foto de {self.university.name}'

    class Meta:
        verbose_name = "Foto de Universidad"
        verbose_name_plural = "Fotos de Universidades"


class Profile(models.Model):
    """
    Extiende el modelo User de Django para añadir campos personalizados,
    como una foto de perfil.
    """
    
    # Relación uno a uno con el modelo User.
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile' 
    )
    
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)

    def __str__(self):
        return f'Perfil de {self.user.username}'

    class Meta:
        verbose_name = "Perfil de Usuario"
        verbose_name_plural = "Perfiles de Usuarios"


class Wishlist(models.Model):    
    """
    Representa una entrada única en la "lista de deseos" de un usuario,
    vinculando un usuario a una universidad específica.
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='wishlist',
        null=False,
        blank=False
    )
    
    university = models.ForeignKey( 
        University,
        on_delete=models.CASCADE,
        related_name='wishlisted_by',
        null=False,
        blank=False
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        Retorna una representación legible.
        Incluye manejo de errores por si el usuario o universidad
        relacionados han sido eliminados de forma anómala.
        """
        try:
            return f'Wishlist de {self.user.username}: {self.university.name}'
        except (User.DoesNotExist, University.DoesNotExist):
            return f'Entrada de Wishlist (ID: {self.id})'
    
    class Meta:
        verbose_name = 'Lista de deseos'
        verbose_name_plural = 'Listas de deseos'


class Review(models.Model):
    """Almacena una revisión (review) escrita por un usuario sobre una universidad."""
    
    description = models.CharField(max_length=511, null=False, blank=False)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=False, blank=False)
    
    # Calificaciones con validadores de rango
    social_rating = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        null=False,
        blank=False
    )
    academic_rating = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        null=False,
        blank=False
    )
    place_rating = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        null=False,
        blank=False
    )
    
    # --- CAMPO NUEVO ---
    # Se añade el campo para la aprobación. Por defecto es False.
    is_approved = models.BooleanField(default=False)
    
    # Relaciones
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews',
        null=False,
        blank=False
    )
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name='reviews',
        null=False,
        blank=False
    )

    def __str__(self):
        return f'Review de {self.user.username} sobre {self.university.name}'

    @property
    def overall_rating(self):
        """Promedio simple de las tres calificaciones de esta revisión."""
        return (self.social_rating + self.academic_rating + self.place_rating) / 3

    class Meta:
        indexes = [
            models.Index(fields=['user', 'university']),
            models.Index(fields=['-start_date']),
        ]
        
        constraints = [
            # Un usuario solo puede escribir una review por universidad
            models.UniqueConstraint(
                fields=['user', 'university'],
                name='unique_user_university_review'
            ),
            # La fecha de fin debe ser posterior a la de inicio
            models.CheckConstraint(
                check=Q(end_date__gt=F('start_date')),
                name="review_end_after_start"
            )
        ]

# --- Signals ---

# Funciones para la creación y guardado automático del perfil de usuario
# asociado al modelo User de Django.
# Es una buena práctica mantener los signals al final del archivo
# o en su propio archivo (signals.py).

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Crea un objeto Profile automáticamente cuando se crea un nuevo User."""
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Guarda el Profile asociado automáticamente cuando se guarda el User."""
    # Se asume la relación 'profile' definida en el OneToOneField.
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        # Manejo defensivo por si el perfil no se creó
        Profile.objects.create(user=instance)