from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from django.conf import settings
import os


class Command(BaseCommand):
    help = 'Fix Site configuration for allauth'

    def handle(self, *args, **options):
        # Get or create the default site
        site_id = getattr(settings, 'SITE_ID', 1)
        site_domain = os.getenv('SITE_DOMAIN', 'scopio.in').strip() or 'scopio.in'
        site_name = os.getenv('SITE_NAME', 'Scopio').strip() or 'Scopio'
        
        try:
            site = Site.objects.get(id=site_id)
            self.stdout.write(f'Found site: {site.domain}')
        except Site.DoesNotExist:
            site = Site.objects.create(
                id=site_id,
                domain=site_domain,
                name=site_name,
            )
            self.stdout.write(self.style.SUCCESS(f'Created new site: {site.domain}'))
        
        # Update site to configured environment (defaults to production domain)
        site.domain = site_domain
        site.name = site_name
        site.save()
        
        self.stdout.write(self.style.SUCCESS(f'Site updated: ID={site.id}, Domain={site.domain}, Name={site.name}'))
        
        # Check for SocialApp configuration
        from allauth.socialaccount.models import SocialApp
        
        google_apps = SocialApp.objects.filter(provider='google')
        if google_apps.exists():
            self.stdout.write(f'Found {google_apps.count()} Google SocialApp(s)')
            for app in google_apps:
                self.stdout.write(f'  - {app.name} (sites: {list(app.sites.values_list("domain", flat=True))})')
                # Make sure the site is associated
                if not app.sites.filter(id=site.id).exists():
                    app.sites.add(site)
                    self.stdout.write(self.style.SUCCESS(f'    Added site {site.domain} to {app.name}'))
        else:
            self.stdout.write(self.style.WARNING('No Google SocialApp found in database.'))
            self.stdout.write('This is OK if you are using settings-based configuration (SOCIALACCOUNT_PROVIDERS).')
