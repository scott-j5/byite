from django.contrib.contenttypes.models import ContentType
from django.core.serializers import serialize
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404

from .forms import DropZoneItForm
from .models import DropZoneIt

# Create your views here.

# Make sure user has permissions to add to parent

# View for ajax submission - return values
def dropzoneit_list(request, **kwargs):
    response = {}
    content_type_id = kwargs.get('ctype', False)
    object_id = kwargs.get('object_id', False)

    content_type = ContentType.objects.get(id=content_type_id)

    if request.user.has_perm(f'{content_type.app_label}.view_{content_type.model}'):
        objs = DropZoneIt.objects.filter(content_type=content_type, object_id=object_id)
        data = []
        for obj in objs:
            tmpObj = {
                "model": "dropzoneit.dropzoneit",
                "id": obj.id,
                "content_type": f"{obj.content_type.app_label}.{obj.content_type.model}",
                "content_type_id": obj.content_type.id,
                "name": obj.file.name,
                "url": obj.file.url,
                "removable": request.user.has_perm(f'{content_type.app_label}.delete_{content_type.model}')
            }
            data.append(tmpObj)

        response = {
            "status_code": 200,
            "message": "Success",
            "data": data,
        }
    else:
        response = {
            "status_code": 403,
            "message": "Permission Denied",
            "data": {}
        }
    return JsonResponse(response, status=response['status_code'])


def dropzoneit_get(request, **kwargs):
    response = {}
    pk = kwargs.get('pk', False)

    obj = get_object_or_404(DropZoneIt, id=pk)

    if request.user.has_perm(f'{obj.content_type.app_label}.view_{obj.content_type.model}'):
        data = {
                "model": "dropzoneit.dropzoneit",
                "content_type": "app.model.id",
                "name": obj.file.name,
                "url": obj.file.url,
                "removable": request.user.has_perm(f'{obj.content_type.app_label}.delete_{obj.content_type.model}')
            }

        response = {
            "status_code": 200,
            "message": "Success",
            "data": data,
        }
    else:
        response = {
            "status_code": 403,
            "message": "Permission Denied",
            "data": {}
        }
    return JsonResponse(response, status=response['status_code'])


def dropzoneit_post(request):
    response = {}

    if request.method == 'POST':
            form = DropZoneItForm(request.POST, request.FILES)
            print(request.POST)
            if form.is_valid():
                obj = form.save(commit=False)
                if request.user.has_perm(f'{obj.content_type.app_label}.create_{obj.content_type.model}'):
                    obj.save()
                    data = {
                        "model": "dropzoneit.dropzoneit",
                        "id": obj.id,
                        "content_type": f"{obj.content_type.app_label}.{obj.content_type.model}",
                        "content_type_id": obj.content_type.id,
                        "name": obj.file.name,
                        "url": obj.file.url,
                        "removable": request.user.has_perm(f'{obj.content_type.app_label}.delete_{obj.content_type.model}')
                    }
                    response = {
                        "status_code": 200,
                        "message": "Success",
                        "data": data,
                    }
                else:
                    response = {
                        "status_code": 403,
                        "message": "Permission Denied",
                        "data": {}
                    }
            else:
                response ={
                    "status_code": 400,
                    "message": "Invalid Post",
                    "data": {}
                }
    else:
        response = {
                "status_code": 405,
                "message": "Method Not Allowed",
                "data": {}
            }
    return JsonResponse(response, status=response['status_code'])


def dropzoneit_delete(request, **kwargs):
    response = {}
    object_id = kwargs.get('pk', False)

    obj = get_object_or_404(DropZoneIt, id=object_id)

    if request.user.has_perm(f'{obj.content_type.app_label}.delete_{obj.content_type.model}'):
        obj.delete()
        data = {}
        response = {
            "status_code": 200,
            "message": "Success",
            "data": data,
        }
    else:
        response = {
            "status_code": 403,
            "message": "Permission Denied",
            "data": {}
        }
    return JsonResponse(response, status=response['status_code'])