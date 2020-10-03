from django.core import serializers
from django.http import JsonResponse, FileResponse
from django.db.models import Q
from django.shortcuts import render, redirect
from django.views.generic import ListView, DetailView
from django.views.generic.edit import BaseFormView
from markdownx.views import ImageUploadView

from .forms import BlogImageForm
from .models import Blog, BlogImage, Tag, Series

import os
import json

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


def blog_image(request, *args, **kwargs):
    if kwargs.get('pk'):
        try:
            blog_image = BlogImage.objects.get(id=kwargs.get('pk'))
        except Exception as e:
            print(e)
            return False
    return redirect(blog_image.image.url)


class BlogImageUpload(ImageUploadView):
    form_class = BlogImageForm

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        blog_id = [x for x in self.request.META.get('HTTP_REFERER').split('/') if len(x) > 0][-2]
        blog_slug = Blog.objects.get(id=blog_id)
        kwargs.update({'blog_slug': blog_slug.slug})
        return kwargs