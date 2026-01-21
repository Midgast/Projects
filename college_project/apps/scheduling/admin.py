from django.contrib import admin
from .models import ScheduleEntry


@admin.register(ScheduleEntry)
class ScheduleEntryAdmin(admin.ModelAdmin):
    list_display = ('group', 'subject', 'teacher', 'weekday', 'start_time', 'room')
    list_filter = ('weekday', 'group')
