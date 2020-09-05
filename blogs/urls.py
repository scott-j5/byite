from django.contrib import admin
from django.urls import path, include

from .views import blog_list, blog

urlpatterns = [
    path('', include('app.urls')),
    path('blog/', include('app.urls')),
]
