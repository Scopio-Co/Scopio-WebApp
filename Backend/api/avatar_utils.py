from django.conf import settings
from django.core.files.storage import default_storage

from .models import UserProfile


def get_default_profile_image_url(request=None):
    """Get default profile image URL with fallback handling."""
    default_blob_name = getattr(settings, 'DEFAULT_PROFILE_IMAGE_BLOB', 'defaults/profileDefault.webp')
    
    # Try Azure Storage first
    try:
        default_url = default_storage.url(default_blob_name)
        if request and default_url.startswith('/'):
            return request.build_absolute_uri(default_url)
        return default_url
    except Exception as e:
        # Fallback to static file
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f"Failed to get Azure Storage URL for default profile image: {str(e)}")
        
        try:
            default_image_path = f"/{settings.STATIC_URL.strip('/')}/api/profileDefault.webp"
            if request:
                return request.build_absolute_uri(default_image_path)
            return default_image_path
        except Exception as fallback_error:
            logger.error(f"Failed to build fallback URL: {str(fallback_error)}")
            # Return empty string as last resort
            return ''


def get_profile_image_url(profile, request=None):
    """Get profile image URL with comprehensive error handling."""
    import logging
    logger = logging.getLogger(__name__)
    
    # Check if profile exists and has an image
    if profile and profile.profile_image:
        try:
            image_url = profile.profile_image.url
            if request and image_url.startswith('/'):
                return request.build_absolute_uri(image_url)
            return image_url
        except Exception as e:
            logger.error(f"Failed to get profile image URL from Azure Storage: {str(e)}")
            # Fall through to default image
    
    # Return default image
    return get_default_profile_image_url(request)


def get_user_profile_image_url(user, request=None):
    profile = UserProfile.objects.filter(user=user).only('profile_image').first()
    return get_profile_image_url(profile, request)
