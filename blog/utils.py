def _crop(im, target_x, target_y):
    """
    Crops the image to the given specifications.

    :param im: Instance of the image.
    :type im: PIL Image
    :param target_x: New x-axis.
    :type target_x: int
    :param target_y: New y-axis
    :type target_y: int
    :return: Cropped image.
    :rtype: PIL.Image
    """
    # Use integer values now.
    source_x, source_y = im.size
    # Difference between new image size and requested size.
    diff_x = int(source_x - min(source_x, target_x))
    diff_y = int(source_y - min(source_y, target_y))

    if diff_x or diff_y:
        # Center cropping (default).
        halfdiff_x, halfdiff_y = diff_x // 2, diff_y // 2
        box = [
            halfdiff_x,
            halfdiff_y,
            min(source_x, int(target_x) + halfdiff_x),
            min(source_y, int(target_y) + halfdiff_y)
        ]

        # Finally, crop the image!
        im = im.crop(box)
    return im


def _scale(im, x, y):
    """
    Scales the image to the given specifications.

    :param im: Instance of the image.
    :type im: PIL Image
    :param x: x-axis size.
    :type x: int
    :param y: y-axis size.
    :type y: int
    :return: Scaled image, re-sampled with anti-aliasing filter.
    :rtype: Image
    """
    im = im.resize(
        (int(x), int(y)),
        resample=Image.ANTIALIAS
    )
    return im


def scale_and_crop(image, size, crop=False, upscale=False, quality=None):
    """
    Modifies raster graphic images to the specifications.

    :param image: Raster graphic image.
    :type image: BytesIO
    :param size: New size.
    :type size: int
    :param crop: Perform cropping or not.
    :type crop: bool
    :param upscale: Whether or not to upscale the image.
    :type upscale: bool
    :param quality: Quality of the new image in DPI.
    :type quality: int
    :return: Raster graphic image modified to the given specifications.
    :rtype: BytesIO
    """
    # Open image and store format/metadata.
    image.open()
    im = Image.open(image)
    im_format, im_info = im.format, im.info
    if quality:
        im_info['quality'] = quality

    # Force PIL to load image data.
    im.load()

    source_x, source_y = map(float, im.size)
    target_x, target_y = map(float, size)

    if crop or not target_x or not target_y:
        scale = max(target_x / source_x, target_y / source_y)
    else:
        scale = min(target_x / source_x, target_y / source_y)

    # Handle one-dimensional targets.
    if not target_x:
        target_x = source_x * scale
    elif not target_y:
        target_y = source_y * scale

    if scale < 1.0 or (scale > 1.0 and upscale):
        im = _scale(im=im, x=source_x * scale, y=source_y * scale)

    if crop:
        im = _crop(im=im, target_x=target_x, target_y=target_y)

    # Close image and replace format/metadata, as PIL blows this away.
    im.format, im.info = im_format, im_info

    image.close()

    return im