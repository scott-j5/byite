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
    IMAGES_SVG_CONTENT_TYPE
)

class ScaleItImageField(FileField):
    # Dictionary containing propeties for cropping or scaling image
    # max_width, max_height, quality, max_upload_size
    props = {}

    def __init__(self, *args, **kwargs):
        for key, value in list(kwargs.items()):
            if key.lower() in ['max_width', 'max_height', 'quality', 'max_upload_size']:
                self.props[key.lower()] = kwargs.pop(key)
            elif key.lower in ['content_types']:
                setattr(self, key.lower(), kwargs.pop(key))
        super(ScaleItImageField, self).__init__(*args, **kwargs)


    def clean(self, value, model_instance):
        # Check to see if a file was uploaded
        if value._file:
            # Check to make sure image is an accepted content type
            if value._file.content_type in IMAGES_ACCEPTED_CONTENT_TYPES:

                # Check to make sure that the file mime type actually matches file extension
                if utils.validate_mime(value._file):

                    # If file size exceeds max allowed, Raise error. Else convert to Django object
                    if value._file.size > (IMAGES_MAX_UPLOAD_SIZE_MB * 1024 * 1024):
                        raise ValidationError(_(f"Uploaded file exceeds maximum allowed size of {IMAGES_MAX_UPLOAD_SIZE_MB}MB."), code="file_invalid")
                    else:
                        # Process vector or raster depending on file type
                        if value._file.content_type == IMAGES_SVG_CONTENT_TYPE:
                            bytes_image = utils.process_vector(value._file)
                            image_size = bytes_image.size
                        else:
                            bytes_image = utils.process_raster(value._file, self.props)
                            image_size = bytes_image.tell()

                        # Convert image to Django InMemoryUploadedFile Object
                        processed_image = InMemoryUploadedFile(
                            file=bytes_image,
                            field_name=None,
                            name=value._file.name,
                            content_type=value._file.content_type,
                            size=image_size,
                            charset=None
                        )
                        value._file = processed_image
                else:
                    raise ValidationError(_("It looks like the extenstion of the file didn't match its actual type"), code='file_invalid')
            else:
                raise ValidationError(_("Unsupported image format. Must be .jpg, .png or .svg"), code='file_invalid')
        return super(ScaleItImageField, self).clean(value, model_instance)

    def formfield(self, **kwargs):
        defaults = {
            'form_class': ScaleItImageFormField,
            }
        defaults.update(kwargs)
        return super().formfield(**defaults)

class CropItImageField(ScaleItImageField):

    def __init__(self, *args, **kwargs):
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
        return super().formfield(**defaults)