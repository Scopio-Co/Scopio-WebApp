import json
import os

from django.core.management.base import BaseCommand, CommandError
from django.contrib.sites.models import Site
from django.conf import settings
from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    help = """
    Configure and diagnose django-allauth Google OAuth provider.
    
    Usage:
        python manage.py setup_google_oauth [--check]  # Check current setup
        python manage.py setup_google_oauth --setup     # Set up from env/OAUTH.json
        python manage.py setup_google_oauth --client-id=... --client-secret=...  # Manual setup
    """

    def add_arguments(self, parser):
        parser.add_argument(
            "--check",
            dest="check",
            action="store_true",
            help="Check current OAuth configuration (default action if no flags provided)"
        )
        parser.add_argument(
            "--setup",
            dest="setup",
            action="store_true",
            help="Perform OAuth setup from environment or OAUTH.json"
        )
        parser.add_argument(
            "--client-id",
            dest="client_id",
            help="Override Google OAuth client ID"
        )
        parser.add_argument(
            "--client-secret",
            dest="client_secret",
            help="Override Google OAuth client secret"
        )
        parser.add_argument(
            "--site-domain",
            dest="site_domain",
            help="Site domain (e.g., localhost:8000 or 20.17.98.254.nip.io)"
        )
        parser.add_argument(
            "--app-name",
            dest="app_name",
            default="Google",
            help="SocialApp display name"
        )

    def handle(self, *args, **options):
        # Determine action
        check_only = options.get('check') or (
            not options.get('setup') and 
            not options.get('client_id') and 
            not options.get('client_secret')
        )
        
        if check_only:
            self._check_setup(*args, **options)
        else:
            self._perform_setup(*args, **options)

    def _check_setup(self, *args, **options):
        """Diagnose current OAuth configuration."""
        self.stdout.write("\n" + "="*70)
        self.stdout.write("GOOGLE OAUTH CONFIGURATION CHECK")
        self.stdout.write("="*70)
        
        try:
            # 1. Check environment variables
            self.stdout.write("\n[1] Environment Variables:")
            client_id_env = os.getenv('GOOGLE_CLIENT_ID', '')
            client_secret_env = os.getenv('GOOGLE_CLIENT_SECRET', '')
            
            if client_id_env:
                self.stdout.write(f"  ✓ GOOGLE_CLIENT_ID is set ({len(client_id_env)} chars)")
            else:
                self.stdout.write(self.style.WARNING("  ✗ GOOGLE_CLIENT_ID not set"))
            
            if client_secret_env:
                self.stdout.write(f"  ✓ GOOGLE_CLIENT_SECRET is set ({len(client_secret_env)} chars)")
            else:
                self.stdout.write(self.style.WARNING("  ✗ GOOGLE_CLIENT_SECRET not set"))
            
            # 2. Check OAUTH.json
            self.stdout.write("\n[2] OAUTH.json File:")
            oauth_path = os.path.join(os.getcwd(), "OAUTH.json")
            if os.path.exists(oauth_path):
                try:
                    with open(oauth_path, 'r', encoding='utf-8') as f:
                        oauth_data = json.load(f)
                    web = oauth_data.get('web', {})
                    if web.get('client_id'):
                        self.stdout.write(f"  ✓ OAUTH.json found with client_id ({len(web.get('client_id'))} chars)")
                    else:
                        self.stdout.write(self.style.WARNING("  ✗ OAUTH.json missing client_id"))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"  ✗ Error reading OAUTH.json: {e}"))
            else:
                self.stdout.write(f"  ℹ OAUTH.json not found at {oauth_path}")
            
            # 3. Check Django settings
            self.stdout.write("\n[3] Django Settings:")
            frontend_url = getattr(settings, 'FRONTEND_URL', 'not set')
            self.stdout.write(f"  • FRONTEND_URL: {frontend_url}")
            
            frontend_origins = getattr(settings, 'FRONTEND_ALLOWED_ORIGINS', [])
            self.stdout.write(f"  • FRONTEND_ALLOWED_ORIGINS: {frontend_origins}")
            
            allowed_hosts = getattr(settings, 'ALLOWED_HOSTS', [])
            self.stdout.write(f"  • ALLOWED_HOSTS: {allowed_hosts}")
            
            # 4. Check Site configuration
            self.stdout.write("\n[4] Django Sites Framework:")
            try:
                site = Site.objects.get_current()
                self.stdout.write(f"  ✓ Current site: {site.domain} (ID: {site.id})")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  ✗ Error getting current site: {e}"))
            
            # 5. Check SocialApp configuration
            self.stdout.write("\n[5] Django-allauth SocialApp:")
            try:
                google_apps = SocialApp.objects.filter(provider='google')
                if google_apps.exists():
                    for app in google_apps:
                        has_client = bool(app.client_id)
                        has_secret = bool(app.secret)
                        sites = list(app.sites.values_list('domain', flat=True))
                        
                        self.stdout.write(f"  ✓ Found SocialApp: {app.name}")
                        self.stdout.write(f"    - Client ID: {'set' if has_client else self.style.WARNING('NOT SET')} ({len(app.client_id) if has_client else 0} chars)")
                        self.stdout.write(f"    - Secret: {'set' if has_secret else self.style.WARNING('NOT SET')} ({len(app.secret) if has_secret else 0} chars)")
                        self.stdout.write(f"    - Linked sites: {sites if sites else self.style.WARNING('NONE')}")
                else:
                    self.stdout.write(self.style.WARNING("  ✗ No Google SocialApp configured in database"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  ✗ Error querying SocialApp: {e}"))
            
            # 6. Check SOCIALACCOUNT_PROVIDERS setting
            self.stdout.write("\n[6] SOCIALACCOUNT_PROVIDERS Setting:")
            providers = getattr(settings, 'SOCIALACCOUNT_PROVIDERS', {})
            google_config = providers.get('google', {})
            if google_config:
                app_config = google_config.get('APP', {})
                if app_config.get('client_id'):
                    self.stdout.write(f"  ✓ SOCIALACCOUNT_PROVIDERS['google']['APP'] configured")
                    self.stdout.write(f"    - Client ID: {len(app_config.get('client_id', ''))} chars")
                    self.stdout.write(f"    - Secret: {len(app_config.get('secret', ''))} chars")
                else:
                    self.stdout.write(self.style.WARNING("  ✗ SOCIALACCOUNT_PROVIDERS['google']['APP'] missing credentials"))
            else:
                self.stdout.write(self.style.WARNING("  ✗ SOCIALACCOUNT_PROVIDERS['google'] not configured"))
            
            # 7. Check OAuth URLs
            self.stdout.write("\n[7] OAuth URLs Configuration:")
            self.stdout.write("  Expected callback URLs:")
            self.stdout.write(f"    • Localhost: http://localhost:8000/accounts/google/login/callback/")
            self.stdout.write(f"    • Production: https://20.17.98.254.nip.io/accounts/google/login/callback/")
            self.stdout.write("\n  ⚠️  Ensure these URLs are configured in Google Cloud Console!")
            
            self.stdout.write("\n" + "="*70)
            self.stdout.write(self.style.SUCCESS("✓ Configuration check complete"))
            self.stdout.write("="*70 + "\n")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error during check: {e}"))

    def _perform_setup(self, *args, **options):
        """Configure Google OAuth from environment or OAUTH.json."""
        self.stdout.write("\n" + "="*70)
        self.stdout.write("GOOGLE OAUTH SETUP")
        self.stdout.write("="*70 + "\n")
        
        # Get credentials from multiple sources
        client_id = options.get('client_id') or os.getenv('GOOGLE_CLIENT_ID', '')
        client_secret = options.get('client_secret') or os.getenv('GOOGLE_CLIENT_SECRET', '')
        
        # Try OAUTH.json as fallback
        if not client_id or not client_secret:
            oauth_path = os.path.join(os.getcwd(), "OAUTH.json")
            if os.path.exists(oauth_path):
                try:
                    with open(oauth_path, 'r', encoding='utf-8') as f:
                        oauth_data = json.load(f)
                    web = oauth_data.get('web', {})
                    client_id = client_id or web.get('client_id')
                    client_secret = client_secret or web.get('client_secret')
                    self.stdout.write(f"✓ Loaded credentials from {oauth_path}")
                except Exception as e:
                    raise CommandError(f"Failed to read OAUTH.json: {e}")
        
        if not client_id or not client_secret:
            raise CommandError(
                "Missing client_id or client_secret. "
                "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables, "
                "or pass --client-id and --client-secret, or place OAUTH.json in project root."
            )
        
        # Get site domain
        site_domain = options.get('site_domain') or 'localhost:8000'
        app_name = options.get('app_name') or 'Google'
        
        # Update or create Site
        self.stdout.write(f"\nConfiguring site: {site_domain}")
        site, created = Site.objects.update_or_create(
            id=1,
            defaults={'domain': site_domain, 'name': site_domain}
        )
        status = "Created" if created else "Updated"
        self.stdout.write(f"✓ {status} site: {site.domain}")
        
        # Create or update SocialApp
        self.stdout.write(f"\nConfiguring SocialApp: {app_name}")
        social_app, created = SocialApp.objects.update_or_create(
            provider='google',
            name=app_name,
            defaults={'client_id': client_id, 'secret': client_secret}
        )
        status = "Created" if created else "Updated"
        self.stdout.write(f"✓ {status} SocialApp with credentials")
        
        # Link SocialApp to site
        social_app.sites.set([site])
        self.stdout.write(f"✓ Linked SocialApp to site")
        
        self.stdout.write("\n" + "="*70)
        self.stdout.write(self.style.SUCCESS("✓ OAuth setup complete!"))
        self.stdout.write("="*70)
        self.stdout.write("\nNext steps:")
        self.stdout.write("1. Restart your Django application")
        self.stdout.write("2. Visit: http://localhost:5173 (frontend)")
        self.stdout.write("3. Click 'Login with Google'")
        self.stdout.write("4. You should be redirected back to the frontend after OAuth completes")
        self.stdout.write("\nIf it still doesn't work:")
        self.stdout.write("• Run: python manage.py setup_google_oauth --check")
        self.stdout.write("• Review Backend/.env and ensure GOOGLE_CLIENT_ID/SECRET are set")
        self.stdout.write("• Check Google Cloud Console callback URLs\n")

