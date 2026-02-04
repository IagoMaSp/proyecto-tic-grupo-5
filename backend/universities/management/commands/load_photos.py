from universities.models import University, PhotosUniversity
from django.core.management.base import BaseCommand
from pathlib import Path
from django.core.files import File

class Command(BaseCommand):
    help = "Load of initial photos from each university."
    
    def add_arguments(self, parser):
        parser.add_argument("photos_folder", type=str, help="Path to floder that contains the folder of every university")
        
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delates all photos loaded previewsly (useful in dev).',
        )
    
    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Eliminando fotos existentes...'))
            PhotosUniversity.objects.all().delete()
        
        folder=Path(options['photos_folder'])

        for unis_photos in folder.iterdir():
            if not unis_photos.is_dir():
                continue
            try:
                university=University.objects.get(slug=unis_photos.name)
            
            except University.DoesNotExist as e:
                self.stdout.write(self.style.ERROR(f'University not found/recognised for slug: {Path(unis_photos).name}'))
                continue

            for photo in unis_photos.iterdir():
                if not photo.is_file():
                    continue
                
                with open(photo, 'rb') as f:
                    PhotosUniversity.objects.create(
                        university=university,
                        university_name_linker=university.name,
                        photo=File(f, name=photo.name)
                    )