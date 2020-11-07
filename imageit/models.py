# Create your models here.
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models import FileField
from django.forms.widgets import MultiWidget
from django.utils.translation import gettext_lazy as _
from PIL import Image

from . import utils
from .fields import ScaleItImageFormField, CropItImageFormField
from .settings import (
    IMAGES_ACCEPTED_CONTENT_TYPES,
    IMAGES_MAX_UPLOAD_SIZE_MB,
    IMAGES_SVG_CONTENT_TYPE,
    IMAGES_DEFAULT_IMAGE_PROPS,
)
from .widgets import ScaleItImageWidget, ServerCropItImageWidget

class ScaleItImageField(FileField):
    # Dictionary containing propeties for cropping or scaling image
    # max_width, max_height, quality, max_upload_size
    img_props = IMAGES_DEFAULT_IMAGE_PROPS

    def __init__(self, *args, **kwargs):
        for key, value in list(kwargs.items()):
            if key.lower() in ['max_width', 'max_height', 'quality', 'max_upload_size', 'upscale']:
                self.img_props[key.lower()] = kwargs.pop(key)
            elif key.lower in ['content_types']:
                setattr(self, key.lower(), kwargs.pop(key))
        super(ScaleItImageField, self).__init__(*args, **kwargs)


    def formfield(self, **kwargs):
        # Update form field class used and pass kwargs to be used when instantiating
        defaults = {
            'form_class': ScaleItImageFormField,
            'img_props': self.img_props,
            }
        defaults.update(kwargs)
        print(f'defaults: {defaults}')
        # Returns instanciated form_class class
        return super(ScaleItImageField, self).formfield(**defaults)


class CropItImageField(ScaleItImageField):

    def __init__(self, *args, **kwargs):
        # Set (update) image props with x1,y1,x2,y2
        '''
        props = {}
        
        for key, value in list(kwargs.items()):
            if key.lower() in ['x1', 'y1', 'x2', 'y2']:
                props[key.lower()] = kwargs.pop(key)
        self.props.update(props)
        '''
        super(CropItImageField, self).__init__(*args, **kwargs)

    def formfield(self, **kwargs):
        defaults = {
            'form_class': CropItImageFormField,
            }
        defaults.update(kwargs)
        return super(CropItImageField, self).formfield(**defaults)