
from django.forms.widgets import ClearableFileInput


class DropZoneItInlineWidget(ClearableFileInput):
    template_name = 'dropzoneit/widgets/dropzoneit_inline_widget.html'

    def __init__(self, *args, **kwargs):
        super(DropZoneItInlineWidget, self).__init__(*args, **kwargs)

    class Media:
        css = {"all": ('/static/dropzoneit/css/dropzoneit.css',),}
        js = ('/static/dropzoneit/js/dropzoneit.js',)


class DropZoneItWidget(ClearableFileInput):
    template_name = 'dropzoneit/widgets/dropzoneit_widget.html'

    def __init__(self, *args, **kwargs):
        super(DropZoneItWidget, self).__init__(*args, **kwargs)

    class Media:
        css = {"all": ('/static/dropzoneit/css/dropzoneit.css',),}
        js = ('/static/dropzoneit/js/dropzoneit.js',)