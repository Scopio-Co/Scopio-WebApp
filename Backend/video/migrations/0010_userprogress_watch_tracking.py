# Generated migration for adding video watch percentage tracking

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0009_userxp_has_seen_welcome'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprogress',
            name='watch_percentage',
            field=models.PositiveSmallIntegerField(
                default=0,
                help_text='Percentage of video watched (0-100)'
            ),
        ),
        migrations.AddField(
            model_name='userprogress',
            name='video_duration_seconds',
            field=models.PositiveIntegerField(
                default=0,
                help_text='Total video duration in seconds for reference'
            ),
        ),
    ]
