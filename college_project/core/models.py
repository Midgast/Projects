from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Group(models.Model):
    name = models.CharField(max_length=64)
    code = models.CharField(max_length=16, unique=True)

    class Meta:
        ordering = ["code"]

    def __str__(self) -> str:
        return self.code


class Subject(models.Model):
    name = models.CharField(max_length=64)
    code = models.CharField(max_length=16, unique=True)

    class Meta:
        ordering = ["code"]

    def __str__(self) -> str:
        return self.name


class Student(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student",
    )
    group = models.ForeignKey(Group, on_delete=models.PROTECT, related_name="students")
    course = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(6)])
    specialty = models.CharField(max_length=64, default="Software Engineering")

    # GPA 0.00–5.00
    gpa = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )

    # attendance 0–100 (%)
    attendance = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])

    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    class Meta:
        ordering = ["group__code", "user__username"]

    def __str__(self) -> str:
        full = (self.user.get_full_name() or self.user.username).strip()
        return f"{full} ({self.group.code})"


class Teacher(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="teacher",
    )
    department = models.CharField(max_length=64, default="IT")
    subjects = models.ManyToManyField(Subject, related_name="teachers", blank=True)

    class Meta:
        ordering = ["user__username"]

    def __str__(self) -> str:
        return (self.user.get_full_name() or self.user.username).strip()


class Director(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="director",
    )

    class Meta:
        ordering = ["user__username"]

    def __str__(self) -> str:
        return (self.user.get_full_name() or self.user.username).strip()


class ScheduleEntry(models.Model):
    WEEKDAYS = [
        (0, "Monday"),
        (1, "Tuesday"),
        (2, "Wednesday"),
        (3, "Thursday"),
        (4, "Friday"),
        (5, "Saturday"),
        (6, "Sunday"),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="schedule")
    weekday = models.PositiveSmallIntegerField(choices=WEEKDAYS)
    time_start = models.TimeField()
    time_end = models.TimeField()
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT)
    teacher = models.ForeignKey(Teacher, on_delete=models.PROTECT)
    location = models.CharField(max_length=64, default="101")

    class Meta:
        ordering = ["group__code", "weekday", "time_start"]
        indexes = [
            models.Index(fields=["group", "weekday", "time_start"]),
            models.Index(fields=["teacher", "weekday", "time_start"]),
        ]

    def __str__(self) -> str:
        return f"{self.group.code} {self.get_weekday_display()} {self.time_start}-{self.time_end} {self.subject.name}"


class Homework(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="homeworks")
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT)
    title = models.CharField(max_length=128)
    description = models.TextField(blank=True, default="")
    deadline = models.DateField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["completed", "deadline", "-created_at"]
        indexes = [models.Index(fields=["student", "completed", "deadline"])]

    def __str__(self) -> str:
        return f"{self.title} ({self.student.user.username})"


class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="grades")
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT)

    # 2.0–5.0 (цифровая оценка)
    value = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        validators=[MinValueValidator(2), MaxValueValidator(5)],
    )

    note = models.CharField(max_length=128, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["student", "created_at"])]

    def __str__(self) -> str:
        return f"{self.student.user.username} {self.subject.name}: {self.value}"


class Remark(models.Model):
    LEVELS = [
        ("INFO", "Info"),
        ("WARN", "Warning"),
        ("CRITICAL", "Critical"),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="remarks")

    # может быть пустым, если замечание создал директор
    teacher = models.ForeignKey(Teacher, on_delete=models.PROTECT, null=True, blank=True)

    # кто реально создал запись (teacher или director)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="remarks_authored",
    )

    level = models.CharField(max_length=8, choices=LEVELS, default="INFO")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ["resolved", "-created_at"]
        indexes = [models.Index(fields=["student", "resolved", "created_at"])]

    def __str__(self) -> str:
        return f"{self.student.user.username} {self.level} (resolved={self.resolved})"


class News(models.Model):
    title = models.CharField(max_length=128)
    text = models.TextField()
    image = models.ImageField(upload_to="news_covers/")  # REQUIRED
    created_at = models.DateTimeField(auto_now_add=True)
    tag = models.CharField(max_length=32, blank=True, default="")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class Notification(models.Model):
    TYPES = [
        ("grade", "Grade"),
        ("homework", "Homework"),
        ("remark", "Remark"),
        ("news", "News"),
        ("system", "System"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=16, choices=TYPES, default="system")

    # defaults важны, чтобы миграции никогда не спрашивали “чем заполнить”
    title = models.CharField(max_length=128, blank=True, default="")
    message = models.CharField(max_length=255, blank=True, default="")
    link = models.CharField(max_length=255, blank=True, default="")

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["is_read", "-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.user}: {self.title or 'Notification'}"
