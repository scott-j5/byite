from django.db import models
from django.contrib.auth.models import User

# Create your models here.
##class Socials(models.Model):
##    name = models.CharField(max_length=100)
##    icon = models.ImageField()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default='profile_pics/default.jpg', upload_to='profile_pics')
##    socials = models.ManyToManyField()

    @property
    def full_name(self):
        return f'{self.user.first_name} {self.user.last_name}'

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name}'