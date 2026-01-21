from django.contrib import admin
from .models import Grade


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'module', 'score', 'term', 'created_at')
    list_filter = ('term', 'module')
