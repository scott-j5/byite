"""blog URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from app.views import error_403, error_404, error_500, Login
from django.contrib import admin
from django.urls import path, include
from markdownx import urls as markdownx


urlpatterns = [
    path('admin/login/', Login.as_view(), name='login'),
    path('admin/', admin.site.urls, name='admin'),
    path('', include('app.urls')),
    path('home/', include('app.urls')),
    path('blogs/', include('blogs.urls')),
    path('markdownx/', include('markdownx.urls')),
    path('dropzoneit/', include('dropzoneit.urls')),
]

handler403 = error_403
handler404 = error_404
handler500 = error_500