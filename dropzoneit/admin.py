from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline

from .forms import DropZoneItForm, DropZoneItFormSet
from .models import DropZoneIt
from .widgets import DropZoneItInlineWidget


class DropZoneItInLine(GenericTabularInline):
    model = DropZoneIt
    formset = DropZoneItFormSet
    template = 'dropzoneit/dropzoneit_admin_inline.html'

    class Media:
        css = {"all": ('/static/dropzoneit/css/dropzoneit.css',),}
        js = ('/static/dropzoneit/js/dropzoneit.js',)


class DropZoneItAdmin(admin.ModelAdmin):
    def __init__(self, *args, **kwargs):
        super(DropZoneItAdmin, self).__init__(*args, **kwargs)
        if isinstance(self.inlines, list):
            self.inlines.append(DropZoneItInLine)
        else:
            self.inlines = [DropZoneItInLine]


# Register your models here.
admin.site.register(DropZoneIt)

