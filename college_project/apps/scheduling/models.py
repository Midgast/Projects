from django.db import models
from django.conf import settings


class ScheduleEntry(models.Model):
    WEEKDAYS = [
        (1, 'Monday'),
        (2, 'Tuesday'),
        (3, 'Wednesday'),
        (4, 'Thursday'),
        (5, 'Friday'),
        (6, 'Saturday'),
        (7, 'Sunday'),
    ]

    group = models.ForeignKey('accounts.StudyGroup', on_delete=models.CASCADE)
    subject = models.CharField(max_length=150)
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    room = models.CharField(max_length=50, blank=True)
    weekday = models.IntegerField(choices=WEEKDAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        verbose_name = 'Schedule Entry'
        verbose_name_plural = 'Schedule Entries'

    def __str__(self):
        return f"{self.group} - {self.subject} ({self.weekday}) {self.start_time}-{self.end_time}"
