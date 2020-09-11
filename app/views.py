from django.contrib.auth.views import LoginView
from django.http import JsonResponse
from django.shortcuts import render
import time
from projects.models import Project
from .models import Subscriber

# Create your views here.
class Login(LoginView):
    template_name = 'app/login.html'


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
        if len(Subscriber.objects.filter(email__iexact=request.POST.get('email'))) >= 1:
            data["error"] = "Error: this email address is already subscribed!"
        else:
            subscriber = Subscriber()
            subscriber.email = request.POST.get('email')
            subscriber.save()
            data["success"] = f'Success! {subscriber.email} was subscribed'
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