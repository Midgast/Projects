from django.contrib.auth.models import AbstractUser
from django.db import models


class StudyGroup(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('president', 'President'),
        ('admin', 'Admin'),
        ('headman', 'Headman'),
        ('rector', 'Rector'),
        ('dean', 'Dean'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    group = models.ForeignKey(StudyGroup, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
