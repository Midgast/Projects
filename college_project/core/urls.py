from django.urls import path
from django.contrib.auth import views as auth_views
from django.shortcuts import redirect
from . import views

urlpatterns = [
    path('', lambda request: redirect('dashboard')),
    path('dashboard/', views.main_dashboard, name='dashboard'),
    path('login/', views.login_view, name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('homework/<int:hw_id>/submit/', views.upload_submission, name='submit_homework'),
    path('submission/<int:sub_id>/grade/', views.grade_submission, name='grade_submission'),
    path('toggle-homework/<int:task_id>/', views.toggle_homework, name='toggle_homework'),
    path('toggle-task/<int:task_id>/', views.toggle_homework, name='toggle-task'),
    path('schedule/', views.schedule_view, name='schedule'),
]
