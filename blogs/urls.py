from django.contrib import admin
from django.urls import path, include

from .views import blog_list, BlogDetail

urlpatterns = [
    path('', blog_list, name='blog-list'),
    path('blog/<slug:slug>/', BlogDetail.as_view(), name='blog-detail'),
]
