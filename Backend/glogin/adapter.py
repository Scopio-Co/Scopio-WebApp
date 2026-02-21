from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model
from django.core.exceptions import MultipleObjectsReturned


class SocialAdapter(DefaultSocialAccountAdapter):
    def is_auto_signup_allowed(self, request, sociallogin):
        # Always allow auto-signup when coming from Google.
        # We rely on ACCOUNT settings (no username, email required) and
        # will avoid rendering the intermediate 3rdparty signup form.
        return True

    def pre_social_login(self, request, sociallogin):
        """Auto-link social login to an existing user by email to prevent
        the intermediate 3rdparty signup/confirm page.

        If a user with the same email already exists, attach this
        social account to that user so the flow can continue directly
        to login and our finalize redirect.
        """
        # If the social account is already linked, nothing to do
        if sociallogin.is_existing:
            return

        # Try to determine the email from the social data
        email = None
        if sociallogin.user and getattr(sociallogin.user, "email", None):
            email = sociallogin.user.email
        elif sociallogin.account and hasattr(sociallogin.account, "extra_data"):
            email = sociallogin.account.extra_data.get("email")

        if not email:
            return

        User = get_user_model()
        try:
            existing_user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return
        except MultipleObjectsReturned:
            # Handle duplicate email issue - keep the newest one, delete older duplicates
            users = User.objects.filter(email__iexact=email).order_by('-date_joined')
            existing_user = users.first()
            users.exclude(id=existing_user.id).delete()

        # Link this social login to the existing user; login will proceed
        # without showing the 3rdparty signup page
        sociallogin.connect(request, existing_user)
