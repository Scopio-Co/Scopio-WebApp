from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver

from .models import UserProfile


@receiver(pre_save, sender=UserProfile)
def delete_previous_profile_image_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        previous = sender.objects.get(pk=instance.pk)
    except sender.DoesNotExist:
        return

    previous_image = previous.profile_image
    new_image = instance.profile_image

    if previous_image and previous_image.name != getattr(new_image, 'name', None):
        previous_image.delete(save=False)


@receiver(post_delete, sender=UserProfile)
def delete_profile_image_on_profile_delete(sender, instance, **kwargs):
    if instance.profile_image:
        instance.profile_image.delete(save=False)
