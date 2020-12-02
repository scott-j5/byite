from blog import settings
from django.contrib.auth.views import LoginView
from django.contrib import messages
from django.core.mail import EmailMultiAlternatives
from django.http import JsonResponse, Http404
from django.shortcuts import render
from django.template.loader import get_template
import time
from projects.models import Project
from .forms import UnsubscribeForm, ContactUsForm
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
    if request.method == 'POST':
        form = ContactUsForm(request.POST)
        if form.is_valid():
            try:
                subject = f'{form.cleaned_data["name"]} has made an enquiry'
                text_content = f'{form.cleaned_data["name"]} has made an enquiry'
                template = get_template('app/contact_email_template.html')
                context = {
                    "name": form.cleaned_data["name"],
                    "email": form.cleaned_data["email"],
                    "phone": form.cleaned_data["phone"],
                    "service": form.cleaned_data["service"],
                    "message": form.cleaned_data["message"],
                }
                
                html_content = template.render(context)
                from_email = settings.EMAIL_HOST_USER
                to = "scottjames@byitegroup.com"
                msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                data["success"] = f'Success! Your enquiry has been sent.'
            except Exception as e:
                data["error"] = f"Error: An error occured during sending your enquiry!"
        else:
            data["error"] = "Error: Form invalid or incomplete!"
    else:
        raise Http404('Page not found')
    return JsonResponse(data)


def subscribe(request):
    data = {}
    if request.method == 'POST':
        if request.POST.get('email') == '':
            data["error"] = "Error: Email address must be provided!"
        elif len(Subscriber.objects.filter(email__iexact=request.POST.get('email'))) >= 1:
            data["error"] = "Error: This email address is already subscribed!"
        else:
            subscriber = Subscriber()
            subscriber.email = request.POST.get('email')
            subscriber.save()
            try:
                subject = 'Welcome to the byite community!'
                text_content = 'You have successfully been subscribed to the Byite blog.'
                template = get_template('app/signup_email_template.html')
                context = {
                    "email": subscriber.email,
                }
                html_content = template.render(context)
                from_email = settings.EMAIL_HOST_USER
                to = subscriber.email
                msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
                data["success"] = f'Success! {subscriber.email} was subscribed'
            except Exception as e:
                data["error"] = f"Error: {subscriber.email} was subscribed but an error occured during sending!"
    return JsonResponse(data)


def unsubscribe(request, *args, **kwargs):
    context = {
        'form': UnsubscribeForm()
    }
    if kwargs.get("email"):
        context["form"].fields["email"].initial = kwargs.get("email")
    if request.method == 'POST':
        context['form'] = UnsubscribeForm(request.POST)
        if context['form'].is_valid():
            try:
                subscriber = Subscriber.objects.get(email=context['form'].cleaned_data['email'])
                subscriber.delete()
                messages.success(request, f'{context["form"].cleaned_data["email"]} was successfully unsubscribed!')
                context['form'] = None
                return render(request, 'app/unsubscribe.html', context)
            except Exception as e:
                messages.error(request, f'Error: {e}')
    return render(request, 'app/unsubscribe.html', context)


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