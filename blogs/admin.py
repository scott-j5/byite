from django.contrib import admin

from .models import Blog, BlogImage, Series, SeriesAssignment, Tag
from dropzoneit.admin import DropZoneItAdmin, DropZoneItInline


# Register your models here.
##admin.site.register(Blog)
admin.site.register(Series)
admin.site.register(SeriesAssignment)
admin.site.register(Tag)
admin.site.register(BlogImage)
# admin.site.register(Blog, DropZoneItAdmin)