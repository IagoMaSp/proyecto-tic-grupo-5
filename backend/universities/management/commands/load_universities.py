import pandas as pd
import re
from django.core.management.base import BaseCommand
from django.db import transaction
from universities.models import University, Faculty
from unidecode import unidecode
from thefuzz import process

class Command(BaseCommand):
    MATCH_THRESHOLD = 90
    help = 'Carga universidades desde archivos CSV de convenios y QS rankings.'

    def add_arguments(self, parser):
        parser.add_argument("convenios_file", type=str, help="Path al archivo CSV de universidades con convenio")
        parser.add_argument("qs_rankings_file", type=str, help="Path al archivo CSV de QS rankings")
        
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Elimina todas las universidades antes de cargar nuevas.',
        )

    def clean_name(self, name):
        if not isinstance(name, str):
            return ""
        cleaned = unidecode(name).lower()
        cleaned = re.sub(r'[^\w\s]', '', cleaned)
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = cleaned.strip()
        return cleaned

    def handle(self, *args, **options): #args es una tupla, options es un diccionario tipo: {'clear': True, 'verbose': False} los * son para despenpaquetar
        if options['clear']:
            self.stdout.write(self.style.WARNING('Eliminando universidades existentes...'))
            University.objects.all().delete()
        
        convenios_path = options['convenios_file']
        qs_rankings_path = options['qs_rankings_file']
        
        try:
            df_convenios = pd.read_csv(convenios_path, encoding='utf-8')
            self.stdout.write(self.style.SUCCESS('Universidades con convenio cargadas exitosamente.'))
        
            df_qs = pd.read_csv(qs_rankings_path, encoding='latin-1') 
            self.stdout.write(self.style.SUCCESS('QS Ranking e información de universidades cargadas exitosamente.'))

            df_convenios['clean_name'] = df_convenios['name'].apply(self.clean_name)
            df_qs['clean_name'] = df_qs['Institution_Name'].apply(self.clean_name)
            
            df_qs = df_qs.rename(columns={
                'Institution_Name': 'name',
                'Region': 'continent_qs',
                'STATUS': 'status_qs',
                'Location': 'country_qs' # Lo guardamos por si acaso, pero usaremos el de convenios porque asi queda en español
            })
            df_convenios = df_convenios.rename(columns={
                'web_page': 'web_pages'
            })

            qs_choices = df_qs['clean_name'].tolist()
            qs_lookup = df_qs.set_index('clean_name')

            universities_created = 0
            universities_updated = 0
            universities_skipped = 0

            with transaction.atomic():
                for _, row in df_convenios.iterrows():
                    try:
                        best_match, score = process.extractOne(row['clean_name'], qs_choices)
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error en fuzzy matching para '{row['name']}': {e}"))
                        continue
                    if score < self.MATCH_THRESHOLD:
                        self.stdout.write(self.style.WARNING(
                            f"Universidad '{row['name']}' omitida. Mejor coincidencia '{best_match}' (Score: {score}%) no es suficiente."
                        ))
                        universities_skipped += 1
                        continue
                    
                    qs_row = qs_lookup.loc[best_match].iloc[0] if isinstance(qs_lookup.loc[best_match], pd.DataFrame) else qs_lookup.loc[best_match]
                    if pd.isna(qs_row['RANK_2025']):
                        self.stdout.write(self.style.WARNING(f"Universidad '{row['name']}' omitida por falta de QS ranking."))
                        universities_skipped += 1
                        continue
                    
                    top, bottom = self.parse_qs_ranking(qs_row['RANK_2025'])
                    if top is None or bottom is None:
                        self.stdout.write(self.style.WARNING(f"Universidad '{row['name']}' omitida por formato inválido de QS ranking: {qs_row['RANK_2025']}"))
                        universities_skipped += 1
                        continue
                    
                    continent_mapped= self.map_continent(qs_row['continent_qs'])
                    if continent_mapped == 'Not Classified':
                        self.stdout.write(self.style.WARNING(f"Universidad '{row['name']}' omitida por continente no clasificado: {qs_row['continent_qs']}"))
                        universities_skipped += 1
                        continue
                    
                    status=qs_row['status_qs'] if pd.notna(qs_row['status_qs']) else 'Unknown'
                    
                    if 'country' not in row or pd.isna(row['country']):
                         self.stdout.write(self.style.ERROR(f"Error: La columna 'country' no se encontró en la fila para {row['name']}."))
                         continue
                    
                    if 'web_pages' not in row or pd.isna(row['web_pages']):
                        self.stdout.write(self.style.ERROR(f"Error: La columna 'web_pages' está vacía o no se encontró en la fila para {row['name']}."))
                        universities_skipped += 1
                        continue

                    obj,created = University.objects.update_or_create(
                        name=row['name'].strip(),
                        defaults={
                            'country': row['country'],
                            'web_pages': row['web_pages'],
                            'qs_rating_top': top,
                            'qs_rating_bottom': bottom,
                            'status': status,
                            'continent': continent_mapped
                        })
                    

                    obj.faculties.clear()
                    if 'facultades_habilitadas' in row and pd.notna(row['facultades_habilitadas']):
                        faculties_str = row['facultades_habilitadas']
                        faculty_codes = faculties_str.split(';')

                        for code in faculty_codes:
                            code = code.strip()
                            if code:
                                faculty_obj, faculty_created = Faculty.objects.get_or_create(name=code)
                                obj.faculties.add(faculty_obj)

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
        if '+' in rank_str:
            try:
                top = int(rank_str.replace('+', ''))
                return top, 9999 # 9999 representa "o más"
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
            'Europe': 'Europa',
            'Asia': 'Asia',
            'Oceania': 'Oceania',
            'Africa': 'Africa'
        }
        return mapping.get(continent_qs, 'Not Classified')