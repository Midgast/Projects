from django.db import models
from django.conf import settings


class Grade(models.Model):
    TERM_CHOICES = [
        ('module', 'Module'),
        ('session', 'Session'),
    ]

    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    module = models.CharField(max_length=150)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    term = models.CharField(max_length=20, choices=TERM_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.module} - {self.score} ({self.term})"
