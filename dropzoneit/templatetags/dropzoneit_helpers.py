from django import template
from django.contrib.contenttypes.models import ContentType

register = template.Library()

@register.filter
def dropzoneit_ctype(obj):
    if obj:
        return ContentType.objects.get_for_model(obj)
    else:
        return False