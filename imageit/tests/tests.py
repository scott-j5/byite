from django.core.exceptions import ValidationError
from django.core.files import File
from django.urls import reverse
from django.test import TestCase
from PIL import Image
from .models import TestScaleItModel, TestCropItModel


# Create your tests here.

# Test Models

# Test fields

# Test widgets


# Test Server side scaling of images
class ScaleItTestCase(TestCase):
    def setUp(self):
        with open('images/tests/static/img/test1000x1000.png', 'rb') as img:
            TestScaleItModel.objects.create(name='test1', image=File(img))
        
        with open('images/tests/static/img/test_svg.svg', 'rb') as img:
            TestScaleItModel.objects.create(name='test2', image=File(img))

    def test_image_scaled(self):
        img1 = TestScaleItModel.objects.get(name='test1').image
        with Image.open(img1) as img_open:
            self.assertEqual(img_open.size, (100,100))
        
        img2 = TestScaleItModel.objects.get(name='test2').image
        # Check image was uploaded

        with open('images/tests/static/img/test_svg_js.svg', 'rb') as img:
            self.raises(ValidationError, TestScaleItModel.objects.create(name='test3', image=File(img)))


        # Check invalid file such as pdf


# Test Server side cropping of images
# Test Server side scaling of images
class CropItTestCase(TestCase):
    def setup(self):
        pass

    def test_image_cropped(self):
        pass
    # Upload image
    # Convert to PIL image and assert image size = props (x2 - x1 , y2 - y1)
