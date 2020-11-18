from django import forms
from django.contrib.contenttypes.forms import BaseGenericInlineFormSet
from .models import DropZoneIt
from .widgets import DropZoneItWidget, DropZoneItInlineWidget 


class DropZoneFormField(forms.FileField):
    widget = DropZoneItWidget


class DropZoneItFormSet(BaseGenericInlineFormSet):
    object_field = ''

    def __init__(self, *args, **kwargs):
        super(DropZoneItFormSet, self).__init__(*args, **kwargs)
        print(self.__dict__)

class DropZoneItForm(forms.ModelForm):
    class Meta:
        model = DropZoneIt
        fields = ['file', 'content_type', 'object_id']

    # Find a way to pass required data to widget