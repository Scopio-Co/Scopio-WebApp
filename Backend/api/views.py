from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from .serializers import UserSerializer, ProfileSettingsSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import parser_classes
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from django.urls import reverse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
import logging
from .models import UserProfile

logger = logging.getLogger(__name__)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all() #all obj we gonna look after in order to create a user
    serializer_class = UserSerializer #serializer class - make sure what we need to create a user is valid
    permission_classes = [AllowAny]  # Allow anyone to create a user
    authentication_classes = []      # Do not attempt JWT auth on this endpoint

    def create(self, request, *args, **kwargs):
        """Override create to provide better error messages."""
        logger.info(f"User registration attempt: {request.data.get('username')} / {request.data.get('email')}")
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            logger.info(f"✓ User created: {serializer.data.get('username')} ({serializer.data.get('email')})")
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "message": "User created successfully",
                    "user": serializer.data
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            logger.error(f"✗ User creation failed: {str(e)}")
            # Return validation errors in a user-friendly format
            if hasattr(serializer, 'errors') and serializer.errors:
                return Response(
                    {
                        "errors": serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


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
    # Use 'Lax' in development (localhost), 'None' in production (with HTTPS)
    samesite = "Lax" if settings.DEBUG else "None"
    
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
        # First, check if the user exists and has a password
        username = request.data.get('username')
        password = request.data.get('password')
        
        logger.info(f"Login attempt: {username}")
        
        if username:
            # Try to find user by username or email
            from django.db.models import Q
            from allauth.socialaccount.models import SocialAccount
            
            try:
                user = User.objects.filter(
                    Q(username=username) | Q(email=username)
                ).first()
                
                if user and not user.has_usable_password():
                    # User exists but doesn't have a password (OAuth only)
                    has_google = SocialAccount.objects.filter(
                        user=user,
                        provider='google'
                    ).exists()
                    
                    if has_google:
                        return Response(
                            {
                                "detail": "This account was created with Google. "
                                "Please sign in using 'Continue with Google' instead."
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )
            except Exception:
                pass  # Continue with normal login flow
        
        # Proceed with normal JWT token generation
        try:
            resp = super().post(request, *args, **kwargs)
            access = resp.data.get("access")
            refresh = resp.data.get("refresh")
            logger.info(f"✓ Login successful: {username}")
            logger.info(f"✓ Tokens generated - access length: {len(access) if access else 0}, refresh length: {len(refresh) if refresh else 0}")
            
            # Return response WITH tokens in body AND set cookies
            response = Response({
                "access": access,
                "refresh": refresh,
                "detail": "login successful"
            }, status=status.HTTP_200_OK)
            
            # Also set cookies for backward compatibility
            _set_auth_cookies(response, access, refresh)
            return response
        except Exception as e:
            # Return user-friendly error messages
            logger.error(f"✗ Login failed: {username} - {str(e)}")
            return Response(
                {
                    "detail": "Invalid username or password. Please check your credentials and try again."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )


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
        response = JsonResponse({
            "detail": "refresh successful",
            "access": access,
            "refresh": refresh,
        })
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


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """Returns a CSRF token for the client."""
    return JsonResponse({"detail": "CSRF cookie set"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def auth_status(request):
    """Test auth: Returns info of authenticated user."""
    logger.info(f"Auth status check: {request.user.email}")
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    profile_data = ProfileSettingsSerializer.to_representation_for(
        user=request.user,
        profile=profile,
        request=request,
    )

    return Response({
        "authenticated": True,
        "user": {
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "college": profile.college,
            "bio": profile.bio,
            "profile_image_url": profile_data.get('profile_image_url', ''),
            "date_joined": request.user.date_joined,
        }
    }, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, FormParser, MultiPartParser])
def auth_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        data = ProfileSettingsSerializer.to_representation_for(
            user=request.user,
            profile=profile,
            request=request,
        )
        return Response(data, status=status.HTTP_200_OK)

    serializer = ProfileSettingsSerializer(
        data=request.data,
        partial=True,
        context={'request': request}
    )
    serializer.is_valid(raise_exception=True)
    validated = serializer.validated_data

    if 'full_name' in validated:
        full_name = validated.get('full_name', '').strip()
        parts = full_name.split(None, 1)
        request.user.first_name = parts[0] if parts else ''
        request.user.last_name = parts[1] if len(parts) > 1 else ''

    if 'username' in validated:
        request.user.username = validated.get('username')

    if 'full_name' in validated or 'username' in validated:
        request.user.save()

    if 'college' in validated:
        profile.college = validated.get('college', '').strip()

    if 'bio' in validated:
        profile.bio = validated.get('bio', '').strip()

    if 'profile_image' in validated:
        image_file = validated.get('profile_image')
        if image_file is None:
            profile.profile_image = None
            profile.profile_image_content_type = ''
            profile.profile_image_name = ''
        else:
            profile.profile_image = image_file.read()
            profile.profile_image_content_type = getattr(image_file, 'content_type', '') or 'image/png'
            profile.profile_image_name = getattr(image_file, 'name', '') or ''

    profile.save()

    response_data = ProfileSettingsSerializer.to_representation_for(
        user=request.user,
        profile=profile,
        request=request,
    )
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def users_list(request):
    """Debug endpoint: List all users in the database."""
    users = User.objects.all().values('id', 'username', 'email', 'date_joined', 'is_active')
    logger.info(f"Total users in DB: {users.count()}")
    return Response({
        "total_users": users.count(),
        "users": list(users)
    }, status=status.HTTP_200_OK)