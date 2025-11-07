"""
Configuración principal (settings) del proyecto Django.

Refactorizado por el Organizador de Código para mejorar la legibilidad,
la agrupación lógica y la mantenibilidad.
"""

# --- Importaciones ---
import os
from pathlib import Path
from datetime import timedelta

# --- Configuración Core de Django ---

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Clave secreta (leída desde variables de entorno)
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-ONLY-FOR-DEV')

# Modo Debug (controlado por variable de entorno)
# '1' o 'True' (case-insensitive) activan DEBUG. Default: '1' (True)
DEBUG_ENV = os.getenv('DJANGO_DEBUG', '1').lower()
DEBUG = DEBUG_ENV in ('1', 'true')

# Hosts permitidos
# TODO: Configurar ALLOWED_HOSTS adecuadamente para producción.
ALLOWED_HOSTS = []


# --- Definición de Aplicaciones y Middleware ---

# una app es un “módulo” dentro del proyecto
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Apps de terceros
    'rest_framework',
    'django_filters',
    'corsheaders',

    # Apps locales
    'universities',
    'rest_framework.authtoken',
]

MIDDLEWARE = [
    # CORS debe ir antes de CommonMiddleware
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'src.urls'


# --- Plantillas y Configuración WSGI ---

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'src.wsgi.application'


# --- Configuración de Base de Datos ---
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "portaldb"),
        "USER": os.getenv("POSTGRES_USER", "portaluser"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "portalpass"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}


# --- Validación de Contraseñas ---
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# --- Internacionalización ---
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# --- Archivos Estáticos y Media ---
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Directorio donde se guardarán los archivos subidos (ej: fotos de perfil)
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# URL pública para acceder a los archivos subidos
MEDIA_URL = '/media/'


# --- Configuración de Clave Primaria ---
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',    
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}
# --- Configuración de Aplicaciones de Terceros ---

# 1. Configuración de CORS (Cross-Origin Resource Sharing)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Frontend Vite (dev)
    "http://localhost:3000",
]
# Permitir todos los orígenes si DEBUG está activado
CORS_ALLOW_ALL_ORIGINS = DEBUG


# 2. Configuración de Django Rest Framework (DRF)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# 3. Configuración de Simple JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}
