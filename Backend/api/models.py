import os
import uuid

from django.db import models
from django.contrib.auth.models import User


def user_directory_path(instance, filename):
	base_name, extension = os.path.splitext(filename or '')
	clean_extension = extension.lower() if extension else '.jpg'
	unique_suffix = uuid.uuid4().hex
	user_id = instance.user_id or 'unknown'
	return f"profile_pics/user_{user_id}/{base_name}_{unique_suffix}{clean_extension}"


class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
	college = models.CharField(max_length=255, blank=True, default='')
	bio = models.TextField(blank=True, default='')
	points = models.IntegerField(default=0, db_index=True)
	profile_image = models.ImageField(upload_to=user_directory_path, blank=True, null=True)

	def __str__(self):
		return f"Profile({self.user.username})"

