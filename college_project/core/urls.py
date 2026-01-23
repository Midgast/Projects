# college_project/core/urls.py
from django.urls import path
from core import views

urlpatterns = [
    # Entry
    path("", views.dashboard_router, name="home"),
    path("dashboard/", views.dashboard_router, name="dashboard"),

    # Pages
    path("schedule/", views.schedule_view, name="schedule"),
    path("grades/", views.grades_view, name="grades"),
    path("homeworks/", views.homeworks_view, name="homeworks"),
    path("remarks/", views.remarks_view, name="remarks"),
    path("news/", views.news_view, name="news"),
    path("settings/", views.settings_view, name="settings"),

    # Auth
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),

    # API (for student homework checkbox toggle)
    path("api/homeworks/<int:hw_id>/toggle/", views.homework_toggle_api, name="homework_toggle_api"),
]
