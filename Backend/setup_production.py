#!/usr/bin/env python
"""
Run migrations and setup production environment (Django Site for OAuth).
Call this after deploying to Render.
"""
import os
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
import django
django.setup()

from django.contrib.sites.models import Site

# Setup Site for OAuth
site_domain = os.getenv('SITE_DOMAIN', 'scopio-webapp.onrender.com')
site_name = os.getenv('SITE_NAME', 'Scopio')

print(f"Setting up Django Site: {site_domain} ({site_name})")

try:
    site = Site.objects.get(id=1)
    site.domain = site_domain
    site.name = site_name
    site.save()
    print(f"✓ Site updated: {site.domain}")
except Site.DoesNotExist:
    site = Site.objects.create(
        id=1,
        domain=site_domain,
        name=site_name,
    )
    print(f"✓ Site created: {site.domain}")

print("✓ Production setup complete")
sys.exit(0)
