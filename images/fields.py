from django.core.exeptions import ValidationError
from django.core.validators import RegexValidator
from django.forms import MultiValueField, FileField, ClearableFileInput, IntegerField
from django.forms.widgets import MultiWidget, NumberInput
from django.utils.translation import gettext_lazy as _

from . import utils
from .files import CropItInMemoryUploadedFile
from .widgets import CropItImageWidget
from .settings import (
    IMAGES_ACCEPTED_CONTENT_TYPES,
    IMAGES_MAX_UPLOAD_SIZE_MB,
    IMAGES_SVG_CONTENT_TYPE
)


class ScaleItImageFormField(FileField):
    img_props = {}
    widget = ClearableFileInput

    def __init__(self, max_length=None, allow_empty_file=False, *args, **kwargs):
        # Set widget to image upload field
        super(ScaleItImageFormField, self).__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        # Data: ByitesIO object (the uploaded image)
    
        # Check to see if a file was uploaded
        if data:
            # Check to make sure image is an accepted content type
            if data.content_type in IMAGES_ACCEPTED_CONTENT_TYPES:

                # Check to make sure that the file mime type actually matches file extension
                if utils.validate_mime(data):

                    # If file size exceeds max allowed, Raise error. Else convert to Django object
                    if data.size > (IMAGES_MAX_UPLOAD_SIZE_MB * 1024 * 1024):
                        raise ValidationError(_(f"Uploaded file exceeds maximum allowed size of {IMAGES_MAX_UPLOAD_SIZE_MB}MB."), code="file_invalid")
                    else:
                        # Process vector or raster depending on file type
                        if data.content_type == IMAGES_SVG_CONTENT_TYPE:
                            processed_file = utils.process_vector(data)
                        else:
                            #
                            #
                            #Need to find a way to pass img props from model init
                            processed_file = utils.process_raster(data, self.img_props)
                        '''
                        # Convert image to Django InMemoryUploadedFile Object
                        processed_image = InMemoryUploadedFile(
                            file=bytes_image,
                            field_name=None,
                            name=value._file.name,
                            content_type=value._file.content_type,
                            size=image_size,
                            charset=None
                        )
                        '''
                else:
                    raise ValidationError(_("It looks like the extenstion of the file didn't match its actual type"), code='file_invalid')
            else:
                raise ValidationError(_("Unsupported image format. Must be .jpg, .png or .svg"), code='file_invalid')

        # Clean image based on content types etc.
        # Return custom inmemory file if any file uploaded
        # Actually return bytes IO file of processed image
        return super(ScaleItImageFormField, self).clean(processed_file)








class CropItImageFormField(MultiValueField):
    widget = CropItImageWidget(widgets=[ClearableFileInput, NumberInput, NumberInput, NumberInput, NumberInput,])

    def __init__(self, max_length=None, widget=None, **kwargs):
        # Define one message for all fields.
        error_messages = {
            'incomplete': 'Missing values required for image crop (required: x, y, width, height).',
        }
        # Or define a different message for each field.
        fields = (
            ScaleItImageFormField(
                error_messages={'incomplete': 'Please select an image to upload.'},
            ),
            IntegerField(
                error_messages={'incomplete': 'Please eneter a starting x value for image crop.'},
                validators=[RegexValidator(r'^[0-9]+$', 'Please eneter a starting x value for image crop.')],
            ),
            IntegerField(
                validators=[RegexValidator(r'^[0-9]+$', 'Please eneter a starting y value for image crop.')],
                required=False,
            ),
            IntegerField(
                validators=[RegexValidator(r'^[0-9]+$', 'Please eneter a starting width value for image crop.')],
                required=False,
            ),
            IntegerField(
                validators=[RegexValidator(r'^[0-9]+$', 'Please eneter a starting height value for image crop.')],
                required=False,
            ),
        )
        super().__init__(
            error_messages=error_messages, fields=fields,
            require_all_fields=False, **kwargs
        )


    def compress(self, data_list):
        print(f'DATAAAAAA_LIST: {data_list}')
        crop_props = {
            'x1': data_list[1],
            'y1': data_list[2],
            'x2': data_list[3],
            'y2': data_list[4],
        }

        processed_image = CropItInMemoryUploadedFile(
            file=data_list[0]._file,
            field_name=None,
            name=data_list[0]._file.name,
            content_type=data_list[0]._file.content_type,
            size=data_list[0].size,
            charset=None,
        )

        # Needs to return a customImageField or in memory uploaded file
        # Needs to return single object to save
        return data_list[0]