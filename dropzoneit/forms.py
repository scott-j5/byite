from django import forms
from django.contrib.contenttypes.forms import BaseGenericInlineFormSet
from .models import DropZoneIt
from .widgets import DropZoneItWidget


class DropZoneItFormSet(BaseGenericInlineFormSet):
    object_field = ''
    
    def __init__(self, *args, **kwargs):
        super(DropZoneItFormSet, self).__init__(*args, **kwargs)
        import pprint
        pprint.pprint(self.__dict__)

    def get_queryset(self):
        if not hasattr(self, '_queryset'):
            qs = super(DropZoneItFormSet, self).get_queryset().filter(object_field=self.object_field)
            self._queryset = qs
        return self._queryset




class DropZoneItForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super(DropZoneItForm, self).__init__(*args, **kwargs)

    class Meta:
        model = DropZoneIt
        fields = ['file']
        widgets = {
            'file': DropZoneItWidget
        }

    # Find a way to pass required data to widget