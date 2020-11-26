# Generated by Django 3.1.1 on 2020-11-12 08:04

from django.db import migrations
import imageit.models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0002_project_client'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='image',
            field=imageit.models.CropItImageField(blank=True, null=True, upload_to='projects/images'),
        ),
    ]