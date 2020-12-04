from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.utils.translation import gettext_lazy as _
from io import BytesIO
from os import SEEK_END
from PIL import Image
from re import search, IGNORECASE, MULTILINE
from xml.etree.ElementTree import fromstring

from .settings import (
    IMAGEIT_DEFAULT_IMAGE_PROPS,
    IMAGEIT_ACCEPTED_CONTENT_TYPES,
    IMAGEIT_MAX_UPLOAD_SIZE_MB,
    IMAGEIT_SVG_CONTENT_TYPE
)


def process_upload(data, img_props=None, crop_props=None):
    # Check to see if a file was uploaded
    if isinstance(data, InMemoryUploadedFile):
        # Check to make sure image is an accepted content type
        if data.content_type in IMAGEIT_ACCEPTED_CONTENT_TYPES:

            # Check to make sure that the file mime type actually matches file extension
            if validate_mime(data):

                # If file size exceeds max allowed, Raise error. Else convert to Django object
                if data.size > (IMAGEIT_MAX_UPLOAD_SIZE_MB * 1024 * 1024):
                    raise ValidationError(_(f"Uploaded file exceeds maximum allowed size of {IMAGEIT_MAX_UPLOAD_SIZE_MB}MB."), code="file_invalid")
                else:
                    # Process vector or raster depending on file type
                    if data.content_type == IMAGEIT_SVG_CONTENT_TYPE:
                        data = process_vector(data)
                    else:
                        data = process_raster(data, img_props, crop_props)
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


def process_raster(image, img_props=None, crop_props=None):
    # Image: InMemoryUploadedFile
    if img_props == None or len(img_props) == 0:
        img_props = IMAGEIT_DEFAULT_IMAGE_PROPS

    # Returns InMemoryUploadedFile
    scaled_image = resize(image, img_props, crop_props)
    return scaled_image


def contains_javascript(image):
    image.file.seek(0)
    file_str = str(image.file.read(), encoding='UTF-8')
    
    # ------------------------------------------------
    # Handles JavaScript nodes and stringified nodes.
    # ------------------------------------------------
    # Filters against "script" / "if" / "for" within node attributes.
    pattern = r'(<\s*\bscript\b.*>.*)|(.*\bif\b\s*\(.?={2,3}.*\))|(.*\bfor\b\s*\(.*\))'

    found = search(
        pattern=pattern,
        string=file_str,
        flags=IGNORECASE | MULTILINE
    )

    if found is not None:
        return True

    parsed_xml = (
        (attribute, value)
        for elm in fromstring(file_str).iter()
        for attribute, value in elm.attrib.items()
    )

    for key, val in parsed_xml:
        if '"' in val or "'" in val:
            return True

    # It is (hopefully) safe.
    return False


#Implement logic to validate mime type of file?
def validate_mime(image):
    return True


def resize(image, img_props, crop_props):
    # Image: InMemoryUploadedFile
    # Open image and store format/metadata.
    pil_image = Image.open(image)
    pil_image_format, pil_image_info = pil_image.format, pil_image.info
    if img_props.get('quality'):
        pil_image_info['quality'] = img_props.get('quality')

    # Force PIL to load image data.
    pil_image.load()

    if crop_props and all(x in crop_props for x in ("x1", "y1", "x2", "y2")):
        if crop_props.get('x1') - crop_props.get('x2') == 0 or crop_props.get('y1') - crop_props.get('y2') == 0:
            raise ValidationError(_(f"{image.name} Cropped image cannot have a width or height or zero!"))
        else:
            pil_image = crop(pil_image, crop_props)
    elif crop_props and any(x in crop_props for x in ("x1", "y1", "x2", "y2")):
        raise ValidationError(_("Incomplete Cooridinates for cropping were recieved! Requires: x1, y1, x2, y2"))
    pil_image = scale(pil_image, img_props)

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
        box = [
            int(x1),
            int(y1),
            int(x2),
            int(y2)
        ]
        # Crop the image
        image = image.crop(box)
    return image


def scale(image, props):
    #Image: PIL Image

    max_width, max_height, upscale = (props.get('max_width'), props.get('max_height'), props.get('upscale'))
    image_width, image_height = map(float, image.size)

    #Calculate scale ratio ensuring no side is longer than max dimenstions
    scale = min(max_width / image_width, max_height / image_height)

    # Scale image if image must be scaled down or if upscale is set to true
    if scale < 1.0 or (scale > 1.0 and upscale):
        scaled_width = image_width * scale
        scaled_height = image_height * scale
    
        image = image.resize(
            (int(scaled_width), int(scaled_height)),
            resample=Image.ANTIALIAS
        )
    return image

