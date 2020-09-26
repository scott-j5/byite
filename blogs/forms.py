import os
from django import forms
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.urls import reverse_lazy
from markdownx.forms import ImageForm
from markdownx.settings import MARKDOWNX_MEDIA_PATH

from .models import Blog, BlogImage


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
                blog_image.image = image
                blog_image.save()
            except Exception as e:
                return None
            return reverse_lazy('blog-image', args=[blog_image.blog.slug, blog_image.id])

        # If `commit is False`, return the path and in-memory image.
        image_data = namedtuple('image_data', ['path', 'image'])
        return image_data(path=full_path, image=image)
