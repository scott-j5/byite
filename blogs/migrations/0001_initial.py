# Generated by Django 3.1.12 on 2021-06-12 13:39

import blogs.models
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import djrichtextfield.models
import imageit.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Blog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('published', models.BooleanField(default=False)),
                ('published_on', models.DateTimeField(blank=True, default=None, null=True)),
                ('updated', models.DateTimeField(default=django.utils.timezone.now)),
                ('title', models.CharField(max_length=150)),
                ('slug', models.SlugField(max_length=150, unique=True)),
                ('description', models.CharField(max_length=500)),
                ('thumbnail', imageit.models.ScaleItImageField(blank=True, max_height=250, max_width=250, null=True, quality=100, upload_to=blogs.models.Blog.get_upload_path, upscale=False)),
                ('banner', imageit.models.ScaleItImageField(blank=True, null=True, upload_to=blogs.models.Blog.get_upload_path)),
                ('views', models.IntegerField(default=0)),
                ('content', djrichtextfield.models.RichTextField(default='')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-published_on', 'title'],
            },
        ),
        migrations.CreateModel(
            name='Series',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('slug', models.SlugField(max_length=150)),
            ],
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='SeriesAssignment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('entry_no', models.IntegerField()),
                ('blog', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='blogs.blog')),
                ('series', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='blogs.series')),
            ],
        ),
        migrations.CreateModel(
            name='BlogImage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', imageit.models.ScaleItImageField(upload_to=blogs.models.BlogImage.get_upload_path)),
                ('blog', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='blogs.blog')),
            ],
        ),
        migrations.AddField(
            model_name='blog',
            name='tags',
            field=models.ManyToManyField(to='blogs.Tag'),
        ),
    ]
