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
        
        try:
            df.read_csv(convenios_path)
            self.stdout.write(self.style.SUCCESS('\n Universidades con convenio cargadas exitosamente.'))
            
            self.load_qs_rankings(qs_rankings_path) 
            self.stdout.write(self.style.SUCCESS('\n QS Ranking e información de universidades cargadas exitosamente.'))

            df_qs = df_qs.rename(columns={
                'Institution_Name': 'name',
                'Region': 'continent_qs',
                'STATUS': 'status_qs',
                'Location': 'country_qs' # Lo guardamos por si acaso, pero usaremos el de convenios porque asi queda en español
            })
            df_convenios = df_convenios.rename(columns={
                'nombre': 'name',
                'url': 'web_pages'
            })

            df_convenios['name'] = dp_convenios['name'].str.strip()
            df_qs['name'] = df_qs['name'].str.strip()

            df_merged = pd.merge(df_convenios, df_qs[['name','RANK_2025','continent_qs', 'status_qs']], on='name', how='left')

            self.stdout.write(self.style.SUCCESS(f'\n Comenzando la carga de {len(df_merged)} universidades mergeadas...'))

            universities_created = 0
            universities_updated = 0
            universities_skipped = 0

            with transaction.atomic():
                for _, row in df_merged.iterrows():
                    if pd.isna(row['RANK_2025']):
                        self.stdout.write(self.style.WARNING(f"Universidad '{row['name']}' omitida por falta de QS ranking."))
                        universities_skipped += 1
                        continue
                    
                    top, bottom = self.parse_qs_ranking(row['RANK_2025'])
                    if top is None or bottom is None:
                        self.stdout.write(self.style.WARNING(f"Universidad '{row['name']}' omitida por formato inválido de QS ranking: {row['RANK_2025']}"))
                        universities_skipped += 1
                        continue
                    
                    continent_mapped= self.map_continent(row['continent_qs'])
                    if continent_mapped == 'Not Classified':
                        self.stdout.write(self.style.WARNING(f"Universidad '{row['name']}' omitida por continente no clasificado: {row['continent_qs']}"))
                        universities_skipped += 1
                        continue
                    
                    status=row['status_qs'] if pd.notna(row['status_qs']) else 'Unknown'

                    obj,created = University.objects.update_or_create(
                        name=row['name'],
                        defaults={
                            'country': row['country'],
                            'web_pages': row['web_pages'],
                            'qs_rating_top': top,
                            'qs_rating_bottom': bottom,
                            'status': status,
                            'continent': continent_mapped
                        })
                    
                    if created:
                        universities_created += 1
                    else:
                        universities_updated += 1
                    
            self.stdout.write(self.style.SUCCESS(f'\n Carga completada: {universities_created} creadas, {universities_updated} actualizadas, {universities_skipped} omitidas.'))


        except FileNotFoundError as e:
            self.stdout.write(self.style.ERROR(f'Error: File not found. {e}'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An unexpected error ocurred: {e}'))
        
    def parse_qs_ranking(self, rank_str):
        rank_str = str(rank_str).strip()
        if '-' in rank_str:
            parts = rank_str.split('-')
            try:
                top = int(parts[0].strip())
                bottom = int(parts[1].strip())
                return top, bottom
            except ValueError:
                return None, None
        else:
            try:
                rank = int(rank_str)
                return rank, rank
            except ValueError:
                return None, None
    
    def map_continent(self, continent_qs):
        mapping ={
            'Americas': 'America',
            'Europe': 'Europe',
            'Asia': 'Asia',
            'Oceania': 'Oceania',
            'Africa': 'Africa'
        }
        return mapping.get(continent_qs, 'Not Classified')





