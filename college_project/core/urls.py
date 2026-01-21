from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.main_dashboard, name='dashboard'),
    path('login/', views.login_view, name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('toggle-homework/<int:task_id>/', views.toggle_homework, name='toggle_homework'),
    path('toggle-task/<int:task_id>/', views.toggle_homework, name='toggle-task'),
    path('schedule/', views.schedule_view, name='schedule'),
]
