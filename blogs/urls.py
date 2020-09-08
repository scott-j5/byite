from django.contrib import admin
from django.urls import path, include

from .views import blog_list, BlogDetail, get_blogs, get_blogs_json

urlpatterns = [
    path('', blog_list, name='blog-list'),
    path('get/', get_blogs, name='get-blogs'),
    path('get-json/', get_blogs_json, name='get-blogs-json'),
    path('blog/<slug:slug>/', BlogDetail.as_view(), name='blog-detail'),
]
