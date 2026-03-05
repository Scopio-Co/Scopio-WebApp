from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('video', '0013_courseresourceazure'),
    ]

    operations = [
        migrations.AddField(
            model_name='discussion',
            name='liked_by',
            field=models.ManyToManyField(blank=True, related_name='liked_course_discussions', to=settings.AUTH_USER_MODEL),
        ),
    ]
