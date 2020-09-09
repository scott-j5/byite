from django.contrib import admin

# Register your models here.
class CustomAdminSite(admin.AdminSite):
    login_template = 'app/login.html'

site = CustomAdminSite()