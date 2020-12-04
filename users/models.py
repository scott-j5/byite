from django.db import models
from django.contrib.auth.models import User

from imageit.models import CropItImageField

# Create your models here.
##class Socials(models.Model):
##    name = models.CharField(max_length=100)
##    icon = models.ImageField()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = CropItImageField(max_width=300, max_height=300, quality=100, null=True, upload_to='profile_pics')

    @property
    def full_name(self):
        return f'{self.user.first_name} {self.user.last_name}'

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name}'