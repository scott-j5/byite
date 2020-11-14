from django.db import models
from imageit.models import CropItImageField

# Create your models here.
class Project(models.Model):
    client = models.CharField(max_length=150)
    name = models.CharField(max_length=150)
    description = models.CharField(max_length=500)
    image = CropItImageField(max_width=1000, max_height=1000, quality=90, blank=True, null=True, upload_to='projects/images')

    def __str__(self):
        return f'{self.client} - { self.name}'