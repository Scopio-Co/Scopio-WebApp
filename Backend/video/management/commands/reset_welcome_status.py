from django.core.management.base import BaseCommand
from video.models import UserXP


class Command(BaseCommand):
    help = 'Reset has_seen_welcome to False for all users (for testing first-time greeting)'

    def handle(self, *args, **options):
        count = UserXP.objects.all().update(has_seen_welcome=False)
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully reset has_seen_welcome for {count} UserXP records'
            )
        )
