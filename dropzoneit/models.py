# Create your models here.
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models
from PIL import Image

from .fields import DropZoneItFormField




class DropZoneItField(GenericRelation):
    # Dictionary containing propeties for cropping or scaling image

    def __init__(self, generic_relation=None, field=None, allowed_files=None, *args, **kwargs):
        self.field = field
        self.allowed_files = allowed_files

        if generic_relation == None:
            generic_relation = DropZoneIt
        super(DropZoneItField, self).__init__(generic_relation, *args, **kwargs)


    def pre_save(self, model_instance, add):
        print(f'{self} ..... {model_instance} .... {add}')
        if self.field:
            model_instance.object_field = self.field
            print(f'Field. Self.field {self.field}')
        return super(DropZoneItField, self).pre_save(model_instance, add)

    '''
    def formfield(self, **kwargs):
        # Update form field class used and pass kwargs to be used when instantiating
        print(f'Self {self.__dict__}')
        defaults = {
            'form_class': DropZoneItFormField,
            # Queryset
            # Default model choice field
            # line 984
            # https://github.com/django/django/blob/master/django/db/models/fields/related.py
        }
        defaults.update(kwargs)
        # Returns instanciated form_class class
        return super(DropZoneItField, self).formfield(**defaults)
    '''

class DropZoneIt(models.Model):
    file = models.FileField()
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    @property
    def content_type_str(self):
        return f'{self.content_type.app_label}.{self.content_type.model}.{self.object_id}.{self.id}'

    def __str__(self):
        return self.file.name