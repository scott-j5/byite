from django.core.files.uploadedfile import InMemoryUploadedFile

class CropItInMemoryUploadedFile(InMemoryUploadedFile):
    x = y = width = height = None

    def __init__(self, **kwargs):
        if kwargs.get('crop_props'):
            self.crop_props = kwargs.get('crop_props')
        '''
        for key, value in list(kwargs.items()):
            if key.lower() in ['x', 'y', 'max_width', 'max_height', 'quality']:
                self.crop_props[key.lower()] = kwargs.pop(key)
            elif key.lower in ['quality', 'content_types']:
                setattr(self, key.lower(), kwargs.pop(key))
        '''
        super(CropItInMemoryUploadedFile, self).__init__(**kwargs)