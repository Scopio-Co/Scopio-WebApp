import json
import os

from django.core.management.base import BaseCommand, CommandError
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    help = "Configure django-allauth Google provider using Backend/OAUTH.json"

    def add_arguments(self, parser):
        parser.add_argument("--client-id", dest="client_id", help="Override Google OAuth client id")
        parser.add_argument("--client-secret", dest="client_secret", help="Override Google OAuth client secret")
        parser.add_argument(
            "--site-domain",
            dest="site_domain",
            help="Site domain (e.g., 127.0.0.1:8000 or localhost:8000). Defaults to 127.0.0.1:8000",
        )
        parser.add_argument("--app-name", dest="app_name", default="Google", help="SocialApp name")

    def handle(self, *args, **options):
        # Default path where OAUTH.json exists in this repo
        oauth_path = os.path.join(os.getcwd(), "OAUTH.json")

        if not os.path.exists(oauth_path):
            raise CommandError(f"OAUTH.json not found at {oauth_path}")

        try:
            with open(oauth_path, "r", encoding="utf-8") as f:
                raw = json.load(f)
        except Exception as exc:
            raise CommandError(f"Failed to read OAUTH.json: {exc}")

        web = raw.get("web", {})
        client_id = options.get("client_id") or web.get("client_id")
        client_secret = options.get("client_secret") or web.get("client_secret")

        if not client_id or not client_secret:
            raise CommandError("Missing client_id or client_secret. Pass via flags or ensure OAUTH.json contains them.")

        site_domain = options.get("site_domain") or "127.0.0.1:8000"
        site_name = site_domain

        # Ensure Sites framework has the expected site with id=1 (SITE_ID=1 in settings)
        site, _created = Site.objects.get_or_create(id=1, defaults={"domain": site_domain, "name": site_name})
        if site.domain != site_domain:
            site.domain = site_domain
            site.name = site_name
            site.save()

        # Create or update the Google SocialApp
        app_name = options.get("app_name") or "Google"
        social_app, _ = SocialApp.objects.get_or_create(provider="google", name=app_name)
        social_app.client_id = client_id
        social_app.secret = client_secret
        social_app.save()

        # Link the SocialApp to the site
        social_app.sites.set([site])

        self.stdout.write(
            self.style.SUCCESS(
                f"Configured Google SocialApp '{social_app.name}' for site '{site.domain}'."
            )
        )
