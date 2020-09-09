from django.http import JsonResponse
from django.shortcuts import render
import time
from projects.models import Project
from .models import Subscriber

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
    if request.method == 'POST':
        data["message"] = "Success!"
        subscriber = Subscriber()
        subscriber.email = request.POST.get('email')
    return JsonResponse(data)


def unsubscribe(request):
    data = {}
    data["message"] = "Success!"
    return JsonResponse(data)


def error_403(request, exception):
    context = {
        "error_code": 403,
        "error_text": "It looks like you've ended up somewhere you're not allowed. Sorry",
    }
    return render(request, 'app/error.html', context)


def error_404(request, exception):
    context = {
        "error_code": 404,
        "error_text": "The page you were looking for could not be found.",
    }
    return render(request, 'app/error.html', context)


def error_500(request):
    context = {
        "error_code": 500,
        "error_text": "It looks like there was an error somewhere.",
    }
    return render(request, 'app/error.html', context)