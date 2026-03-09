#!/usr/bin/env python
"""
Google OAuth Configuration Diagnostic Script

This script helps diagnose issues with Google OAuth integration.
Run it from the Backend directory:

    python diagnose_oauth.py
    
It will check:
- Environment variables
- Django settings
- Database configuration
- Google OAuth URLs
- Frontend connectivity
"""

import os
import sys
import json
from pathlib import Path

# Add Backend dir to path
sys.path.insert(0, str(Path(__file__).parent))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')

import django
django.setup()

from django.conf import settings
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
import urllib.request
import urllib.error


class Colors:
    """ANSI color codes"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")


def print_section(text):
    print(f"\n{Colors.BOLD}{text}{Colors.END}")
    print("-" * 60)


def print_ok(text):
    print(f"{Colors.GREEN}[OK] {text}{Colors.END}")


def print_warn(text):
    print(f"{Colors.YELLOW}[WARN] {text}{Colors.END}")


def print_error(text):
    print(f"{Colors.RED}[ERROR] {text}{Colors.END}")


def print_info(text):
    print(f"{Colors.BLUE}[INFO] {text}{Colors.END}")


def check_environment():
    """Check environment variables"""
    print_section("[1] ENVIRONMENT VARIABLES")
    
    client_id = os.getenv('GOOGLE_CLIENT_ID', '')
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET', '')
    debug = os.getenv('DEBUG', 'True')
    frontend_url = os.getenv('FRONTEND_URL', '')
    
    if client_id:
        print_ok(f"GOOGLE_CLIENT_ID is set ({len(client_id)} chars)")
    else:
        print_error("GOOGLE_CLIENT_ID not set - OAuth will fail")
    
    if client_secret:
        print_ok(f"GOOGLE_CLIENT_SECRET is set ({len(client_secret)} chars)")
    else:
        print_error("GOOGLE_CLIENT_SECRET not set - OAuth will fail")
    
    print_info(f"DEBUG mode: {debug}")
    
    if frontend_url:
        print_info(f"FRONTEND_URL: {frontend_url}")
    else:
        print_warn("FRONTEND_URL not set - using default")


def check_django_settings():
    """Check Django settings"""
    print_section("[2] DJANGO SETTINGS")
    
    print_info(f"DEBUG: {settings.DEBUG}")
    print_info(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
    
    frontend_url = getattr(settings, 'FRONTEND_URL', 'not set')
    print_info(f"FRONTEND_URL: {frontend_url}")
    
    frontend_origins = getattr(settings, 'FRONTEND_ALLOWED_ORIGINS', [])
    print_info(f"FRONTEND_ALLOWED_ORIGINS:")
    for origin in frontend_origins:
        print(f"  - {origin}")
    
    cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
    print_info(f"CORS_ALLOWED_ORIGINS:")
    for origin in cors_origins:
        print(f"  - {origin}")
    
    csrf_origins = getattr(settings, 'CSRF_TRUSTED_ORIGINS', [])
    print_info(f"CSRF_TRUSTED_ORIGINS:")
    for origin in csrf_origins:
        print(f"  - {origin}")
    
    login_redirect = getattr(settings, 'LOGIN_REDIRECT_URL', 'not set')
    print_info(f"LOGIN_REDIRECT_URL: {login_redirect}")
    
    account_login_redirect = getattr(settings, 'ACCOUNT_LOGIN_REDIRECT_URL', 'not set')
    print_info(f"ACCOUNT_LOGIN_REDIRECT_URL: {account_login_redirect}")


def check_sites_framework():
    """Check Django Sites framework"""
    print_section("[3] DJANGO SITES FRAMEWORK")
    
    try:
        site = Site.objects.get_current()
        print_ok(f"Current site: {site.domain} (ID: {site.id})")
    except Exception as e:
        print_error(f"Failed to get current site: {e}")


def check_socialapp():
    """Check SocialApp configuration"""
    print_section("[4] DJANGO-ALLAUTH SOCIALAPP")
    
    try:
        google_apps = SocialApp.objects.filter(provider='google')
        if google_apps.exists():
            for app in google_apps:
                print_ok(f"Found Google SocialApp: {app.name}")
                
                if app.client_id:
                    print_ok(f"  - Client ID configured ({len(app.client_id)} chars)")
                else:
                    print_error(f"  - Client ID NOT configured")
                
                if app.secret:
                    print_ok(f"  - Secret configured ({len(app.secret)} chars)")
                else:
                    print_error(f"  - Secret NOT configured")
                
                sites = list(app.sites.values_list('domain', flat=True))
                if sites:
                    print_ok(f"  - Linked to sites: {', '.join(sites)}")
                else:
                    print_error(f"  - NOT linked to any sites")
        else:
            print_warn("No Google SocialApp found in database")
            print_info("Solution: Run: python manage.py setup_google_oauth --setup")
    except Exception as e:
        print_error(f"Error checking SocialApp: {e}")


def check_socialaccount_providers():
    """Check SOCIALACCOUNT_PROVIDERS setting"""
    print_section("[5] SOCIALACCOUNT_PROVIDERS SETTING")
    
    try:
        providers = getattr(settings, 'SOCIALACCOUNT_PROVIDERS', {})
        google_config = providers.get('google', {})
        
        if google_config:
            print_ok("SOCIALACCOUNT_PROVIDERS['google'] is configured")
            
            app_config = google_config.get('APP', {})
            if app_config and app_config.get('client_id'):
                print_ok(f"  - APP.client_id configured ({len(app_config.get('client_id', ''))} chars)")
            else:
                print_error("  - APP.client_id NOT configured")
            
            if app_config and app_config.get('secret'):
                print_ok(f"  - APP.secret configured ({len(app_config.get('secret', ''))} chars)")
            else:
                print_error("  - APP.secret NOT configured")
            
            scopes = google_config.get('SCOPE', [])
            print_info(f"  - Scopes: {scopes}")
        else:
            print_error("SOCIALACCOUNT_PROVIDERS['google'] NOT configured")
    except Exception as e:
        print_error(f"Error checking SOCIALACCOUNT_PROVIDERS: {e}")


def check_oauth_urls():
    """Check OAuth callback URLs"""
    print_section("[6] OAUTH CALLBACK URLS")
    
    print_info("Callback URLs that MUST be configured in Google Cloud Console:")
    
    urls = [
        ("Localhost", "http://localhost:8000/accounts/google/login/callback/"),
        ("Production", "https://20.17.98.254.nip.io/accounts/google/login/callback/"),
    ]
    
    for name, url in urls:
print(f"  - {name}: {url}")
    
    print_info("\n⚠️  To configure in Google Cloud Console:")
    print_info("  1. Go to Google Cloud Console > APIs & Services > Credentials")
    print_info("  2. Select your OAuth 2.0 Client ID")
    print_info("  3. Add both URLs above to 'Authorized redirect URIs'")
    print_info("  4. Save changes")


def check_frontend_connectivity():
    """Check frontend connectivity"""
    print_section("[7] FRONTEND CONNECTIVITY")
    
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://scopio-webapp.pages.dev')
    print_info(f"Expected frontend URL: {frontend_url}")
    
    # Try localhost
    try:
        result = urllib.request.urlopen('http://localhost:5173', timeout=2)
        if result.status == 200:
            print_ok("Frontend running on localhost:5173")
    except urllib.error.URLError:
        print_warn("Frontend not running on localhost:5173 (expected if not developing locally)")
    except Exception as e:
        print_info(f"Frontend localhost check: {e}")
    
    print_info("Frontend environments:")
    print("  - Development: http://localhost:5173")
    print("  - Production: https://scopio-webapp.pages.dev")


def check_oauth_file():
    """Check for OAUTH.json"""
    print_section("[8] OAUTH.JSON FILE")
    
    oauth_path = Path(__file__).parent / 'OAUTH.json'
    if oauth_path.exists():
        try:
            with open(oauth_path, 'r') as f:
                data = json.load(f)
            web = data.get('web', {})
            if web.get('client_id'):
                print_ok(f"OAUTH.json found with client_id ({len(web.get('client_id'))} chars)")
            else:
                print_warn("OAUTH.json found but missing client_id")
        except Exception as e:
            print_error(f"Error reading OAUTH.json: {e}")
    else:
        print_warn(f"OAUTH.json not found at {oauth_path} (not required if using env vars)")


def generate_summary():
    """Generate summary and recommendations"""
    print_section("[SUMMARY & RECOMMENDATIONS]")
    
    issues = []
    
    # Check for critical issues
    if not os.getenv('GOOGLE_CLIENT_ID'):
        issues.append("[ERR] GOOGLE_CLIENT_ID not set in environment")
    
    if not os.getenv('GOOGLE_CLIENT_SECRET'):
        issues.append("[ERR] GOOGLE_CLIENT_SECRET not set in environment")
    
    try:
        google_apps = SocialApp.objects.filter(provider='google')
        if not google_apps.exists():
            issues.append("[ERR] No Google SocialApp configured in database")
        else:
            for app in google_apps:
                if not app.client_id or not app.secret:
                    issues.append("[ERR] SocialApp missing client_id or secret")
                if not app.sites.exists():
                    issues.append("[ERR] SocialApp not linked to any sites")
    except:
        pass
    
    login_redirect = getattr(settings, 'LOGIN_REDIRECT_URL', '')
    if login_redirect != '/glogin/google/finalize/':
        issues.append(f"[!!] LOGIN_REDIRECT_URL is '{login_redirect}' (expected '/glogin/google/finalize/')")
    
    if issues:
        print_error("CRITICAL ISSUES FOUND")
        print()
        for issue in issues:
            print(f"  {issue}")
        print()
        
        print("\nRECOMMENDED FIXES:\n")
        
        if not os.getenv('GOOGLE_CLIENT_ID') or not os.getenv('GOOGLE_CLIENT_SECRET'):
            print("1. Set Google OAuth credentials in Backend/.env:")
            print("   GOOGLE_CLIENT_ID=your-client-id")
            print("   GOOGLE_CLIENT_SECRET=your-client-secret")
        
        print("\n2. Run setup command:")
        print("   python manage.py setup_google_oauth --setup")
        
        print("\n3. Restart Django:")
        print("   python manage.py runserver 0.0.0.0:8000")
        
        print("\n4. Verify in Google Cloud Console that callback URLs are configured:")
        print("   - http://localhost:8000/accounts/google/login/callback/")
        print("   - https://20.17.98.254.nip.io/accounts/google/login/callback/")
    else:
        print_ok("All OAuth configuration checks passed!")
        print("\nNEXT STEPS:")
        print("1. Restart Django backend: python manage.py runserver 0.0.0.0:8000")
        print("2. Start frontend: npm run dev")
        print("3. Open http://localhost:5173 in browser")
        print("4. Click 'Login with Google'")
        print("5. Complete Google authentication")
        print("6. You should be redirected back to the frontend with login complete")


def main():
    """Run all diagnostics"""
    print_header("GOOGLE OAUTH DIAGNOSTIC TOOL")
    
    try:
        check_environment()
        check_django_settings()
        check_sites_framework()
        check_socialapp()
        check_socialaccount_providers()
        check_oauth_urls()
        check_frontend_connectivity()
        check_oauth_file()
        generate_summary()
        
        print_header("DIAGNOSTIC COMPLETE")
        
    except Exception as e:
        print_error(f"Diagnostic failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
