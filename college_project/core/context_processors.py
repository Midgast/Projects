"""
Context processors for adding global template variables.
"""
from django.core.cache import cache
from .models import Notification


def unread_notifications_count(request):
    """
    Добавляет в шаблоны unread_notifications_count.
    Использует кеш для снижения нагрузки на БД.
    Не падает для гостя.
    """
    user = getattr(request, "user", None)
    if not user or not user.is_authenticated:
        return {"unread_notifications_count": 0}

    # Use cache to avoid DB query on every request
    cache_key = f"unread_notif_count_{user.id}"
    count = cache.get(cache_key)
    
    if count is None:
        count = Notification.objects.filter(user=user, is_read=False).count()
        # Cache for 60 seconds
        cache.set(cache_key, count, 60)
    
    return {"unread_notifications_count": count}
