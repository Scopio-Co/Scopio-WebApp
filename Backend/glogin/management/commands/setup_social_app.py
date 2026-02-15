from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
import os


class Command(BaseCommand):
    help = "Create or update the Google SocialApp using env vars"

    def handle(self, *args, **options):
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        name = os.getenv("GOOGLE_APP_NAME", "Google")

        if not client_id or not client_secret:
            self.stderr.write(
                self.style.ERROR(
                    "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment"
                )
            )
            return

        # Ensure Site exists and matches settings.SITE_ID
        site_id = getattr(settings, "SITE_ID", 1)
        site = Site.objects.get(pk=site_id)

        # Upsert SocialApp for Google
        app, created = SocialApp.objects.get_or_create(provider="google", name=name)
        app.client_id = client_id
        app.secret = client_secret
        app.save()

        # Attach site relation (many-to-many)
        if site not in app.sites.all():
            app.sites.add(site)

        action = "Created" if created else "Updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"{action} Google SocialApp '{name}' for site '{site.domain}'"
            )
        )