from django.db import models
from django.utils import timezone

# Create your models here.
class Subscriber(models.Model):
    email = models.EmailField()
    subscribed_on = models.DateTimeField()

    def __str__(self):
        return self.email


    def save(self, *args, **kwargs):
        self.subscribed_on = timezone.now()
        super().save(*args, **kwargs)