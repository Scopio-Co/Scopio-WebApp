from django.db import models
from embed_video.fields import EmbedVideoField
# Create your models here.
class Video(models.Model):
    title = models.CharField(max_length=255)
    added = models.DateTimeField(auto_now_add=True)
    url = models.URLField()

    def __str__(self):
        return str(self.title)
    

