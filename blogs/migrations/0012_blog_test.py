# Generated by Django 3.1.1 on 2020-11-12 10:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('blogs', '0011_auto_20201104_0851'),
    ]

    operations = [
        migrations.AddField(
            model_name='blog',
            name='test',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='blogs.series'),
        ),
    ]
