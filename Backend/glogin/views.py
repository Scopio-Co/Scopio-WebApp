from django.shortcuts import redirect
from django.conf import settings
from django.contrib.auth import logout as django_logout
from rest_framework_simplejwt.tokens import RefreshToken
import os

def google_start(request):
    next_url = '/glogin/google/finalize/'
    return redirect(f'/accounts/google/login/?process=login&next={next_url}')

def google_finalize(request):
    if not request.user.is_authenticated:
        frontend = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        return redirect(f"{frontend}/auth/callback?error=google_auth_failed")

    refresh = RefreshToken.for_user(request.user)
    access = str(refresh.access_token)
    refresh_str = str(refresh)

    frontend = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    return redirect(f"{frontend}/#access={access}&refresh={refresh_str}")

def google_logout(request):
    django_logout(request)
    frontend = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    return redirect(frontend)
