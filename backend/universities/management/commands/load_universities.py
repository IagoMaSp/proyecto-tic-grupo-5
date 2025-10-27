import pandas as pd
import re
from django.core.management.base import BaseCommand
from django.db import transaction                                           #VER QUE ES ESTO
# Asegúrate de importar tu modelo desde la ubicación correcta
# from tu_app.models import University
from models import University # Ajusta 'core' al nombre de tu app

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("convenios_file", type=str, help="Path al archivo CSV de universidades con convenio")
        parser.add_argument("qs_rankings_file", type=str, help="Path al archivo CSV de QS rankings")
    

    def handle(*args, **options): #args es una tupla, options es un diccionario tipo: {'clear': True, 'verbose': False} los * son para despenpaquetar
        if options['clear']:
            self.stdout.write(self.style.WARNING('Eliminando universidades existentes...'))
            University.objects.all().delete()
        
        convenios_path = options['convenios_csv']
        qs_rankings_path = options['qs_rankings_csv']
        
        
        self.stdout.write(self.style.SUCCESS('\n Cargando universidades con convenio...'))
        
        self.load_universities(convenios_path)
            
        self.stdout.write(self.style.SUCCESS('\n Cargando universidades QS Ranking...'))

        self.load_qs_rankings(qs_rankings_path)
            
        self.stdout.write(self.style.SUCCESS('\n Proceso completado!'))

        self.stdout.write(f'Total universidades: {University.objects.count()}')
        

    
    def load_universities(self, file_path):
        created_count = 0
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)




