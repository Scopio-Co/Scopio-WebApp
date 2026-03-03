from pathlib import Path
from django.db import migrations


def set_default_profile_image(apps, schema_editor):
    UserProfile = apps.get_model('api', 'UserProfile')

    default_image_path = Path(__file__).resolve().parents[1] / 'static' / 'api' / 'profileDefault.webp'
    if not default_image_path.exists():
        return

    image_bytes = default_image_path.read_bytes()

    UserProfile.objects.filter(profile_image__isnull=True).update(
        profile_image=image_bytes,
        profile_image_content_type='image/webp',
        profile_image_name='profileDefault.webp',
    )

    UserProfile.objects.filter(profile_image=b'').update(
        profile_image=image_bytes,
        profile_image_content_type='image/webp',
        profile_image_name='profileDefault.webp',
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_profile_image_binary'),
    ]

    operations = [
        migrations.RunPython(set_default_profile_image, noop_reverse),
    ]
