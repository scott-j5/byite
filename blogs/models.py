from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
import math


# Create your models here.
class Tag(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Blog(models.Model):
    author = models.ForeignKey(User, on_delete=models.PROTECT)
    published = models.BooleanField(default=False)
    pubished_on = models.DateTimeField(default=None, null=True, blank=True)
    updated = models.DateTimeField(default=timezone.now())
    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.CharField(max_length=500)
    thumbnail = models.ImageField(default='blogs/thumbnails/default.jpg', upload_to='blogs/thumbnails')
    banner = models.ImageField(default='blogs/banners/default.jpg', upload_to='blogs/banners')
    content = models.TextField()
    views = models.IntegerField(default=0)
    tags = models.ManyToManyField(Tag)

    def __str__(self):
        return self.title

    @property
    def read_time(self):
        return math.ceil(len(str(self.content).split()) / 225)

    def increment_views(self):
        self.views = self.views + 1
        self.save(updated=False)

    def save(self, *args, **kwargs):
        if(kwargs.pop("updated", None)):
            self.updated = timezone.now()
        super().save(*args, **kwargs)


class Series(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150)


class SeriesAssignment(models.Model):
    series = models.ForeignKey(Series, on_delete=models.PROTECT)
    blog = models.ForeignKey(Blog, on_delete=models.PROTECT)
    entry_no = models.IntegerField()