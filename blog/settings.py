"""
Django settings for blog project.

Generated by 'django-admin startproject' using Django 3.1.1.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""
import os
from datetime import datetime
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = int(os.environ.get('DJANGO_DEBUG'))

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS').split(',')

# Application definition

INSTALLED_APPS = [
    'app.apps.AppConfig',
    'boto3',
    'blogs.apps.BlogsConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.humanize',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'djrichtextfield',
    'dropzoneit',
    'projects.apps.ProjectsConfig',
    'imageit',
    'imageit.tests',
    'markdownx',
    'storages',
    'users.apps.UsersConfig',
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

ROOT_URLCONF = 'blog.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['app/templates'],
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

WSGI_APPLICATION = 'blog.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases
'''
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR , 'db/db.sqlite3'),
    }
}
'''
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'byite',
        'USER': os.environ.get('DATABASE_USER'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD'),
        'HOST': os.environ.get('DATABASE_HOST'),
        'PORT': '5432'
    }
}
DATABASE_SIZE = "40GB"

# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


LOGIN_REDIRECT_URL = 'home'
LOGIN_URL = 'login'


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

# Where to look for static files during collect static
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

#Where 'collectstatic' dumps static files
STATIC_ROOT = os.path.join(os.path.dirname(BASE_DIR), 'staticfiles')

#URL prefix used by static template tags
STATIC_URL = '/static/'

if not DEBUG:
# S3 folder to upload static files to
STATICFILES_LOCATION = 'static'
STATICFILES_STORAGE = 'static_storages.StaticStorage'


#Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.zoho.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD')


#S3 storage settings
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')

AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None

# S3 folder to upload media files to
MEDIAFILES_LOCATION = 'media'
DEFAULT_FILE_STORAGE = 'media_storages.MediaStorage'


#Markdownx Settings
MARKDOWNX_IMAGE_MAX_SIZE = {
    'size': (1000, 1500),
    'quality': 90
}



MARKDOWNX_MEDIA_PATH = datetime.now().strftime('blog_images/%Y/%m/%d')
MARKDOWNX_UPLOAD_URLS_PATH = '/blogs/blog/default/image/upload/'


DJRICHTEXTFIELD_CONFIG = {
    'js': ['https://cdn.tiny.cloud/1/zsce7lst5im33auwvlcxynn7rqyiwyopckmqdtjxebwsp8x2/tinymce/5/tinymce.min.js'],
    'init_template': 'app/init-tinymce.js',
    'settings': {
        'menubar': False,
        'plugins': 'code codesample hr image lists link table',
        'toolbar': [
            'code | undo redo | styleselect | bold italic underline hr | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist',
            'codesample image link | table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
        ],
        'codesample_languages': [
            {'text': 'Bash', 'value': 'bash' },
            {'text': 'Apache', 'value': 'apacheconf' },
            {'text': 'C', 'value': 'c' },
            {'text': 'C#', 'value': 'csharp' },
            {'text': 'C++', 'value': 'cpp' },
            {'text': 'CSS', 'value': 'css' },
            {'text': 'F#', 'value': 'fsharp' },
            {'text': 'Java', 'value': 'java'},
            {'text': 'HTML/XML', 'value': 'markup'},
            {'text': 'JavaScript', 'value': 'javascript' },
            {'text': 'Json', 'value': 'json' },
            {'text': 'LESS', 'value': 'less' },
            {'text': 'PHP', 'value': 'php'},
            {'text': 'Python', 'value': 'python'},
            {'text': 'Ruby', 'value': 'ruby'},
            {'text': 'SASS', 'value': 'scss' },
            {'text': 'SQL', 'value': 'sql' },
            {'text': 'TypeScript', 'value': 'typescript' }
        ],
        'width': '100%',
        'height': '500',
        'branding': False,
        'images_upload_url': '/blogs/blog/default/image/upload/',
        'relative_urls': False,
    }
}