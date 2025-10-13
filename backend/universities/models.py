from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator 
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver 

# Create your models here.
class University(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    qs_rating_top = models.IntegerField()
    qs_rating_bottom = models.IntegerField()
    web_pages = models.URLField()
    status = models.CharField(max_length=255)
    continent = models.CharField(max_length=255)

    visits_count = models.IntegerField(default=0, help_text="Contador para medir la popularidad de la universidad.")

    def __str__(self):
        return self.name
    
class Profile(models.Model):
    # Relación uno a uno con el modelo de usuario de Django.
    # Cada usuario tendrá un solo perfil, y cada perfil pertenece a un solo usuario.
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Campo de la foto de perfil
    profile_photo = models.ImageField(
        upload_to='profile_photos/', 
        blank=True, 
        null=True
    )

    def __str__(self):
        return f'Perfil de {self.user.username}'

class Review(models.Model):
    description = models.CharField(max_length=511)
    start_date = models.DateField()
    end_date = models.DateField()
    social_rating = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(5)])
    academic_rating = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(5)])
    place_rating = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(5)])
    
    # Relation: User --- 1 --- 1 --- Review
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    
    # Relation: University --- 1 --- n --- Review
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='reviews')


# Function for automatic creation of profiles
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

# Function for automatic profile save when a user is saving
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

