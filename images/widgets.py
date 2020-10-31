from django.forms.widgets import MultiWidget, ClearableFileInput


class CropItImageWidget(MultiWidget):
    def __init__(self, *args, **kwargs):
        super(CropItImageWidget, self).__init__(*args, **kwargs)

    def decompress(self, value):
        print(f'Decompress {value}')
        return [value, 0, 0, 0, 0]