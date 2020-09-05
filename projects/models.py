from django.db import models

# Create your models here.
class Projects(models.Model):
    name = models.CharField(max_length=150)
    description = models.CharField(max_length=500)
    image = models.ImageField(default='projects/images/default.jpg', upload_to='projects/images')