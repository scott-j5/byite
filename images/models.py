# Create your models here.
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models import FileField
from django.utils.translation import gettext_lazy as _
from PIL import Image

from . import utils
from .settings import (
    IMAGES_ACCEPTED_CONTENT_TYPES,
    IMAGES_MAX_UPLOAD_SIZE_MB,
    IMAGES_SVG_CONTENT_TYPE
)

class CustomImageField(FileField):
    props = {}

    def __init__(self, *args, **kwargs):
        for key, value in list(kwargs.items()):
            if key.lower() in ['x', 'y', 'max_width', 'max_height', 'quality']:
                self.props[key.lower()] = kwargs.pop(key)
            elif key.lower in ['quality', 'content_types']:
                setattr(self, key.lower(), kwargs.pop(key))
        super(CustomImageField, self).__init__(*args, **kwargs)


    def clean(self, value, model_instance):
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
        return super(CustomImageField, self).clean(value, model_instance)