from django.http import JsonResponse
from django.shortcuts import render
import time
from projects.models import Project

# Create your views here.
def home_view(request):
    context = {
        "projects": Project.objects.all()
    }
    return render(request, 'app/home.html', context)


def contact_us(request):
    # Send mail and handle errors here
    data = {}
    data["message"] = "Success!"
    time.sleep(5)
    return JsonResponse(data)


def subscribe(request):
    data = {}
    data["message"] = "Success!"
    time.sleep(5)
    return JsonResponse(data)


def unsubscribe(request):
    data = {}
    data["message"] = "Success!"
    return JsonResponse(data)
