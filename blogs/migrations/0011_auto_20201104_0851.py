# Generated by Django 3.1.1 on 2020-11-04 08:51

import blogs.models
from django.db import migrations
import imageit.models


class Migration(migrations.Migration):

    dependencies = [
        ('blogs', '0010_auto_20201028_1940'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blog',
            name='banner',
            field=imageit.models.CropItImageField(blank=True, null=True, upload_to=blogs.models.Blog.get_upload_path),
        ),
        migrations.AlterField(
            model_name='blog',
            name='thumbnail',
            field=imageit.models.ScaleItImageField(blank=True, null=True, upload_to=blogs.models.Blog.get_upload_path),
        ),
    ]
