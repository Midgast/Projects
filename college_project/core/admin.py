
from django.contrib import admin
from .models import Student, Lesson, Homework, News, Teacher, Director

admin.site.register(Student)
admin.site.register(Teacher) # Добавили
admin.site.register(Director) # Добавили
admin.site.register(Lesson)
admin.site.register(Homework)
admin.site.register(News)