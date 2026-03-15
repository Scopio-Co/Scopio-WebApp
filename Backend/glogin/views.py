from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import logout as django_logout
from rest_framework_simplejwt.tokens import RefreshToken
from urllib.parse import urlencode
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)


def _normalize_allowed_origin(value):
    return (value or '').strip().rstrip('/')


def _extract_allowed_origin(candidate, allowed_origins):
    normalized = _normalize_allowed_origin(candidate)
    if not normalized:
        return ''
    return normalized if normalized in allowed_origins else ''


def _origin_from_header_url(header_value):
    if not header_value:
        return ''
    try:
        parsed = urlparse(header_value)
        if parsed.scheme and parsed.netloc:
            return f"{parsed.scheme}://{parsed.netloc}"
    except Exception:
        return ''
    return ''


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
    allowed_origins = {
        _normalize_allowed_origin(origin)
        for origin in getattr(settings, 'FRONTEND_ALLOWED_ORIGINS', [])
        if _normalize_allowed_origin(origin)
    }

    session_frontend = _extract_allowed_origin(request.session.get('oauth_frontend_origin'), allowed_origins)
    if session_frontend:
        return session_frontend

    query_frontend = _extract_allowed_origin(request.GET.get('frontend_origin'), allowed_origins)
    if query_frontend:
        return query_frontend

    origin_header = _extract_allowed_origin(request.headers.get('Origin'), allowed_origins)
    if origin_header:
        return origin_header

    referer_origin = _extract_allowed_origin(_origin_from_header_url(request.headers.get('Referer')), allowed_origins)
    if referer_origin:
        return referer_origin

    return settings.FRONTEND_URL

def google_start(request):
    """
    Start the Google OAuth flow by persisting the frontend origin and then
    redirecting to allauth's Google OAuth endpoint.
    """
    try:
        allowed_origins = {
            _normalize_allowed_origin(origin)
            for origin in getattr(settings, 'FRONTEND_ALLOWED_ORIGINS', [])
            if _normalize_allowed_origin(origin)
        }
        
        # Get frontend origin from multiple fallback sources
        frontend_origin = _extract_allowed_origin(request.GET.get('frontend_origin'), allowed_origins)
        if not frontend_origin:
            frontend_origin = _extract_allowed_origin(request.headers.get('Origin'), allowed_origins)
        if not frontend_origin:
            frontend_origin = _extract_allowed_origin(_origin_from_header_url(request.headers.get('Referer')), allowed_origins)
        
        # Store in session for later retrieval in google_finalize
        if frontend_origin:
            request.session['oauth_frontend_origin'] = frontend_origin
            logger.debug(f"[OAuth] Frontend origin persisted in session: {frontend_origin}")
        else:
            logger.warning(f"[OAuth] Could not determine frontend origin. Will use FRONTEND_URL default.")
        
        # Save session before redirecting
        request.session.save()
        logger.info(
            "[OAuth] google_start session persisted: key=%s secure=%s samesite=%s host=%s",
            request.session.session_key,
            getattr(settings, 'SESSION_COOKIE_SECURE', None),
            getattr(settings, 'SESSION_COOKIE_SAMESITE', None),
            request.get_host(),
        )
        
        # Use an absolute URL that points directly at the backend so the
        # /accounts/google/login/ request always reaches Django-allauth.
        # A relative redirect would be resolved against the browser's current
        # origin (e.g. the Vercel frontend domain) and any CDN/proxy that
        # does not forward /accounts/* to the backend would silently serve
        # the React SPA instead, looping the user back to the login page.
        backend_base = getattr(settings, 'BACKEND_URL', 'https://scopio.in').rstrip('/')
        next_url = '/glogin/google/finalize/'
        if frontend_origin:
            next_url = f"{next_url}?{urlencode({'frontend_origin': frontend_origin})}"
        oauth_url = f"{backend_base}/accounts/google/login/?{urlencode({'process': 'login', 'next': next_url})}"
        logger.info(f"[OAuth] Starting Google OAuth redirect to: {oauth_url}")
        
        return redirect(oauth_url)
        
    except Exception as e:
        logger.exception(f"❌ [OAuth] Error in google_start: {str(e)}")
        # Fallback to frontend error page
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://scopio-webapp.pages.dev')
        error_msg = str(e).replace(' ', '%20')[:100]
        return redirect(f"{frontend_url}/?error=oauth_start_failed&message={error_msg}")

def google_finalize(request):
    """
    Complete the Google OAuth flow by minting JWT tokens and redirecting to the frontend.
    
    This endpoint is called after Google OAuth is complete and the user is authenticated.
    The response includes JWT tokens (access + refresh) passed as query parameters.
    """
    try:
        logger.info(
            "[OAuth] google_finalize reached: user_auth=%s session_key=%s host=%s secure=%s xfp=%s has_session_cookie=%s",
            request.user.is_authenticated,
            request.session.session_key,
            request.get_host(),
            request.is_secure(),
            request.META.get('HTTP_X_FORWARDED_PROTO', ''),
            bool(request.COOKIES.get(getattr(settings, 'SESSION_COOKIE_NAME', 'sessionid'))),
        )
        
        # Check if user is authenticated
        if not request.user.is_authenticated:
            frontend = _resolve_frontend_url(request)
            error_msg = "User not authenticated after Google OAuth callback"
            logger.error(f"❌ [OAuth] {error_msg}")
            return redirect(f"{frontend}/?error=auth_failed&message={error_msg.replace(' ', '%20')}")
        
        # Get user details
        user_email = getattr(request.user, 'email', 'unknown')
        user_id = getattr(request.user, 'id', 'unknown')
        logger.info(f"[OAuth] ✓ User authenticated: {user_email} (ID: {user_id})")
        
        # Ensure session is saved before token generation
        request.session.save()
        logger.debug(f"[OAuth] Session saved before token generation")
        
        # Generate JWT tokens
        try:
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(request.user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            logger.info(f"[OAuth] ✓ JWT tokens generated for user {user_email}")
        except Exception as e:
            logger.error(f"❌ [OAuth] Failed to generate JWT tokens: {str(e)}")
            frontend = _resolve_frontend_url(request)
            error_msg = f"Token generation failed: {str(e)}"
            return redirect(f"{frontend}/?error=token_gen_failed&message={error_msg.replace(' ', '%20')}")
        
        # Resolve frontend URL with fallback chain
        frontend = _resolve_frontend_url(request)
        logger.info(f"[OAuth] Resolved frontend URL: {frontend}")
        
        # Build redirect URL with tokens as query parameters
        redirect_url = f"{frontend}/?{urlencode({'access': access_token, 'refresh': refresh_token})}"
        logger.debug(f"[OAuth] Redirect URL generated (tokens hidden for security)")
        
        # Create redirect response with httponly cookies for extra security
        response = redirect(redirect_url)
        cookie_options = _auth_cookie_options()
        
        # Set JWT tokens as httponly cookies (backup to query params)
        response.set_cookie(
            'access',
            access_token,
            max_age=1800,  # 30 minutes
            httponly=True,
            **cookie_options,
        )
        response.set_cookie(
            'refresh',
            refresh_token,
            max_age=86400,  # 1 day
            httponly=True,
            **cookie_options,
        )
        
        # Compatibility aliases for clients that check different names
        response.set_cookie('accessToken', access_token, max_age=1800, httponly=True, **cookie_options)
        response.set_cookie('refreshToken', refresh_token, max_age=86400, httponly=True, **cookie_options)

        logger.info(
            "[OAuth] Response cookies set: session_cookie_name=%s jwt_secure=%s jwt_samesite=%s",
            getattr(settings, 'SESSION_COOKIE_NAME', 'sessionid'),
            cookie_options.get('secure'),
            cookie_options.get('samesite'),
        )
        
        # Clean up deprecated cookies
        # NOTE: delete_cookie() doesn't accept 'secure' - only path, domain, samesite
        for cookie_name in ['jwt_access', 'jwt_refresh']:
            response.delete_cookie(
                cookie_name,
                path=cookie_options['path'],
                domain=cookie_options['domain'],
                samesite=cookie_options['samesite'],
            )
        
        logger.info(f"[OAuth] ✓ Redirecting user {user_email} to frontend: {frontend}")
        return response
        
    except Exception as e:
        logger.exception(f"❌ [OAuth] Unexpected error in google_finalize: {str(e)}")
        try:
            frontend = _resolve_frontend_url(request)
            error_msg = str(e).replace('#', '%23').replace('&', '%26')[:100]  # Truncate long errors
            return redirect(f"{frontend}/?error=oauth_error&message={error_msg}")
        except Exception as e2:
            logger.error(f"❌ [OAuth] Even error handling failed: {str(e2)}")
            # Last resort: return JSON error
            from django.http import JsonResponse
            return JsonResponse(
                {'error': 'oauth_error', 'message': 'OAuth flow failed'},
                status=400
            )

def google_logout(request):
    django_logout(request)
    frontend = _resolve_frontend_url(request)
    return redirect(frontend)

