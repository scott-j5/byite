from django.contrib.admin.widgets import AdminFileWidget
from django.core.validators import RegexValidator
from django.forms import MultiValueField, FileField, FloatField
from django.forms.widgets import HiddenInput

from . import utils
from .widgets import ScaleItImageWidget, CropItImageWidget
from .settings import IMAGEIT_IMAGE_PROPERTIES


class ScaleItImageFormField(FileField):
    # Change widget to custom one
    widget = ScaleItImageWidget

    def __init__(self, widget=None, max_length=None, allow_empty_file=False, *args, **kwargs):
        # Stop Django admin from overriding widget with default AdminFileWidget
        # Occurs when instanctiating widgets from admin views
        # See : https://github.com/django/django/blob/master/django/contrib/admin/options.py
        #if isinstance(widget, AdminFileWidget):
        #    self.widget = ScaleItImageWidget
        self.img_props = {}
        for key, val in list(kwargs.items()):
            if key in IMAGEIT_IMAGE_PROPERTIES:
                self.img_props[key] = kwargs.pop(key)

        super(ScaleItImageFormField, self).__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        # Data: InMemoryUploadedFile (the uploaded image)
        # Returns a scaled InMemoryUploadedFile

        data = utils.process_upload(data, self.img_props)
        return super(ScaleItImageFormField, self).clean(data)




class CropItImageFormField(MultiValueField):
    widget = CropItImageWidget(widgets=[ScaleItImageWidget, HiddenInput, HiddenInput, HiddenInput, HiddenInput,])

    def __init__(self, max_length=None, widget=None, **kwargs):
        self.img_props = {}
        for key, val in list(kwargs.items()):
            if key in IMAGEIT_IMAGE_PROPERTIES:
                self.img_props[key] = kwargs.pop(key)
        # Define one message for all fields.
        error_messages = {
            'incomplete': 'Missing values required for image crop (required: x, y, width, height).',
        }
        # Or define a different message for each field.
        fields = (
            ## HEREE IS CAUSING AN ERROR. SHOULD BE SCALEITIMAGEFORMFIELD???
            ScaleItImageFormField(
                error_messages={'incomplete': 'Please select an image to upload.'},
                required=kwargs.get('required'),
            ),
            FloatField(
                error_messages={'incomplete': 'Please eneter a starting x value for image crop.'},
                validators=[RegexValidator(r'^[0-9]+.[0-9]+$', 'Please eneter an x1 value for image crop.')],
                required=True,
            ),
            FloatField(
                validators=[RegexValidator(r'^[0-9]+.[0-9]+$', 'Please eneter a y1 value for image crop.')],
                required=True,
            ),
            FloatField(
                validators=[RegexValidator(r'^[0-9]+.[0-9]+$', 'Please eneter an x2 value for image crop.')],
                required=True,
            ),
            FloatField(
                validators=[RegexValidator(r'^[0-9]+.[0-9]+$', 'Please eneter a y2 value for image crop.')],
                required=True,
            ),
        )
        super(CropItImageFormField, self).__init__(
            error_messages=error_messages, fields=fields,
            require_all_fields=False, **kwargs
        )


    # Clean and resize image before compressing
    def clean(self, value):
        crop_props = {
            'x1': float(value[1]),
            'y1': float(value[2]),
            'x2': float(value[3]),
            'y2': float(value[4])
        }

        # Clean and resize image before calling self.compress
        self.crop_props = crop_props
        processed_value = utils.process_upload(value[0], self.img_props, self.crop_props)
        value[0] = processed_value
        return super(CropItImageFormField, self).clean(value)

    def compress(self, data_list):
        # data_list: list of all cleaned input values
        # Return: Cleaned image for save (scaled and cropped)
        return data_list[0]