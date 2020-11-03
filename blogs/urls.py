from django.contrib import admin
from django.urls import path

from .views import blog_list, BlogDetail, get_blogs, get_blogs_json, BlogImageUpload, blog_image

urlpatterns = [
    path('', blog_list, name='blog-list'),
    path('get/', get_blogs, name='get-blogs'),
    path('get-json/', get_blogs_json, name='get-blogs-json'),
    path('blog/<slug:slug>/', BlogDetail.as_view(), name='blog-detail'),
    path('blog/<slug:blog>/image/upload/', BlogImageUpload.as_view(), name='blog-image-upload'),
    path('blog/<slug:blog>/image/<int:pk>/', blog_image, name='blog-image'),
]
