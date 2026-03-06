from django.conf import settings
from django.core.files.storage import default_storage

from .models import UserProfile


def get_default_profile_image_url(request=None):
    default_blob_name = getattr(settings, 'DEFAULT_PROFILE_IMAGE_BLOB', 'defaults/profileDefault.webp')
    try:
        default_url = default_storage.url(default_blob_name)
    except Exception:
        default_image_path = f"/{settings.STATIC_URL.strip('/')}/api/profileDefault.webp"
        default_url = request.build_absolute_uri(default_image_path) if request else default_image_path

    if request and default_url.startswith('/'):
        return request.build_absolute_uri(default_url)
    return default_url


def get_profile_image_url(profile, request=None):
    if profile and profile.profile_image:
        image_url = profile.profile_image.url
        if request and image_url.startswith('/'):
            return request.build_absolute_uri(image_url)
        return image_url
    return get_default_profile_image_url(request)


def get_user_profile_image_url(user, request=None):
    profile = UserProfile.objects.filter(user=user).only('profile_image').first()
    return get_profile_image_url(profile, request)
