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
from django.contrib import admin
from django.urls import path, include
from .views import contact_us, home_view, subscribe, unsubscribe

urlpatterns = [
    path('contact-us/', contact_us, name='contact-us'),
    path('', home_view, name='home'),
    path('subscribe/', subscribe, name='subscribe'),
    path('unsubscribe/', unsubscribe, name='unsubscribe'),
    path('unsubscribe/<str:email>', unsubscribe, name='unsubscribe'),
]
