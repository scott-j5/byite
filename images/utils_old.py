from markdown import markdown
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from io import BytesIO
from os import path, SEEK_END, SEEK_SET
from PIL import Image
from re import search, IGNORECASE, MULTILINE

from .settings import IMAGES_DEFAULT_IMAGE_PROPS



def process_vector(image):
    if contains_javascript(image):
        raise ValidationError(_("File rejected: JavaScript was detected within the uploaded file."), code='file_invalid')
    return image


def process_raster(image, props=None):
    if props == None:
        props = IMAGES_DEFAULT_IMAGE_PROPS
    # Returns PIL Image
    scaled_image = resize(image, **props)
    # Save PIL object as bytes object to avoid having to open again to save
    extension = image.content_type.split('/')[-1].upper()
    bytes_image = BytesIO()
    scaled_image.save(bytes_image, extension)
    bytes_image.seek(0, SEEK_END)
    print(f'Scaled Image: {scaled_image.size}')
    print(f'Bytes Image: {bytes_image.tell()}')
    return bytes_image


def contains_javascript(image):
    data = str(image, encoding='UTF-8')
    # ------------------------------------------------
    # Handles JavaScript nodes and stringified nodes.
    # ------------------------------------------------
    # Filters against "script" / "if" / "for" within node attributes.
    pattern = r'(<\s*\bscript\b.*>.*)|(.*\bif\b\s*\(.?={2,3}.*\))|(.*\bfor\b\s*\(.*\))'

    found = search(
        pattern=pattern,
        string=data,
        flags=IGNORECASE | MULTILINE
    )

    if found is not None:
        return True

    # ------------------------------------------------
    # Handles JavaScript injection into attributes
    # for element creation.
    # ------------------------------------------------
    from xml.etree.ElementTree import fromstring

    parsed_xml = (
        (attribute, value)
        for elm in fromstring(data).iter()
        for attribute, value in elm.attrib.items()
    )

    for key, val in parsed_xml:
        if '"' in val or "'" in val:
            return True

    # It is (hopefully) safe.
    return False


def validate_mime(image):
    return True


def resize(image, x=None, y=None, max_width=IMAGES_DEFAULT_IMAGE_PROPS.get('max_width'), max_height=IMAGES_DEFAULT_IMAGE_PROPS.get('max_height'), quality=IMAGES_DEFAULT_IMAGE_PROPS.get('quality'), upscale=False):
    # Open image and store format/metadata.
    image.open()
    pil_image = Image.open(image)
    pil_image_format, pil_image_info = pil_image.format, pil_image.info
    if quality:
        pil_image_info['quality'] = quality

    # Force PIL to load image data.
    pil_image.load()
    
    if x is not None and y is not None:
        #Crop
        pil_image = crop(pil_image, x, y, max_width, max_height)
    else:
        #Scale
        pil_image = scale(pil_image, max_width, max_height, upscale)

    # Close image and replace format/metadata, as PIL blows this away.
    pil_image.format, pil_image.info = pil_image_format, pil_image_info

    image.close()
    return pil_image


def crop(image, x, y, width, height):
    image_width, image_height = image.size

    # Check if image actually requires cropping
    if (x == 0 and width == image_width) or (y == 0 and height == image_height):
        # If x coord == -1 then crop center
        left = ((image_width - width) // 2) if x == -1 else x
        right = min((width + x), image_width)
        # If y coord == -1 then crop center
        top = ((image_height - height) // 2) if y == -1 else y
        bottom = min((height + y), image_height)

        box = [
            left,
            top,
            right,
            bottom
        ]

        # Finally, crop the image!
        image = image.crop(box)
    return image


def scale(image, max_width, max_height, upscale):
    image_width, image_height = map(float, image.size)

    #Calculate scale ratio to ensure no side is longer than max dimenstions
    scale = min(max_width / image_width, max_height / image_height)

    # Scale image if image must be scaled down or upscale is set to true
    if scale < 1.0 or (scale > 1.0 and upscale):
        scaled_width = image_width * scale
        scaled_height = image_height * scale
    
        image = image.resize(
            (int(scaled_width), int(scaled_height)),
            resample=Image.ANTIALIAS
        )
    return image

