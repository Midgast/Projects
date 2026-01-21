from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, StudyGroup


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Extra', {'fields': ('role', 'group')}),
    )


@admin.register(StudyGroup)
class StudyGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'code')
