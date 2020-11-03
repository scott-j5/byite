from markdown import markdown
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from io import BytesIO
from os import path, SEEK_END, SEEK_SET
from PIL import Image
from re import search, IGNORECASE, MULTILINE

from .settings import (
    IMAGES_DEFAULT_IMAGE_PROPS,
    IMAGES_ACCEPTED_CONTENT_TYPES,
    IMAGES_MAX_UPLOAD_SIZE_MB,
    IMAGES_SVG_CONTENT_TYPE
)


def process_upload(data, img_props={}):
    print(img_props)
    # Check to see if a file was uploaded
    if data:
        # Check to make sure image is an accepted content type
        if data.content_type in IMAGES_ACCEPTED_CONTENT_TYPES:

            # Check to make sure that the file mime type actually matches file extension
            if validate_mime(data):

                # If file size exceeds max allowed, Raise error. Else convert to Django object
                if data.size > (IMAGES_MAX_UPLOAD_SIZE_MB * 1024 * 1024):
                    raise ValidationError(_(f"Uploaded file exceeds maximum allowed size of {IMAGES_MAX_UPLOAD_SIZE_MB}MB."), code="file_invalid")
                else:
                    # Process vector or raster depending on file type
                    if data.content_type == IMAGES_SVG_CONTENT_TYPE:
                        data = process_vector(data)
                    else:
                        data = process_raster(data, img_props)
            else:
                raise ValidationError(_("The extenstion of the uploaded file didn't match its actual type"), code='file_invalid')
        else:
            raise ValidationError(_("Unsupported image format. Must be .jpg, .png or .svg"), code='file_invalid')
    return data



def process_vector(image):
    # Image: InMemoryUploadedFile
    if contains_javascript(image):
        raise ValidationError(_("File rejected: JavaScript was detected within the uploaded file."), code='file_invalid')
    return image


def process_raster(image, props=None):
    # Image: InMemoryUploadedFile
    if props == None:
        props = IMAGES_DEFAULT_IMAGE_PROPS
    
    # Returns InMemoryUploadedFile
    scaled_image = resize(image, props)
    return scaled_image


def contains_javascript(image):
    # Image: InMemoryUploadedFile file
    data = str(image, encoding='UTF-8')

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


def resize(image, props):
    # Image: InMemoryUploadedFile
    # Open image and store format/metadata.

    pil_image = Image.open(image)
    pil_image_format, pil_image_info = pil_image.format, pil_image.info
    if props.get('quality'):
        pil_image_info['quality'] = props.get('quality')

    # Force PIL to load image data.
    pil_image.load()
    
    if all(x in props for x in ("x1", "y1", "x2", "y2")):
        pil_image = crop(pil_image, props)
    elif any(x in props for x in ("x1", "y1", "x2", "y2")):
        raise ValidationError(_("Incomplete Cooridinates for cropping were recieved! Requires: x1, y1, x2, y2"))
    pil_image = scale(pil_image, props)

    #if x is not None and y is not None:
        #Crop
    #    pil_image = crop(pil_image, x, y, max_width, max_height)
    #else:
        #Scale
    #    pil_image = scale(pil_image, max_width, max_height, upscale)

    # Close image and replace format/metadata, as PIL blows this away.
    pil_image.format, pil_image.info = pil_image_format, pil_image_info

    #Save pil image back to bytesio file
    extension = image.content_type.split('/')[-1].upper()
    bytes_image = BytesIO()
    pil_image.save(bytes_image, extension)
    bytes_image.seek(0, SEEK_END)
    
    image.file = bytes_image
    return image


def crop(image, props):
    # Image: PIL Image
    image_width, image_height = map(float, image.size)

    x1, y1, x2, y2 = (props.get('x1'), props.get('y1'), props.get('x2'), props.get('y2'),)
    # Check if image actually requires cropping
    if not((x1 == 0 and x2 == image_width) or (y1 == 0 and y2 == image_height)):
        # If x coord == -1 then crop center
        #left = ((image_width - width) // 2) if x == -1 else x
        #right = min((width + x), image_width)
        # If y coord == -1 then crop center
        #top = ((image_height - height) // 2) if y == -1 else y
        #bottom = min((height + y), image_height)

        box = [
            int(x1),
            int(y1),
            int(x2),
            int(y2)
        ]
        print(f'BOX: {box}')
        # Finally, crop the image!
        image = image.crop(box)
    return image


def scale(image, props):
    max_width, max_height, upscale = (props.get('max_width'), props.get('max_height'), props.get('upscale'))
    #Image: PIL Image
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

