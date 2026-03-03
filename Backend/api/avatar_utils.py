import base64
from django.conf import settings


def get_default_profile_image_url(request=None):
    default_image_path = f"/{settings.STATIC_URL.strip('/')}/api/profileDefault.webp"
    return request.build_absolute_uri(default_image_path) if request else default_image_path


def get_profile_image_url(profile, request=None):
    if profile and profile.profile_image:
        content_type = profile.profile_image_content_type or 'image/png'
        encoded = base64.b64encode(profile.profile_image).decode('ascii')
        return f"data:{content_type};base64,{encoded}"
    return get_default_profile_image_url(request)


def get_user_profile_image_url(user, request=None):
    profile = getattr(user, 'profile', None)
    return get_profile_image_url(profile, request)
