# File: core/models.py
from django.db import models
from django.conf import settings

class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    course = models.IntegerField(default=1)
    specialty = models.CharField(max_length=100, default="Computer Science")
    gpa = models.FloatField(default=4.0)
    attendance = models.IntegerField(default=100)

    def __str__(self):
        return self.user.username

class Lesson(models.Model):
    subject = models.CharField(max_length=100)
    location = models.CharField(max_length=50)
    teacher = models.CharField(max_length=100)
    time_start = models.TimeField()
    
    def __str__(self):
        return self.subject

class Homework(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    deadline = models.CharField(max_length=50) # Для простоты пока текстом
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class News(models.Model):
    title = models.CharField(max_length=200)
    tag = models.CharField(max_length=50)
    image = models.ImageField(upload_to='news_covers/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
# ... (Код Student, Lesson, Homework, News оставляем как был)

class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    subject = models.CharField(max_length=100) # Какой предмет ведет
    experience = models.IntegerField(default=5) # Стаж

    def __str__(self):
        return f"Учитель: {self.full_name}"

class Director(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    def __str__(self):
        return f"Директор: {self.full_name}"