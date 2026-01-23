from django.urls import path
from . import views

urlpatterns = [
    # Public / Guest
    path("", views.guest_landing, name="guest_landing"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),

    # Dashboards
    path("dashboard/", views.dashboard_router, name="dashboard_router"),
    path("dashboard/student/", views.student_dashboard, name="dashboard_student"),
    path("dashboard/teacher/", views.teacher_dashboard, name="dashboard_teacher"),
    path("dashboard/director/", views.director_dashboard, name="dashboard_director"),

    # Pages
    path("schedule/", views.schedule, name="schedule"),
    path("grades/", views.grades, name="grades"),
    path("homeworks/", views.homeworks, name="homeworks"),
    path("remarks/", views.remarks, name="remarks"),
    path("rating/", views.rating, name="rating"),
    path("notifications/", views.notifications, name="notifications"),
    path("news/", views.news_list, name="news_list"),
    path("settings/", views.settings_view, name="settings"),

    # APIs
    path("api/homeworks/<int:hw_id>/toggle/", views.api_toggle_homework, name="api_toggle_homework"),
    path("api/notifications/<int:notif_id>/read/", views.api_mark_notification_read, name="api_mark_notification_read"),
]
