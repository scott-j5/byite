# Create your models here.
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models
from PIL import Image

from .fields import DropZoneItFormField


# Not used in admin but maybe in front end
class DropZoneItField(GenericRelation):
    # Dictionary containing propeties for cropping or scaling image

    def __init__(self, generic_relation=None, *args, **kwargs):
        if generic_relation == None:
            generic_relation = DropZoneIt
        super(DropZoneItField, self).__init__(generic_relation, *args, **kwargs)


    def formfield(self, **kwargs):
        # Update form field class used and pass kwargs to be used when instantiating
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


class DropZoneIt(models.Model):
    file = models.FileField()
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    #Additional identifier for use case with multiple dropzones in one model
    object_field = models.CharField(max_length=100, null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return self.file.name