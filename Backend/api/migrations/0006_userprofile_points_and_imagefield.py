from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_set_default_profile_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='points',
            field=models.IntegerField(db_index=True, default=0),
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='profile_image',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='profile_image_content_type',
        ),
        migrations.RemoveField(
            model_name='userprofile',
            name='profile_image_name',
        ),
        migrations.AddField(
            model_name='userprofile',
            name='profile_image',
            field=models.ImageField(blank=True, null=True, upload_to='profile_pics/'),
        ),
    ]
