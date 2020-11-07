# Django library.
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

def retrieve(name):
    try:
        return getattr(settings, name, False)
    except ImproperlyConfigured:
        # To handle the auto-generation of documentations.
        return False


IMAGES_MAX_UPLOAD_SIZE_MB = retrieve('IMAGES_MAX_UPLOAD_SIZE_MB') or 50
IMAGES_ACCEPTED_CONTENT_TYPES = retrieve('IMAGES_ACCEPTED_CONTENT_TYPES') or 'image/jpeg', 'image/png', 'image/svg+xml'
IMAGES_SVG_CONTENT_TYPE = retrieve('IMAGES_SVG_CONTENT_TYPE') or 'image/svg+xml'
IMAGES_DPI = retrieve('IMAGES_DPI') or 90
IMAGES_DEFAULT_IMAGE_PROPS = retrieve('IMAGES_DEFAULT_IMAGE_PROPS') or {"max_width": 1000, "max_height": 1000, "quality": IMAGES_DPI, "upscale": False}