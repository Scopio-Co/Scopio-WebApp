from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status
from .serializers import UserSerializer, ProfileSettingsSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import parser_classes
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.exceptions import ValidationError
from django.urls import reverse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth import logout as django_logout
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.core.files.base import ContentFile
from PIL import Image, UnidentifiedImageError
from PIL import features as pil_features
from pathlib import Path
import io
import logging
from .models import UserProfile

logger = logging.getLogger(__name__)

AUTH_COOKIE_NAMES = ("access", "refresh", "accessToken", "refreshToken", "jwt_access", "jwt_refresh")


def _set_no_cache_headers(response):
    """Prevent browser/proxy reuse of user-scoped auth responses across accounts."""
    response["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
    response["Pragma"] = "no-cache"
    response["Expires"] = "0"
    response["Vary"] = "Authorization, Cookie"
    return response


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
    # Avoid exposing a 500 for a discovery endpoint if URL names change.
    try:
        register_url = request.build_absolute_uri(reverse("register"))
    except Exception:
        register_url = request.build_absolute_uri("/api/user/register/")

    try:
        token_url = request.build_absolute_uri(reverse("token_obtain_pair"))
    except Exception:
        token_url = request.build_absolute_uri("/api/token/")

    try:
        refresh_url = request.build_absolute_uri(reverse("token_refresh"))
    except Exception:
        refresh_url = request.build_absolute_uri("/api/token/refresh/")

    return Response({
        "register": register_url,
        "token": token_url,
        "token_refresh": refresh_url,
        "notes": request.build_absolute_uri("/api/notes/"),
        "notes_delete": request.build_absolute_uri("/api/notes/delete/<id>/"),
        "users": request.build_absolute_uri("/api/users/")
    })


# ---- Cookie-based JWT auth helpers ----
def _auth_cookie_options():
    use_https = getattr(settings, 'USE_HTTPS', False)
    secure = (not settings.DEBUG) and use_https
    # SameSite=None requires Secure; for HTTP deployments use Lax.
    samesite = "None" if secure else "Lax"
    return {
        "secure": secure,
        "samesite": samesite,
        "path": "/",
        "domain": getattr(settings, 'SESSION_COOKIE_DOMAIN', None),
    }


def _set_auth_cookies(response, access_token: str | None, refresh_token: str | None):
    cookie_options = _auth_cookie_options()
    
    if access_token:
        # Set both canonical and legacy aliases to support existing clients.
        for cookie_name in ("access", "accessToken"):
            response.set_cookie(
                cookie_name,
                access_token,
                httponly=True,
                max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
                **cookie_options,
            )
    if refresh_token:
        for cookie_name in ("refresh", "refreshToken"):
            response.set_cookie(
                cookie_name,
                refresh_token,
                httponly=True,
                max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
                **cookie_options,
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
        cookie_refresh = (
            request.COOKIES.get("refresh")
            or request.COOKIES.get("refreshToken")
            or request.COOKIES.get("jwt_refresh")
        )
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
    refresh_token = (
        request.data.get("refresh")
        or request.COOKIES.get("refresh")
        or request.COOKIES.get("refreshToken")
        or request.COOKIES.get("jwt_refresh")
    )

    # Revoke refresh token when available to prevent replay after account switches.
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except (TokenError, AttributeError, Exception):
            # Continue logout even if token is already invalid/expired.
            pass

    # Clear Django session so SessionAuthentication cannot keep prior user authenticated.
    django_logout(request)
    response = JsonResponse({"detail": "logout successful"})
    cookie_options = _auth_cookie_options()

    # Clear all known auth cookie aliases to prevent stale credentials across account switches.
    for cookie_name in AUTH_COOKIE_NAMES:
        response.delete_cookie(
            cookie_name,
            path=cookie_options["path"],
            domain=cookie_options["domain"],
            samesite=cookie_options["samesite"],
            secure=cookie_options["secure"],
        )

    # Explicitly clear Django auth/session cookies as defense-in-depth.
    response.delete_cookie(
        settings.SESSION_COOKIE_NAME,
        path='/',
        domain=getattr(settings, 'SESSION_COOKIE_DOMAIN', None),
        samesite=settings.SESSION_COOKIE_SAMESITE,
        secure=settings.SESSION_COOKIE_SECURE,
    )
    response.delete_cookie(
        settings.CSRF_COOKIE_NAME,
        path='/',
        domain=getattr(settings, 'CSRF_COOKIE_DOMAIN', None),
        samesite=settings.CSRF_COOKIE_SAMESITE,
        secure=settings.CSRF_COOKIE_SECURE,
    )
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
    """Test auth: Returns info of authenticated user. Token validation endpoint."""
    # Extra guard: permission class should already enforce auth, but this keeps response stable.
    if not request.user or request.user.is_anonymous:
        return Response(
            {"authenticated": False, "error": "Not authenticated"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    logger.info(f"Auth status check: {getattr(request.user, 'email', 'unknown')} (ID: {request.user.id})")

    # Avoid bubbling DB/storage faults to a 500 response for this heartbeat endpoint.
    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        if created:
            logger.info(f"Created new profile for user {request.user.id}")
    except Exception as exc:
        logger.error("auth_status profile lookup failed for user %s: %s", request.user.id, str(exc), exc_info=True)
        profile = None

    profile_image_url = ''
    college = ''
    bio = ''
    if profile is not None:
        college = profile.college or ''
        bio = profile.bio or ''
        try:
            profile_data = ProfileSettingsSerializer.to_representation_for(
                user=request.user,
                profile=profile,
                request=request,
            )
            profile_image_url = profile_data.get('profile_image_url', '')
        except Exception as exc:
            logger.error("auth_status profile serialization failed for user %s: %s", request.user.id, str(exc), exc_info=True)

    response = Response({
        "authenticated": True,
        "user": {
            "id": request.user.id,
            "username": request.user.username,
            "email": getattr(request.user, 'email', ''),
            "first_name": request.user.first_name or '',
            "last_name": request.user.last_name or '',
            "college": college,
            "bio": bio,
            "profile_image_url": profile_image_url,
            "date_joined": request.user.date_joined,
        }
    }, status=status.HTTP_200_OK)
    return _set_no_cache_headers(response)


@api_view(["GET", "PATCH", "PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, FormParser, MultiPartParser])
def auth_profile(request):
    if not request.user or request.user.is_anonymous:
        return Response(
            {"error": "Authentication required"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    try:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        if created:
            logger.info(f"Created new profile for user {request.user.id}")
    except Exception as exc:
        logger.error("auth_profile profile lookup failed for user %s: %s", request.user.id, str(exc), exc_info=True)
        return Response(
            {"error": "Unable to load profile"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if request.method == "GET":
        try:
            data = ProfileSettingsSerializer.to_representation_for(
                user=request.user,
                profile=profile,
                request=request,
            )
        except Exception as exc:
            logger.error("auth_profile serialization failed for user %s: %s", request.user.id, str(exc), exc_info=True)
            data = {
                'full_name': request.user.get_full_name(),
                'username': request.user.username,
                'email': request.user.email,
                'college': profile.college or '',
                'bio': profile.bio or '',
                'profile_image_url': '',
            }

        response = Response(data, status=status.HTTP_200_OK)
        return _set_no_cache_headers(response)

    serializer = ProfileSettingsSerializer(
        data=request.data,
        partial=True,
        context={'request': request}
    )
    if not serializer.is_valid():
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    validated = serializer.validated_data

    try:
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
            else:
                if not pil_features.check('webp'):
                    logger.error('WebP encoder is unavailable in current runtime. Install libwebp and rebuild Pillow.')
                    return Response(
                        {
                            "errors": {
                                "profile_image": [
                                    "Server image encoder does not support WebP in this environment."
                                ]
                            }
                        },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

                try:
                    # Convert any uploaded image format (png/jpg/jpeg/gif/etc.) to real WebP before storage.
                    image_file.seek(0)
                    with Image.open(image_file) as img:
                        # Downscale large uploads for fast avatar rendering in navbar/settings.
                        # This prevents visible scanline-like loading from oversized source files.
                        max_avatar_size = (512, 512)
                        resampling = getattr(Image, 'Resampling', Image).LANCZOS
                        img.thumbnail(max_avatar_size, resampling)

                        if img.mode in ('RGBA', 'LA'):
                            img = img.convert('RGBA')
                        elif img.mode == 'P':
                            # Preserve transparency for palette images when possible.
                            if 'transparency' in img.info:
                                img = img.convert('RGBA')
                            else:
                                img = img.convert('RGB')
                        elif img.mode != 'RGB':
                            img = img.convert('RGB')

                        output = io.BytesIO()
                        img.save(
                            output,
                            format='WEBP',
                            quality=78,
                            optimize=True,
                            method=6,
                        )
                        output.seek(0)

                    base_name = Path(getattr(image_file, 'name', 'profile')).stem or 'profile'
                    webp_name = f"{base_name}.webp"
                    profile.profile_image.save(webp_name, ContentFile(output.read()), save=False)
                except (UnidentifiedImageError, OSError, ValueError):
                    return Response(
                        {"errors": {"profile_image": ["Invalid image file. Please upload a valid image."]}},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        profile.save()
    except ValidationError as exc:
        return Response({"errors": exc.detail}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        logger.error("auth_profile update failed for user %s: %s", request.user.id, str(exc), exc_info=True)
        return Response({"error": "Failed to update profile"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        response_data = ProfileSettingsSerializer.to_representation_for(
            user=request.user,
            profile=profile,
            request=request,
        )
    except Exception as exc:
        logger.error("auth_profile post-update serialization failed for user %s: %s", request.user.id, str(exc), exc_info=True)
        response_data = {
            'full_name': request.user.get_full_name(),
            'username': request.user.username,
            'email': request.user.email,
            'college': profile.college or '',
            'bio': profile.bio or '',
            'profile_image_url': '',
        }

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