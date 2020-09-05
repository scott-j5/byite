from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

# Create your models here.
class Tag(models.Model):
    name = models.CharField(max_length=100)


class Blog(models.Model):
    author = models.ForeignKey(User, on_delete=models.PROTECT)
    published = models.BooleanField(default=False)
    pubished_on = models.DateTimeField(default=None, null=True, blank=True)
    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.CharField(max_length=500)
    thumnaill = models.ImageField(default='blogs/thumbnails/default.jpg', upload_to='blogs/thumbnails')
    banner = models.ImageField(default='blogs/banners/default.jpg', upload_to='blogs/banners')
    content = models.TextField()
    views = models.IntegerField(default=0)
    tag = models.ManyToManyField(Tag)

    @property
    def read_time(self):
        ##count spaces in content and estimate read time
        return 1

class Series(models.Model):
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150)


class SeriesAssignment(models.Model):
    series = models.ForeignKey(Series, on_delete=models.PROTECT)
    blog = models.ForeignKey(Blog, on_delete=models.PROTECT)
    entry_no = models.IntegerField()