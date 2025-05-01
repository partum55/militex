"""
Django settings for militex project.
"""
import mongoengine
import os
import dj_database_url
from pathlib import Path
from datetime import timedelta
from django.core.management.utils import get_random_secret_key
import mimetypes

mimetypes.add_type("text/javascript", ".js", True)
mimetypes.add_type("text/css", ".css", True)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'cronenburg-123890')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
# DEBUG = False

FORCE_SERVE_MEDIA = True
ALLOWED_HOSTS = ['militex.koyeb.app', '127.0.0.1', 'localhost','joint-ilse-bodiyakol-fdedf48c.koyeb.app']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',

    'rest_framework',
    'corsheaders',
    'django_filters',
    'rest_framework_simplejwt',
    'whitenoise.runserver_nostatic',  # Add whitenoise for static files

    'accounts',
    'cars',
    'fundraiser',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add whitenoise middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
]

ROOT_URLCONF = 'militex.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [ BASE_DIR / 'frontend_build' ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'militex.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
# MongoDB configuration with Koyeb environment variables
# MongoDB connection settings
MONGODB_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017')
MONGODB_USERNAME = os.environ.get('MONGODB_USERNAME', '')
MONGODB_PASSWORD = os.environ.get('MONGODB_PASSWORD', '')
MONGODB_AUTH_SOURCE = os.environ.get('MONGODB_AUTH_SOURCE', 'admin')

# Print connection info for debugging
print(f"MongoDB connection info: {MONGODB_URI}, user: {MONGODB_USERNAME}, auth_source: {MONGODB_AUTH_SOURCE}")

# Connect to MongoDB databases
try:
    print(f"Connecting to MongoDB: {MONGODB_URI}")
    if MONGODB_USERNAME and MONGODB_PASSWORD:
        # Connect with authentication
        print(f"Using authenticated MongoDB connection with user: {MONGODB_USERNAME}")
        mongoengine.connect(
            db='militex_users',
            host=MONGODB_URI,
            username=MONGODB_USERNAME,
            password=MONGODB_PASSWORD,
            authentication_source=MONGODB_AUTH_SOURCE,
            alias='default'
        )
        
        mongoengine.connect(
            db='militex_cars',
            host=MONGODB_URI,
            username=MONGODB_USERNAME,
            password=MONGODB_PASSWORD,
            authentication_source=MONGODB_AUTH_SOURCE,
            alias='cars_db'
        )
    else:
        # Connect without authentication
        print("Using non-authenticated MongoDB connection")
        mongoengine.connect(
            db='militex_users',
            host=MONGODB_URI,
            alias='default'
        )
        
        mongoengine.connect(
            db='militex_cars',
            host=MONGODB_URI,
            alias='cars_db'
        )
    print("MongoDB connection established successfully")
except Exception as e:
    print(f"MongoDB connection error: {e}")
    print("WARNING: MongoDB connection failed but Django will continue to start")
DATABASE_ROUTERS = ['militex.db_routers.DatabaseRouter']
# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [
    ('en', 'English'),
    ('uk', 'Ukrainian'),
]

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    os.path.join(BASE_DIR, 'frontend_build', 'static'),  # Point directly to frontend static folder
]

# Make sure WhiteNoise can find the files
WHITENOISE_ROOT = os.path.join(BASE_DIR, 'frontend_build')

# Change to standard WhiteNoise storage since custom one might have issues
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# Media files (User uploaded files)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# CSRF and CORS settings
CSRF_COOKIE_SECURE = os.environ.get('CSRF_COOKIE_SECURE', 'False') == 'True'
CSRF_COOKIE_HTTPONLY = False  # Keep False to allow JS access
CSRF_COOKIE_SAMESITE = os.environ.get('CSRF_COOKIE_SAMESITE', 'Lax')
CSRF_TRUSTED_ORIGINS = ['https://militex.koyeb.app', 'http://militex.koyeb.app', 'https://127.0.0.1:8000', 'https://localhost:8000', 'https://joint-ilse-bodiyakol-fdedf48c.koyeb.app']

# CORS settings
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = ['https://militex.koyeb.app', 'http://militex.koyeb.app', 'https://127.0.0.1:8000', 'https://localhost:8000', 'https://joint-ilse-bodiyakol-fdedf48c.koyeb.app']

# Allow specific HTTP methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Allow cookies and headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Security settings for production
if not DEBUG:
    # Disable forced SSL redirect to prevent redirect loops
    SECURE_SSL_REDIRECT = False
    
    # Make sure cookie settings are compatible with both HTTP and HTTPS
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    
    # Add correct trusted origins for CSRF
    CSRF_TRUSTED_ORIGINS = [
        'https://militex.koyeb.app', 
        'http://militex.koyeb.app',
        'https://*.koyeb.app', 
        'http://*.koyeb.app'
    ]
    
    # Other security settings can remain unchanged
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    X_FRAME_OPTIONS = 'DENY'

if DEBUG or FORCE_SERVE_MEDIA:
    # Override any production settings for media
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
    
    # Make sure directory exists
    os.makedirs(MEDIA_ROOT, exist_ok=True)
    os.makedirs(os.path.join(MEDIA_ROOT, 'car_images'), exist_ok=True)
