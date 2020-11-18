from django.urls import path

from .views import dropzoneit_list, dropzoneit_get, dropzoneit_post, dropzoneit_delete


urlpatterns = [
    path('list/<int:ctype>/<int:object_id>/', dropzoneit_list, name='dzit-list'),
    path('get/<int:pk>/', dropzoneit_get, name='dzit-get'),
    path('post/', dropzoneit_post, name='dzit-post'),
    path('delete/<int:pk>/', dropzoneit_delete, name='dzit-delete'),
]
