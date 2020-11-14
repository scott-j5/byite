from django.urls import path

from .views import DropZoneItGet, DropZoneItPost, DropZoneItDelete
'''
urlpatterns = [
    path('get/<int:pk>/', DropZoneItGet.as_view(), name='dz-list'),
    path('post/<int:pk>/', DropZoneItPost.as_view(), name='dz-post'),
    path('delete/<int:pk>/', DropZoneItDelete.as_view(), name='dz-delete'),
]
'''