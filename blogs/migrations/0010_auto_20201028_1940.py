# Generated by Django 3.1.1 on 2020-10-28 19:40

import blogs.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blogs', '0009_auto_20201027_2235'),
    ]

    operations = [
        migrations.AlterField(
            model_name='blog',
            name='banner',
            field=models.ImageField(blank=True, null=True, upload_to=blogs.models.Blog.get_upload_path),
        ),
        migrations.AlterField(
            model_name='blog',
            name='thumbnail',
            field=models.ImageField(blank=True, null=True, upload_to=blogs.models.Blog.get_upload_path),
        ),
    ]
