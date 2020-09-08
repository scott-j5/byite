from django.core import serializers
from django.http import JsonResponse
from django.db.models import Q
from django.shortcuts import render
from django.views.generic import ListView, DetailView

from .models import Blog, Tag, Series

# Create your views here.
class BlogDetail(DetailView):
    model = Blog

    def get_object(self, **kwargs):
        obj = super().get_object(**kwargs)
        obj.increment_views()
        return obj


def blog_list(request):
    context = {}
    if not request.user.is_anonymous:
        context["blogs"] = Blog.objects.filter(Q(published=True) | Q(author=request.user))
    else:
        context["blogs"] = Blog.objects.filter(published=True)
    context["tags"] = Tag.objects.all()
    return render(request, 'blogs/blog_list.html', context)


def get_blogs_json(request):
    params = request.GET.dict()
    params['tags'] = [x for x in params['tags'].split(',') if len(x) >= 1]
    response = serializers.serialize('json', Blog.objects.filter(**Blog.get_filter(params)))
    return JsonResponse(response, safe=False)

def get_blogs(request):
    context = {}
    params = request.GET.dict()
    params['tags'] = [x for x in params['tags'].split(',') if len(x) >= 1]
    
    if not request.user.is_anonymous:
        context["blogs"] = Blog.objects.filter(Q(published=True) | Q(author=request.user))
    else:
        context["blogs"] = Blog.objects.filter(published=True)
    context["blogs"] = context["blogs"].filter(**Blog.get_filter(params)).distinct()
    return render(request, 'blogs/blog_card_list.html', context)