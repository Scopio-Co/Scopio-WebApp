from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import logout as django_logout
from rest_framework_simplejwt.tokens import RefreshToken
from urllib.parse import urlencode
import logging

logger = logging.getLogger(__name__)


def _auth_cookie_options():
    use_https = getattr(settings, 'USE_HTTPS', False)
    secure = (not settings.DEBUG) and use_https
    samesite = 'None' if secure else 'Lax'
    return {
        'secure': secure,
        'samesite': samesite,
        'path': '/',
        'domain': getattr(settings, 'SESSION_COOKIE_DOMAIN', None),
    }


def _resolve_frontend_url(request):
    session_frontend = (request.session.get('oauth_frontend_origin') or '').rstrip('/')
    allowed_origins = set(getattr(settings, 'FRONTEND_ALLOWED_ORIGINS', []))
    if session_frontend and session_frontend in allowed_origins:
        return session_frontend
    return settings.FRONTEND_URL

def google_start(request):
    frontend_origin = (request.GET.get('frontend_origin') or '').strip().rstrip('/')
    allowed_origins = set(getattr(settings, 'FRONTEND_ALLOWED_ORIGINS', []))
    if frontend_origin and frontend_origin in allowed_origins:
        request.session['oauth_frontend_origin'] = frontend_origin

    next_url = '/glogin/google/finalize/'
    return redirect(f'/accounts/google/login/?process=login&next={next_url}')

def google_finalize(request):
    try:
        logger.info(f"google_finalize called. User authenticated: {request.user.is_authenticated}")
        logger.info(f"Session key: {request.session.session_key}")
        
        if not request.user.is_authenticated:
            frontend = _resolve_frontend_url(request)
            logger.error("User not authenticated in google_finalize")
            return redirect(f"{frontend}/?error=google_auth_failed")

        # Save session explicitly before generating tokens
        request.session.save()
        
        logger.info(f"Generating tokens for user: {request.user.email}")
        refresh = RefreshToken.for_user(request.user)
        access = str(refresh.access_token)
        refresh_str = str(refresh)

        frontend = settings.FRONTEND_URL
        # Use query params instead of hash for better reliability
        redirect_url = f"{frontend}/?access={access}&refresh={refresh_str}"
        logger.info(f"Redirecting to: {redirect_url}")
        
        response = redirect(redirect_url)
        cookie_options = _auth_cookie_options()

        # Keep OAuth and password login cookie names aligned.
        response.set_cookie(
            'access',
            access,
            max_age=1800,  # 30 minutes
            httponly=True,
            **cookie_options,
        )
        response.set_cookie(
            'refresh',
            refresh_str,
            max_age=86400,  # 1 day
            httponly=True,
            **cookie_options,
        )

        # Compatibility aliases for older clients.
        response.set_cookie('accessToken', access, max_age=1800, httponly=True, **cookie_options)
        response.set_cookie('refreshToken', refresh_str, max_age=86400, httponly=True, **cookie_options)

        # Clear legacy non-HttpOnly OAuth cookie names if present.
        response.delete_cookie(
            'jwt_access',
            path=cookie_options['path'],
            domain=cookie_options['domain'],
            samesite=cookie_options['samesite'],
            secure=cookie_options['secure'],
        )
        response.delete_cookie(
            'jwt_refresh',
            path=cookie_options['path'],
            domain=cookie_options['domain'],
            samesite=cookie_options['samesite'],
            secure=cookie_options['secure'],
        )
        return response
    except Exception as e:
        logger.exception(f"Error in google_finalize: {str(e)}")
        frontend = _resolve_frontend_url(request)
        error_message = str(e).replace('#', '%23').replace('&', '%26')
        return redirect(f"{frontend}/?error=auth_error&message={error_message}")

def google_logout(request):
    django_logout(request)
    frontend = _resolve_frontend_url(request)
    return redirect(frontend)

