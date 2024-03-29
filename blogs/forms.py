import os
from collections import namedtuple
from django import forms
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.urls import reverse_lazy

from .models import Blog, BlogImage

'''
class BlogImageForm(ImageForm):
    image = forms.FileField()

    def __init__(self, **kwargs):
        if kwargs.get('blog_slug'):
            self.blog_slug = kwargs.pop('blog_slug')
        super(BlogImageForm, self).__init__(**kwargs)

    def _save(self, image, file_name, commit):
        """
        Final saving process, called internally after processing tasks are complete.

        :param image: Prepared image
        :type image: django.core.files.uploadedfile.InMemoryUploadedFile
        :param file_name: Name of the file using which the image is to be saved.
        :type file_name: str
        :param commit: If ``True``, the image is saved onto the disk.
        :type commit: bool
        :return: URL of the uploaded image ``commit=True``, otherwise a namedtuple
                 of ``(path, image)`` where ``path`` is the absolute path generated
                 for saving the file, and ``image`` is the prepared image.
        :rtype: str, namedtuple
        """
        # Defining a universally unique name for the file
        # to be saved on the disk.
        unique_file_name = self.get_unique_file_name(file_name)
        full_path = os.path.join(MARKDOWNX_MEDIA_PATH, unique_file_name)

        if commit:
            blog_image = BlogImage()
            try:
                blog_image.blog = Blog.objects.get(slug=self.blog_slug)
            except Blog.DoesNotExist:
                blog_image.blog = None

            try:
                blog_image.image = image
                blog_image.save()
            except Exception as e:
                return None
            return reverse_lazy('blog-image', args=[blog_image.blog.slug, blog_image.id])

        # If `commit is False`, return the path and in-memory image.
        image_data = namedtuple('image_data', ['path', 'image'])
        return image_data(path=full_path, image=image)
'''

class BlogImageForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        if kwargs.get('blog_slug'):
            self.blog_slug = kwargs.pop('blog_slug')
        super(BlogImageForm, self).__init__(**kwargs)

    def save(self, commit=True):
        instance = super().save(commit=False)

        if commit:
            try:
                instance.blog = Blog.objects.get(slug=self.blog_slug)
            except Blog.DoesNotExist:
                instance.blog = None

            instance = super().save()
            return reverse_lazy('blog-image', args=[instance.id])

        # If `commit is False`, return the path and in-memory image.
        image_data = namedtuple('image_data', ['path', 'image'])
        return image_data(path=instance.image.url, image=instance.image)

    class Meta:
        model = BlogImage
        fields = ['image',]