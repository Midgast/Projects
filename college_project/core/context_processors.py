from .models import Notification


def unread_notifications_count(request):
    """
    Добавляет в шаблоны unread_notifications_count.
    Не падает для гостя.
    """
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return {"unread_notifications_count": 0}

    count = Notification.objects.filter(user=user, is_read=False).count()
    return {"unread_notifications_count": count}
