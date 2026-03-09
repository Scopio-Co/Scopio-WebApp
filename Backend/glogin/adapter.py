from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialApp
from django.contrib.auth import get_user_model
from django.core.exceptions import MultipleObjectsReturned
from django.shortcuts import redirect
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class SocialAdapter(DefaultSocialAccountAdapter):
    def get_app(self, request, provider, client_id=None):
        """
        Override to gracefully handle missing SocialApp configurations.
        
        1. First tries to get from database (preferred for production)
        2. Falls back to settings-based config if database lookup fails
        3. This allows flexibility in how credentials are managed
        """
        try:
            from django.contrib.sites.models import Site
            site = Site.objects.get_current()
            
            logger.debug(f"[OAuth] get_app: provider={provider}, site_domain={site.domain}")
            
            # Try to get from database first
            app = SocialApp.objects.filter(
                provider=provider,
                sites=site
            ).distinct().first()
            
            if app:
                logger.info(f"✓ [OAuth] Found SocialApp in DB for {provider}: {app.name}")
                return app
            
            logger.warning(f"⚠️ [OAuth] SocialApp not found in DB for {provider} on site {site.domain}")
            
        except Exception as e:
            logger.warning(f"⚠️ [OAuth] Database lookup for SocialApp failed: {str(e)}")
        
        # Fallback: Create a temporary SocialApp from settings-based config
        logger.info(f"[OAuth] Attempting fallback to settings-based config for {provider}")
        try:
            app = self._get_app_from_settings(provider)
            if app:
                logger.info(f"✓ [OAuth] Using settings-based config for {provider}")
                return app
        except Exception as e:
            logger.error(f"❌ [OAuth] Settings-based config failed: {str(e)}")
        
        # If we get here, something is badly misconfigured
        error_msg = (
            f"Could not load OAuth configuration for '{provider}'. "
            f"Ensure either: (1) SocialApp is configured in Django admin, or "
            f"(2) SOCIALACCOUNT_PROVIDERS['{provider}']['APP'] is set in settings.py"
        )
        logger.error(f"❌ [OAuth] {error_msg}")
        raise SocialApp.DoesNotExist(error_msg)
    
    def _get_app_from_settings(self, provider):
        """
        Create a temporary SocialApp from SOCIALACCOUNT_PROVIDERS settings.
        This allows credentials to be managed via environment variables
        without requiring database setup.
        """
        try:
            provider_config = settings.SOCIALACCOUNT_PROVIDERS.get(provider, {})
            app_config = provider_config.get('APP', {})
            
            if not app_config.get('client_id'):
                logger.warning(f"[OAuth] No client_id in settings for {provider}")
                return None
            
            # Create a minimal app-like object on the fly
            # This isn't saved to DB, just used for this request
            class SettingsApp:
                def __init__(self, provider, config):
                    self.provider = provider
                    self.name = config.get('name', f'{provider.title()} OAuth')
                    self.client_id = config.get('client_id', '')
                    self.secret = config.get('secret', '')
                    self.key = config.get('key', '')
            
            app = SettingsApp(provider, app_config)
            logger.debug(f"[OAuth] Created temporary app from settings for {provider}")
            return app
        
        except Exception as e:
            logger.error(f"[OAuth] Failed to create app from settings: {str(e)}")
            return None
    
    def get_callback_url(self, request, app):
        """
        Generate the OAuth callback URL dynamically from the incoming request.
        
        This ensures both localhost development and production work correctly without
        requiring manual Site configuration updates.
        
        Important: This URL must match what's configured in your OAuth provider
        (Google Cloud Console). For flexible setup, configure it there as a wildcard
        or add both http://localhost:8000 and https://yourserver.com versions.
        """
        try:
            # Use the incoming request's scheme and host for maximum flexibility
            scheme = 'https' if request.is_secure() else request.scheme
            host = request.get_host()
            
            # Get provider from app (handle both DB app and settings-based app)
            provider = getattr(app, 'provider', 'google')
            
            callback_url = f"{scheme}://{host}/accounts/{provider}/login/callback/"
            logger.debug(f"[OAuth] Callback URL for {host}: {callback_url}")
            
            return callback_url
        except Exception as e:
            logger.error(f"❌ [OAuth] Error generating callback URL: {str(e)}")
            # Fallback to a safe default
            return "http://localhost:8000/accounts/google/login/callback/"
    
    def is_auto_signup_allowed(self, request, sociallogin):
        """Allow auto-signup for social OAuth logins to streamline the flow."""
        try:
            provider = sociallogin.account.provider
            email = sociallogin.account.extra_data.get('email', 'unknown')
            logger.info(f"✓ [OAuth] Auto-signup allowed for {provider}: {email}")
            return True
        except Exception as e:
            logger.warning(f"⚠️ [OAuth] Error in auto-signup check: {str(e)}")
            return True  # Fail open to allow signup

    def pre_social_login(self, request, sociallogin):
        """Auto-link social login to an existing user by email to prevent
        the intermediate 3rdparty signup/confirm page.

        If a user with the same email already exists, attach this
        social account to that user so the flow can continue directly
        to login and our finalize redirect.
        """
        try:
            # If the social account is already linked, nothing to do
            if sociallogin.is_existing:
                logger.info(f"✓ Social login already linked: {sociallogin.user.email}")
                return

            # Try to determine the email from the social data
            email = None
            if sociallogin.user and getattr(sociallogin.user, "email", None):
                email = sociallogin.user.email
            elif sociallogin.account and hasattr(sociallogin.account, "extra_data"):
                email = sociallogin.account.extra_data.get("email")

            if not email:
                logger.warning("⚠ No email found in social login data")
                return

            logger.info(f"Checking for existing user with email: {email}")

            User = get_user_model()
            try:
                existing_user = User.objects.get(email__iexact=email)
                logger.info(f"✓ Found existing user: {existing_user.email}")
            except User.DoesNotExist:
                logger.info(f"→ New OAuth user will be created: {email}")
                return
            except MultipleObjectsReturned:
                # Handle duplicate email issue - keep the newest one, delete older duplicates
                logger.warning(f"⚠ Multiple users found with email: {email}")
                users = User.objects.filter(email__iexact=email).order_by('-date_joined')
                existing_user = users.first()
                duplicate_ids = list(users.exclude(id=existing_user.id).values_list('id', flat=True))
                users.exclude(id=existing_user.id).delete()
                logger.info(f"Cleaned up {len(duplicate_ids)} duplicate users")

            # Check if the existing user has a password (form signup) or not (OAuth only)
            has_password = existing_user.has_usable_password()
            if has_password:
                logger.info(f"✓ Form-based account found, linking Google OAuth to {existing_user.email}")
            else:
                logger.info(f"✓ OAuth-only account found, linking Google to {existing_user.email}")
            
            # Link this social login to the existing user; login will proceed
            # without showing the 3rdparty signup page
            sociallogin.connect(request, existing_user)
            logger.info(f"✓ Social login connected to user: {existing_user.email}")
        except Exception as e:
            logger.exception(f"Error in pre_social_login: {str(e)}")

    def authentication_error(self, request, provider_id, error=None, exception=None, extra_context=None):
        """Override to redirect authentication errors to frontend instead of showing Django page"""
        logger.error(f"Authentication error for {provider_id}: {error}")
        from django.conf import settings
        frontend_url = settings.FRONTEND_URL
        error_message = str(error) if error else "Authentication failed"
        return redirect(f"{frontend_url}/?error=auth_failed&message={error_message}")

    def is_open_for_signup(self, request, sociallogin):
        """Always allow signup for social logins"""
        return True
