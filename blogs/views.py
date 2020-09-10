from django.core import serializers
from django.http import JsonResponse
from django.db.models import Q
from django.shortcuts import render
from django.views.generic import ListView, DetailView
from markdownx.utils import markdownify

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
    params = request.GET.dict()
    if request.GET.get('tags'):
        params['tags'] = [x for x in params['tags'].split(',') if len(x) >= 1]
    context["blogs"] = Blog.dict_filter(params)
    if not request.user.is_anonymous:
        context["blogs"] = context["blogs"].filter(Q(published=True) | Q(author=request.user))
    else:
        context["blogs"] = context["blogs"].filter(published=True)
    context["tags"] = Tag.objects.all()
    return render(request, 'blogs/blog_list.html', context)


def get_blogs_json(request):
    params = request.GET.dict()
    if request.GET.get('tags'):
        params['tags'] = [x for x in params['tags'].split(',') if len(x) >= 1]
    blogs = Blog.dict_filter(params)
    if not request.user.is_anonymous:
        blogs = blogs.filter(Q(published=True) | Q(author=request.user)).distinct()
    else:
        blogs = blogs.filter(published=True).distinct()
    response = serializers.serialize('json', blogs)
    return JsonResponse(response, safe=False)


def get_blogs(request):
    context = {}
    params = request.GET.dict()
    if request.GET.get('tags'):
        params['tags'] = [x for x in params['tags'].split(',') if len(x) >= 1]
    context["blogs"] = Blog.dict_filter(params)
    if not request.user.is_anonymous:
        context["blogs"] = context["blogs"].filter(Q(published=True) | Q(author=request.user)).distinct()
    else:
        context["blogs"] = context["blogs"].filter(published=True).distinct()
    return render(request, 'blogs/blog_card_list.html', context)