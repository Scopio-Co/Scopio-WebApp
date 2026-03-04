from django.conf import settings
from django.urls import reverse


def get_default_profile_image_url(request=None):
    default_image_path = f"/{settings.STATIC_URL.strip('/')}/api/profileDefault.webp"
    return request.build_absolute_uri(default_image_path) if request else default_image_path


def get_profile_image_url(profile, request=None):
    if profile and profile.profile_image and getattr(profile, 'user_id', None):
        image_path = reverse('auth_profile_image', kwargs={'user_id': profile.user_id})
        return request.build_absolute_uri(image_path) if request else image_path
    return get_default_profile_image_url(request)


def get_user_profile_image_url(user, request=None):
    profile = getattr(user, 'profile', None)
    return get_profile_image_url(profile, request)
