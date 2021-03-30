# Create your models here.
from django.db.models import FileField
from django.utils.translation import gettext_lazy as _

from PIL import Image

from .fields import ScaleItImageFormField, CropItImageFormField
from .settings import (
    IMAGEIT_DEFAULT_IMAGE_PROPS,
)

class ScaleItImageField(FileField):
    description = _("Image field that scales to the bounds of max_height and max_width")

    def __init__(self, *args, **kwargs):
        # Dictionary containing propeties for cropping or scaling image
        # max_width, max_height, quality, max_upload_size
        self.img_props = dict(IMAGEIT_DEFAULT_IMAGE_PROPS)

        for key, value in list(kwargs.items()):
            if key.lower() in ['max_width', 'max_height', 'quality', 'max_upload_size', 'upscale']:
                self.img_props[key.lower()] = kwargs.pop(key)
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

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        if self.img_props != IMAGEIT_DEFAULT_IMAGE_PROPS:
            kwargs.update(self.img_props)
        return name, path, args, kwargs


class CropItImageField(ScaleItImageField):
    description = _("Image field that crops an image then scales it to the bounds of max_height and max_width")

    def formfield(self, **kwargs):
        defaults = {
            'form_class': CropItImageFormField,
        }
        defaults.update(kwargs)
        return super(CropItImageField, self).formfield(**defaults)
