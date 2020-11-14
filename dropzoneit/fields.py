from django.contrib.admin.widgets import AdminFileWidget
from django.core.validators import RegexValidator
from django.forms import ModelChoiceField

from .widgets import DropZoneItWidget


class DropZoneItFormField(ModelChoiceField):
    # Change widget to custom one
    widget = DropZoneItWidget

    def __init__(self, widget=None, max_length=None, allow_empty_file=False, *args, **kwargs):
        # Stop Django admin from overriding widget with default AdminFileWidget
        # Occurs when instanctiating widgets from admin views
        # See : https://github.com/django/django/blob/master/django/contrib/admin/options.py
        #if isinstance(widget, AdminFileWidget):
        #    self.widget = ScaleItImageWidget
        
        super(DropZoneItFormField, self).__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        # Data: InMemoryUploadedFile (the uploaded file)
        # Returns a scaled InMemoryUploadedFile

        #data = utils.process_upload(data, self.img_props)
        return super(DropZoneItFormField, self).clean(data)