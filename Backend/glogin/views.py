from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import logout as django_logout
from rest_framework_simplejwt.tokens import RefreshToken
import os
import logging

logger = logging.getLogger(__name__)

def google_start(request):
    next_url = '/glogin/google/finalize/'
    return redirect(f'/accounts/google/login/?process=login&next={next_url}')

def google_finalize(request):
    try:
        logger.info(f"google_finalize called. User authenticated: {request.user.is_authenticated}")
        logger.info(f"Session key: {request.session.session_key}")
        
        if not request.user.is_authenticated:
            frontend = os.getenv('FRONTEND_URL', 'http://localhost:5173')
            logger.error("User not authenticated in google_finalize")
            return redirect(f"{frontend}/?error=google_auth_failed")

        # Save session explicitly before generating tokens
        request.session.save()
        
        logger.info(f"Generating tokens for user: {request.user.email}")
        refresh = RefreshToken.for_user(request.user)
        access = str(refresh.access_token)
        refresh_str = str(refresh)

        frontend = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        # Use query params instead of hash for better reliability
        redirect_url = f"{frontend}/?access={access}&refresh={refresh_str}"
        logger.info(f"Redirecting to: {redirect_url}")
        
        response = redirect(redirect_url)
        # Ensure cookies are set with correct settings
        response.set_cookie(
            'jwt_access',
            access,
            max_age=1800,  # 30 minutes
            secure=not settings.DEBUG,
            httponly=False,
            samesite='None' if not settings.DEBUG else 'Lax'
        )
        response.set_cookie(
            'jwt_refresh',
            refresh_str,
            max_age=86400,  # 1 day
            secure=not settings.DEBUG,
            httponly=False,
            samesite='None' if not settings.DEBUG else 'Lax'
        )
        return response
    except Exception as e:
        logger.exception(f"Error in google_finalize: {str(e)}")
        frontend = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        error_message = str(e).replace('#', '%23').replace('&', '%26')
        return redirect(f"{frontend}/?error=auth_error&message={error_message}")

def google_logout(request):
    django_logout(request)
    frontend = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    return redirect(frontend)

