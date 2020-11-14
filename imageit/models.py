# Create your models here.
from django.db.models import FileField
from PIL import Image

from .fields import ScaleItImageFormField, CropItImageFormField
from .settings import (
    IMAGEIT_DEFAULT_IMAGE_PROPS,
)

class ScaleItImageField(FileField):
    # Dictionary containing propeties for cropping or scaling image
    # max_width, max_height, quality, max_upload_size
    img_props = IMAGEIT_DEFAULT_IMAGE_PROPS

    def __init__(self, *args, **kwargs):
        for key, value in list(kwargs.items()):
            if key.lower() in ['max_width', 'max_height', 'quality', 'max_upload_size', 'upscale']:
                self.img_props[key.lower()] = kwargs.pop(key)
            elif key.lower() in ['content_types']:
                setattr(self, key.lower(), kwargs.pop(key))
        super(ScaleItImageField, self).__init__(*args, **kwargs)


    def formfield(self, **kwargs):
        # Update form field class used and pass kwargs to be used when instantiating
        defaults = {
            'form_class': ScaleItImageFormField,
        }
        defaults.update(kwargs)
        defaults.update(**self.img_props)
        # Returns instanciated form_class class
        return super(ScaleItImageField, self).formfield(**defaults)


class CropItImageField(ScaleItImageField):

    def formfield(self, **kwargs):
        defaults = {
            'form_class': CropItImageFormField,
        }
        defaults.update(kwargs)
        return super(CropItImageField, self).formfield(**defaults)