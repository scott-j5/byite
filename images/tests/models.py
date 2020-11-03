from django.db import models

# Create your models here.
from images.models import ScaleItImageField, CropItImageField

class TestScaleItModel(models.Model):
    def get_upload_path(instance, filename):
        return f'tests/{filename}'

    name = models.TextField(max_length=100, default='no_value')
    image = ScaleItImageField(max_width=100, max_height=100, null=True, blank=True, upload_to=get_upload_path)


class TestCropItModel(models.Model):
    image = CropItImageField()