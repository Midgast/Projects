from django.contrib.auth.models import User
from .models import Notification

def send_notification(user: User, message: str) -> Notification:
    return Notification.objects.create(user=user, message=message)

def get_unread_notifications(user: User):
    return Notification.objects.filter(user=user, is_read=False)
