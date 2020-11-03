from django.forms.widgets import MultiWidget, ClearableFileInput

class ScaleItImageWidget(ClearableFileInput):
    template_name = 'images/scale_it_widget.html'

class ServerCropItImageWidget(MultiWidget):
    template_name = 'images/crop_it_widget.html'
    
    def __init__(self, *args, **kwargs):
        super(CropItImageWidget, self).__init__(*args, **kwargs)

    def decompress(self, value):
        print(f'Decompress {value}')
        return [value, 0, 0, 0, 0]

    class Media:
        js = {}

# Include js that set x1, y1, x2, y2
class CropItImageWidget(ClearableFileInput):
    template_name = 'images/crop_it_widget.html'
    class Media:
        js = {}