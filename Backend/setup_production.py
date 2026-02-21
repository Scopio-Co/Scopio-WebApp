#!/usr/bin/env python
"""
Run migrations and setup production environment (Django Site for OAuth).
Call this after deploying to Render.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from django.contrib.sites.models import Site
from django.core.management import call_command

# Run migrations
print("Running migrations...")
call_command('migrate')

# Setup Site for OAuth
site_domain = os.getenv('SITE_DOMAIN', 'scopio-webapp.onrender.com')
site_name = os.getenv('SITE_NAME', 'Scopio')

print(f"Setting up Site: {site_domain} ({site_name})")
site, created = Site.objects.update_or_create(
    id=1,
    defaults={
        'domain': site_domain,
        'name': site_name,
    }
)
print(f"Site {'created' if created else 'updated'}: {site.domain}")
