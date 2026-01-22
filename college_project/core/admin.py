from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import (
    Group,
    Subject,
    Student,
    Teacher,
    Director,
    ScheduleEntry,
    Grade,
    Homework,
    Remark,
    News,
    Notification,
)

# -----------------------------
# Core dictionaries
# -----------------------------

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "id")
    search_fields = ("name", "code")
    ordering = ("name",)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "code", "id")
    search_fields = ("name", "code")
    ordering = ("name",)


# -----------------------------
# People / Roles
# -----------------------------

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("user", "group", "gpa", "attendance")
    list_filter = ("group",)
    search_fields = ("user__username", "user__first_name", "user__last_name", "group__name", "group__code")
    autocomplete_fields = ("user", "group")
    ordering = ("group__name", "-gpa", "-attendance")


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("user", "subjects_list")
    search_fields = ("user__username", "user__first_name", "user__last_name", "subjects__name", "subjects__code")
    filter_horizontal = ("subjects",)
    autocomplete_fields = ("user",)

    def subjects_list(self, obj):
        return ", ".join(s.name for s in obj.subjects.all())
    subjects_list.short_description = "Предметы"


@admin.register(Director)
class DirectorAdmin(admin.ModelAdmin):
    list_display = ("user",)
    search_fields = ("user__username", "user__first_name", "user__last_name")
    autocomplete_fields = ("user",)


# -----------------------------
# Schedule
# -----------------------------

@admin.register(ScheduleEntry)
class ScheduleEntryAdmin(admin.ModelAdmin):
    list_display = ("group", "weekday", "time_start", "time_end", "subject", "teacher", "location")
    list_filter = ("group", "weekday", "subject", "teacher")
    search_fields = (
        "group__name", "group__code",
        "subject__name", "subject__code",
        "teacher__user__username",
        "location",
    )
    autocomplete_fields = ("group", "subject", "teacher")
    ordering = ("group__name", "weekday", "time_start")


# -----------------------------
# Academic
# -----------------------------

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "value", "note", "created_at")
    list_filter = ("subject", "created_at")
    search_fields = ("student__user__username", "student__user__first_name", "student__user__last_name", "note", "subject__name")
    autocomplete_fields = ("student", "subject")
    ordering = ("-created_at",)


@admin.register(Homework)
class HomeworkAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "title", "deadline", "completed")
    list_filter = ("subject", "completed", "deadline")
    search_fields = ("student__user__username", "title", "subject__name")
    autocomplete_fields = ("student", "subject")
    ordering = ("completed", "deadline")


@admin.register(Remark)
class RemarkAdmin(admin.ModelAdmin):
    list_display = ("student", "teacher", "level", "resolved", "created_at")
    list_filter = ("level", "resolved", "created_at")
    search_fields = (
        "student__user__username", "student__user__first_name", "student__user__last_name",
        "teacher__user__username",
        "text",
    )
    autocomplete_fields = ("student", "teacher")
    ordering = ("resolved", "-created_at")
    list_editable = ("resolved",)


# -----------------------------
# Content / Communication
# -----------------------------

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ("title", "created_at", "has_image")
    search_fields = ("title", "text")
    ordering = ("-created_at",)

    def has_image(self, obj):
        return bool(getattr(obj, "image", None))
    has_image.boolean = True
    has_image.short_description = "Картинка"


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "is_read", "created_at", "link")
    list_filter = ("is_read", "created_at")
    search_fields = ("user__username", "title", "message", "link")
    autocomplete_fields = ("user",)
    ordering = ("-created_at",)
    list_editable = ("is_read",)


# -----------------------------
# Optional: improve User admin
# -----------------------------

# Если хочешь, чтобы Users в админке были удобнее, можно расширить:
admin.site.unregister(User)

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "first_name", "last_name", "is_staff", "is_superuser", "is_active")
    search_fields = ("username", "first_name", "last_name", "email")
