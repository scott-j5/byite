from django.shortcuts import render

# Create your views here.
def blog(request):
    return render(request, 'blogs/blog.html')

def blog_list(request):
    return render(request, 'blogs/blog-list.html')