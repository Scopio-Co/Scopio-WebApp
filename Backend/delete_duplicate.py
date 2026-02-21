import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main.settings')
django.setup()

from django.contrib.auth.models import User

# Delete the duplicate TestCase user (keep the older one)
user_to_delete = User.objects.get(id=2, username='TestCase')
print(f"Deleting: {user_to_delete.username} (ID: {user_to_delete.id})")
user_to_delete.delete()
print("✓ Duplicate user deleted successfully!")

# Verify
remaining = User.objects.filter(email='vishalmurugan006@gmail.com')
print(f"\nRemaining users with that email: {remaining.count()}")
for u in remaining:
    print(f"  - {u.username} (ID: {u.id})")
