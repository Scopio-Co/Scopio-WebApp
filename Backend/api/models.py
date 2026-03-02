from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
	college = models.CharField(max_length=255, blank=True, default='')
	bio = models.TextField(blank=True, default='')
	profile_image = models.BinaryField(blank=True, null=True)
	profile_image_content_type = models.CharField(max_length=100, blank=True, default='')
	profile_image_name = models.CharField(max_length=255, blank=True, default='')

	def __str__(self):
		return f"Profile({self.user.username})"

