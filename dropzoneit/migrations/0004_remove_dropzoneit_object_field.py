# Generated by Django 3.1.1 on 2020-11-16 23:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dropzoneit', '0003_auto_20201113_2345'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dropzoneit',
            name='object_field',
        ),
    ]
