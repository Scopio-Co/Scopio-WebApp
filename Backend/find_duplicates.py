import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from django.contrib.auth.models import User
from django.db.models import Count

# Find duplicate emails
duplicates = User.objects.values('email').annotate(count=Count('id')).filter(count__gt=1)
print('\n=== Duplicate Emails ===')
if not duplicates.exists():
    print('No duplicates found!')
else:
    for dup in duplicates:
        print(f"\nEmail: {dup['email']} (Count: {dup['count']})")
        users = User.objects.filter(email=dup['email']).order_by('date_joined')
        for u in users:
            print(f"  - ID: {u.id:3} | Username: {u.username:15} | Created: {u.date_joined}")
