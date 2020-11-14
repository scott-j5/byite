from django.contrib import admin
from markdownx.admin import MarkdownxModelAdmin

from .models import Blog, BlogImage, Series, SeriesAssignment, Tag
from dropzoneit.admin import DropZoneItAdmin, DropZoneItInLine


class DropAndMarkdownAdmin(DropZoneItAdmin, MarkdownxModelAdmin):
    pass

# Register your models here.
##admin.site.register(Blog)
admin.site.register(Series)
admin.site.register(SeriesAssignment)
admin.site.register(Tag)
admin.site.register(BlogImage)
admin.site.register(Blog, DropAndMarkdownAdmin)