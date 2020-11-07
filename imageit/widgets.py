from django.forms.widgets import MultiWidget, ClearableFileInput


class ScaleItImageWidget(ClearableFileInput):
    template_name = 'imageit/widgets/scale_it_widget.html'
    initial_text = 'Current'
    
    class Media:
        css = {"all": ('/static/imageit/css/scaleit.css',),}
        js = ('/static/imageit/js/imageit.js',)


class ServerCropItImageWidget(MultiWidget):
    template_name = 'imageit/widgets/crop_it_widget.html'

    def __init__(self, *args, **kwargs):
        super(ServerCropItImageWidget, self).__init__(*args, **kwargs)

    def decompress(self, value):
        return [value, 0, 0, 0, 0]

    class Media:
        pass
        #css = {"all": ('imageit/css/cropit.css')}
        #js = {}


# Include js that set x1, y1, x2, y2
class CropItImageWidget(ClearableFileInput):
    template_name = 'imageit/widgets/crop_it_widget.html'
    
    class Media:
        pass
        #css = {"all": ('imageit/css/cropit.css')}
        #js = {'imageit/js/cropper.js', 'imageit/js/imageit.js'}