from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model
from django.core.exceptions import MultipleObjectsReturned
from django.shortcuts import redirect
from django.conf import settings
import logging
import os

logger = logging.getLogger(__name__)


class SocialAdapter(DefaultSocialAccountAdapter):
    def is_auto_signup_allowed(self, request, sociallogin):
        # Always allow auto-signup when coming from Google.
        # We rely on ACCOUNT settings (no username, email required) and
        # will avoid rendering the intermediate 3rdparty signup form.
        logger.info(f"✓ Auto-signup allowed for {sociallogin.account.provider}: {sociallogin.account.extra_data.get('email')}")
        return True

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
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        error_message = str(error) if error else "Authentication failed"
        return redirect(f"{frontend_url}/?error=auth_failed&message={error_message}")

    def is_open_for_signup(self, request, sociallogin):
        """Always allow signup for social logins"""
        return True
