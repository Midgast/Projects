from pathlib import Path
import os

# --- 1. БАЗОВЫЕ НАСТРОЙКИ ---

# Путь к корневой папке проекта
BASE_DIR = Path(__file__).resolve().parent.parent

# Секретный ключ (в реальном проекте его прячут, для хакатона ок)
SECRET_KEY = 'django-insecure-change-me-later-to-something-secure'

# Режим разработки (True - показывает ошибки на экране)
DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver"]


# --- 2. ПОДКЛЮЧЕННЫЕ ПРИЛОЖЕНИЯ ---

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Твоё приложение (ОБЯЗАТЕЛЬНО)
    'core.apps.CoreConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'college_config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [], # Django сам ищет шаблоны внутри папок приложений (core/templates)
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

WSGI_APPLICATION = 'college_config.wsgi.application'


# --- 3. БАЗА ДАННЫХ (SQLite) ---

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# --- 4. ПАРОЛИ И ЯЗЫК ---

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    # Можно закомментировать эти строки на время хакатона, 
    # чтобы создавать простые пароли типа "123"
    # {
    #     'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    # },
    # {
    #     'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    # },
]

# Язык админки и сайта (Русский)
LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'UTC' # Можно поставить 'Asia/Bishkek'
USE_I18N = True
USE_TZ = True


# --- 5. СТАТИКА И МЕДИА (ВАЖНО!) ---

# Ссылка, по которой браузер видит CSS/JS
STATIC_URL = 'static/'

# Папка, где физически лежат общие стили (в корне проекта)
STATICFILES_DIRS = [
    BASE_DIR / "static",
]

# Ссылка для загруженных файлов (аватарок)
MEDIA_URL = '/media/'
# Папка, куда сохраняются файлы
MEDIA_ROOT = BASE_DIR / 'media'


# --- 6. НАСТРОЙКИ ВХОДА/ВЫХОДА ---

# Куда перекидывать ПОСЛЕ успешного входа
LOGIN_REDIRECT_URL = 'dashboard'

# Куда перекидывать ПОСЛЕ выхода
LOGOUT_REDIRECT_URL = 'login'

# Куда перекидывать, если неавторизованный юзер пытается зайти на сайт
LOGIN_URL = 'login'


# --- 7. ДОПОЛНИТЕЛЬНО ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'