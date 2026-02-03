from universities.models import University, PhotosUniversity
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

        try:
            for unis_photos in folder.iterdir():
                university=University.objects.get(slug=Path(unis_photos).name)
                if university==None:
                    self.stdout.write(self.style.ERROR(f'This University was not found/recognised'))
                    continue
                for photo in unis_photos.iterdir():
                    PhotosUniversity.objects.create(
                        university=university,
                        university_name_linker=university.name,
                        photo=File(f, name= photo.name)         ##REVISAR
                    )
        
        except University.DoesNotExist as e:
            self.stdout.write(self.style.ERROR(f'University not found/recognised for slug: {Path(unis_photos).name}'))
                   
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An unexpected error ocurred: {e}'))

        
