from django.contrib import admin
from app.admin import site

from .models import Blog, Series, SeriesAssignment, Tag

# Register your models here.
admin.site.register(Blog)
admin.site.register(Series)
admin.site.register(SeriesAssignment)
admin.site.register(Tag)