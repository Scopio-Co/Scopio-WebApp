from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.urls import reverse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.http import JsonResponse


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all() #all obj we gonna look after in order to create a user
    serializer_class = UserSerializer #serializer class - make sure what we need to create a user is valid
    permission_classes = [AllowAny]  # Allow anyone to create a user
    authentication_classes = []      # Do not attempt JWT auth on this endpoint


@api_view(["GET"])  # Simple API root to help discover endpoints
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "register": request.build_absolute_uri(reverse("register")),
        "token": request.build_absolute_uri(reverse("token_obtain_pair")),
        "token_refresh": request.build_absolute_uri(reverse("token_refresh")),
        "notes": request.build_absolute_uri("/api/notes/"),
        "notes_delete": request.build_absolute_uri("/api/notes/delete/<id>/"),
        "users": request.build_absolute_uri("/api/users/")
    })


# ---- Cookie-based JWT auth helpers ----
def _set_auth_cookies(response, access_token: str | None, refresh_token: str | None):
    secure = not settings.DEBUG
    samesite = "Lax"
    if access_token:
        response.set_cookie(
            "access",
            access_token,
            httponly=True,
            secure=secure,
            samesite=samesite,
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
        )
    if refresh_token:
        response.set_cookie(
            "refresh",
            refresh_token,
            httponly=True,
            secure=secure,
            samesite=samesite,
            max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        )


class CookieTokenObtainPairView(TokenObtainPairView):
    """Login: issues JWTs and stores them in HttpOnly cookies."""

    def post(self, request, *args, **kwargs):
        resp = super().post(request, *args, **kwargs)
        access = resp.data.get("access")
        refresh = resp.data.get("refresh")
        # Build minimal response and set cookies
        response = JsonResponse({"detail": "login successful"})
        _set_auth_cookies(response, access, refresh)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """Refresh: rotates refresh token and updates cookies."""

    def post(self, request, *args, **kwargs):
        # If refresh token is in cookie, copy it into request data for serializer
        cookie_refresh = request.COOKIES.get("refresh")
        if cookie_refresh and not request.data.get("refresh"):
            request._full_data = request.data.copy()
            request._full_data["refresh"] = cookie_refresh

        resp = super().post(request, *args, **kwargs)
        access = resp.data.get("access")
        refresh = resp.data.get("refresh")
        response = JsonResponse({"detail": "refresh successful"})
        _set_auth_cookies(response, access, refresh)
        return response


@api_view(["POST"])
@permission_classes([AllowAny])
def cookie_logout(request):
    """Logout: clears auth cookies."""
    response = JsonResponse({"detail": "logout successful"})
    response.delete_cookie("access")
    response.delete_cookie("refresh")
    return response