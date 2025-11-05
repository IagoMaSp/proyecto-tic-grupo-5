import pandas as pd
from django.core.management.base import BaseCommand
from django.db import transaction
from universities.models import Review, University
from django.contrib.auth.models import User
from datetime import datetime

class Command(BaseCommand):
    help = 'Carga reviews desde archivos CSV de reviews_dataset.'

    def add_arguments(self, parser):
        parser.add_argument("reviews_file", type=str, help="Path al archivo CSV de reviews")
        
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina todas las reviews antes de cargar nuevas.',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Eliminando reviews existentes...'))
            Review.objects.all().delete()
        
        reviews_path = options['reviews_file']
        
        try:
            df_reviews = pd.read_csv(reviews_path, encoding='utf-8')
            self.stdout.write(self.style.SUCCESS('Reviews cargadas exitosamente.'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'Archivo no encontrado: {reviews_path}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error al cargar las reviews: {e}'))

        reviews_created = 0
        reviews_skipped=0
        with transaction.atomic():
            for _,row in df_reviews.iterrows():
                try:
                    user_obj, user_created = User.objects.get_or_create(username=row['user'])
                    if user_created:
                        user_obj.set_unusable_password()
                        user_obj.save()
                    uni_obj=University.objects.get(name=row['university'])

                    start_date=datetime.strptime(row['start_date'], '%d/%m/%Y').date()
                    end_date=datetime.strptime(row['end_date'], '%d/%m/%Y').date()
                    review_obj, review_created = Review.objects.get_or_create(user=user_obj, university=uni_obj, 
                        defaults={
                            'description': row['description'],
                            'start_date': start_date,
                            'end_date': end_date,
                            'social_rating': row['social_rating'],
                            'academic_rating': row['academic_rating'],
                            'place_rating': row['place_rating'],
                        }
                    )

                    if review_created:
                        reviews_created += 1
                except University.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'Universidad no encontrada: {row["university"]}. Review saltada.'))
                    reviews_skipped += 1
                    continue
                except ValueError as e:
                    self.stdout.write(self.style.WARNING(f'Error de valor en la fila: {e}. Review saltada.'))
                    reviews_skipped += 1
                    continue
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error inesperado: {e}. Review saltada.'))
                    reviews_skipped += 1
                    continue
        self.stdout.write(self.style.SUCCESS(f'Reviews creadas: {reviews_created}'))
        self.stdout.write(self.style.WARNING(f'Reviews saltadas: {reviews_skipped}'))
                    
                        
