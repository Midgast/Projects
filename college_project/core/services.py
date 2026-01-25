"""
Business logic services for the college management system.
"""
import logging
from typing import Optional
from django.contrib.auth.models import User
from django.core.cache import cache
from .models import Notification

logger = logging.getLogger(__name__)


def send_notification(
    user: User,
    message: str,
    title: str = "",
    notification_type: str = "system",
    link: str = ""
) -> Optional[Notification]:
    """
    Send a notification to a user and invalidate their unread count cache.
    
    Args:
        user: The user to notify
        message: Notification message
        title: Notification title (optional)
        notification_type: Type of notification (grade, homework, remark, news, system)
        link: Link to related content (optional)
    
    Returns:
        Notification object if successful, None otherwise
    """
    try:
        notification = Notification.objects.create(
            user=user,
            message=message,
            title=title,
            type=notification_type,
            link=link
        )
        
        # Invalidate cache for unread notifications count
        cache_key = f"unread_notif_count_{user.id}"
        cache.delete(cache_key)
        
        logger.info(f"Notification sent to user {user.username}: {title or message[:50]}")
        return notification
    except Exception as e:
        logger.error(f"Error sending notification to user {user.username}: {e}")
        return None


def get_unread_notifications(user: User):
    """
    Get all unread notifications for a user.
    
    Args:
        user: The user whose notifications to retrieve
    
    Returns:
        QuerySet of unread notifications
    """
    return Notification.objects.filter(user=user, is_read=False).order_by('-created_at')


def mark_all_notifications_read(user: User) -> int:
    """
    Mark all notifications as read for a user.
    
    Args:
        user: The user whose notifications to mark as read
    
    Returns:
        Number of notifications marked as read
    """
    try:
        count = Notification.objects.filter(user=user, is_read=False).update(is_read=True)
        
        # Invalidate cache
        cache_key = f"unread_notif_count_{user.id}"
        cache.delete(cache_key)
        
        logger.info(f"Marked {count} notifications as read for user {user.username}")
        return count
    except Exception as e:
        logger.error(f"Error marking notifications as read for user {user.username}: {e}")
        return 0
