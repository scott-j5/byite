# Generated by Django 3.1.1 on 2021-01-07 22:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('blogs', '0019_auto_20210107_2243'),
    ]

    operations = [
        migrations.RenameField(
            model_name='blog',
            old_name='contentNew',
            new_name='content',
        ),
    ]
