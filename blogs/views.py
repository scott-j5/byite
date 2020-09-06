from django.shortcuts import render
from django.views.generic import ListView, DetailView

from .models import Blog, Tag, Series

# Create your views here.
class BlogDetail(DetailView):
    model = Blog

    def get_object(self, **kwargs):
        obj = super().get_object(**kwargs)
        obj.increment_views()
        return obj

def blog_list(request):
    context = {
        "blogs": Blog.objects.all(),
        "tags": Tag.objects.all()
    }
    return render(request, 'blogs/blog_list.html', context)