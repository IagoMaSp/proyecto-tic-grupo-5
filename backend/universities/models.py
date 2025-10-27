from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator 
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver 

class University(models.Model):
    name = models.CharField(max_length=255, null=False, blank=False, unique=True)
    country = models.CharField(max_length=255, null=False, blank=False)
    qs_rating_top = models.IntegerField(null=False, blank=False)
    qs_rating_bottom = models.IntegerField(null=False, blank=False)
    web_pages = models.URLField(null=False, blank=False)
    status = models.CharField(max_length=255, null=False, blank=False)
    continent_choices = [('Africa', 'África'),("America", "América"),("Asia", "Asia"),("Europe", "Europa"),("Oceania", "Oceania"),]
    continent = models.CharField(max_length=50, choices=continent_choices, null=False, blank=False)

    visits_count = models.IntegerField(default=0, help_text="Número de veces que se ha visto la universidad")

    def __str__(self):
        return self.name
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(qs_rating_bottom__gte=models.F('qs_rating_top')),
                name="qs_rating_bottom_gte_qs_rating_top"
            )
        ]
    
class PhotosUniversity(models.Model):
    # Relation: University --- 1 --- n --- PhotosUniversity
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='photos', null=False, blank=False)
    
    # Campo de la foto de la universidad
    photo = models.ImageField(upload_to='university_photos/', blank=False, null=False)

    def __str__(self):
        return f'Foto de {self.university.name}'

class Profile(models.Model):
    # Relación uno a uno con el modelo de usuario de Django.
    # Cada usuario tendrá un solo perfil, y cada perfil pertenece a un solo usuario.
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Campo de la foto de perfil
    profile_photo = models.ImageField(upload_to='profile_photos/', blank=True, null=True)

    def __str__(self):
        return f'Perfil de {self.user.username}'

class Wishlist(models.Model):    
    # Relation: User --- 1 --- n --- Wishlist
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists', null=False, blank=False)
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='wishlisted_by', null=False, blank=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'university'], name='unique_user_university')
        ]

    def __str__(self):
        return f'Wishlist {self.user.username} - {self.university.name}'


class Review(models.Model):
    description = models.CharField(max_length=511, null=False, blank=False)
    start_date = models.DateField(null=False, blank=False)
    end_date = models.DateField(null=False, blank=False)
    social_rating = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(5)], null=False, blank=False)
    academic_rating = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(5)], null=False, blank=False)
    place_rating = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(5)], null=False, blank=False)
    
    # Relation: User --- 1 --- 1 --- Review
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews', null=False, blank=False)
    
    # Relation: University --- 1 --- n --- Review
    university = models.ForeignKey(University, on_delete=models.CASCADE, related_name='reviews', null=False, blank=False)

    @property
    def overall_rating(self):
        return (self.social_rating + self.academic_rating + self.place_rating) / 3

    class Meta:
        indexes = [
            models.Index(fields=['user', 'university']),
            models.Index(filelds=['-start_date']),]
        
        constraints = [
            models.UniqueConstraint(
            fields=['user', 'university'],
            name='unique_user_university_review'),

            models.CheckConstraint(
                check=models.Q(end_date__gt=models.F('start_date')),
                name="review_end_after_start"
            )
        ]

# Function for automatic creation of profiles
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

# Function for automatic profile save when a user is saving
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

