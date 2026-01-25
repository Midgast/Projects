"""
Signals for automatic user profile creation.
"""
import logging
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import UserProfile, Student, Group

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create UserProfile for new users.
    Only create Student profile if explicitly needed (not for staff/superuser).
    """
    if created:
        # Don't auto-create profiles for superusers or staff
        if instance.is_superuser or instance.is_staff:
            logger.info(f"Skipping profile creation for staff user: {instance.username}")
            return
        
        try:
            # Create UserProfile with default role
            profile, profile_created = UserProfile.objects.get_or_create(
                user=instance,
                defaults={'role': 'student'}
            )
            
            # Only create Student if role is student and doesn't exist
            if profile.role == 'student':
                if not hasattr(instance, 'student'):
                    group, _ = Group.objects.get_or_create(
                        code='DEFAULT',
                        defaults={'name': 'Default Group'}
                    )
                    Student.objects.create(user=instance, group=group)
                    logger.info(f"Created student profile for user: {instance.username}")
        except Exception as e:
            logger.error(f"Error creating profile for user {instance.username}: {e}")


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, created, **kwargs):
    """
    Ensure UserProfile is saved when User is saved.
    Only for existing users (not newly created).
    """
    if not created and hasattr(instance, 'userprofile'):
        try:
            instance.userprofile.save()
        except Exception as e:
            logger.error(f"Error saving profile for user {instance.username}: {e}")
