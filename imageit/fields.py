from django.contrib.admin.widgets import AdminFileWidget
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.forms import MultiValueField, FileField, IntegerField
from django.forms.widgets import MultiWidget, NumberInput
from django.utils.translation import gettext_lazy as _

from . import utils
from .files import CropItInMemoryUploadedFile
from .widgets import ScaleItImageWidget, CropItImageWidget, ServerCropItImageWidget



class ScaleItImageFormField(FileField):
    img_props = {}
    # Change widget to custom one
    widget = ScaleItImageWidget

    def __init__(self, widget=None, max_length=None, allow_empty_file=False, img_props=None, *args, **kwargs):
        # Stop Django admin from overriding widget with default AdminFileWidget
        # Occurs when instanctiating widgets from admin views
        # See : https://github.com/django/django/blob/master/django/contrib/admin/options.py
        #if isinstance(widget, AdminFileWidget):
        #    self.widget = ScaleItImageWidget
        print(f'Widget Before: {widget}')
        if img_props:
            self.img_props = img_props
        super(ScaleItImageFormField, self).__init__(*args, **kwargs)
        print(f'Widget after: {self.widget}')
        

    def clean(self, data, initial=None):
        # Data: InMemoryUploadedFile (the uploaded image)

        # Returns a scaled InMemoryUploadedFile
        data = utils.process_upload(data, self.img_props)
        return super(ScaleItImageFormField, self).clean(data)




class CropItImageFormField(MultiValueField):
    widget = ServerCropItImageWidget(widgets=[ScaleItImageWidget, NumberInput, NumberInput, NumberInput, NumberInput,])

    def __init__(self, max_length=None, widget=None, img_props=None, **kwargs):
        if img_props:
            self.img_props = img_props
        # Define one message for all fields.
        error_messages = {
            'incomplete': 'Missing values required for image crop (required: x, y, width, height).',
        }
        # Or define a different message for each field.
        fields = (
            ## HEREE IS CAUSING AN ERROR. SHOULD BE SCALEITIMAGEFORMFIELD???
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
        super(CropItImageFormField, self).__init__(
            error_messages=error_messages, fields=fields,
            require_all_fields=False, **kwargs
        )


    # Clean and resize image before compressing
    def clean(self, value):
        crop_props = {
            'x1': value[1],
            'y1': value[2],
            'x2': value[3],
            'y2': value[4],
        }
    
        self.img_props.update(crop_props)
        processed_value = utils.process_upload(value[0], self.img_props)
        value[0] = processed_value
        # Clean and resize image before compressing
        # But then how to decompress
        # Make sure numbers are validated before assigning clean
        print(f'Cleaning Crop method! this is the value: {value}')
        return super(CropItImageFormField, self).clean(value)

    def compress(self, data_list):
        print(f'DATAAAAAA_LIST: {data_list}')

        processed_image = CropItInMemoryUploadedFile(
            file=data_list[0].file,
            field_name=None,
            name=data_list[0].name,
            content_type=data_list[0].content_type,
            size=data_list[0].size,
            charset=None,
        )

        # Needs to return a customImageField or in memory uploaded file
        # Needs to return single object to save
        return data_list[0]