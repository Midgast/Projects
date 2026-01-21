from __future__ import annotations

from datetime import datetime, time
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.templatetags.static import static as static_url
from django.views.decorators.http import require_POST

from .models import Student, Teacher, Director, Lesson, Homework, News


@login_required(login_url="login")
def main_dashboard(request):
    user = request.user

    if hasattr(user, "student"):
        return student_dashboard(request, user.student)

    if hasattr(user, "teacher"):
        return teacher_dashboard(request, user.teacher)

    if hasattr(user, "director"):
        return director_dashboard(request, user.director)

    # Superuser fallback (чтобы админ мог зайти без профиля роли)
    if user.is_superuser:
        class FakeAdminProfile:
            full_name = "Администратор"
            avatar = None

        return director_dashboard(request, FakeAdminProfile())

    return render(request, "core/login.html", {
        "form": None,
        "error": "Ваш профиль не настроен. Обратитесь к администратору.",
    })


def login_view(request):
    """Простой логин через форму (username + password)."""
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        return render(request, "core/login.html", {"form": None, "error": "Неверный логин или пароль."})

    return render(request, "core/login.html", {"form": None})


def _pick_next_lesson(now: datetime):
    """
    У Lesson есть только time_start (без даты). Берем ближайший урок сегодня,
    иначе возвращаем первый (как фолбэк) или None.
    """
    lessons = list(Lesson.objects.all().order_by("time_start"))
    if not lessons:
        return None

    now_t = now.time()
    for les in lessons:
        if isinstance(les.time_start, time) and les.time_start >= now_t:
            return les

    return lessons[0]


def _ensure_student_seed(student: Student):
    """
    Для пустой БД: создаем минимальные домашки (без картинок).
    Новости и уроки НЕ создаем (у News нужен файл картинки).
    """
    if not Homework.objects.filter(student=student).exists():
        Homework.objects.bulk_create([
            Homework(student=student, title="Сверстать карточку (Glass) для Dashboard", deadline="2026-01-25"),
            Homework(student=student, title="Сделать 3D Tilt + Glare на Vanilla JS", deadline="2026-01-26"),
            Homework(student=student, title="Подключить API для чекбоксов (CSRF)", deadline="2026-01-28"),
        ])


def _normalize_news():
    """
    Приводим новости к единому формату (list[dict]),
    чтобы шаблон не ломался, даже если News пустые.
    """
    qs = News.objects.all().order_by("-created_at")[:2]
    items = []
    for n in qs:
        items.append({
            "title": n.title,
            "tag": getattr(n, "tag", "Новости"),
            "image_url": n.image.url if getattr(n, "image", None) else static_url("img/logo.svg"),
        })

    if items:
        return items

    # Фолбэк (мок) — без БД
    return [
        {"title": "Обновление расписания на этой неделе", "tag": "Объявление", "image_url": static_url("img/logo.svg")},
        {"title": "Новый модуль: проекты и дедлайны", "tag": "Платформа", "image_url": static_url("img/logo.svg")},
    ]


def student_dashboard(request, student: Student):
    _ensure_student_seed(student)

    now = datetime.now()
    next_lesson = _pick_next_lesson(now)

    # таймстамп "сегодня + время урока" для countdown
    next_ts = None
    if next_lesson and next_lesson.time_start:
        today = now.date()
        dt = datetime.combine(today, next_lesson.time_start)
        # если уже прошло — считаем завтрашний
        if dt < now:
            dt = dt.replace(day=today.day)  # безопасный placeholder
            dt = datetime.combine(today, next_lesson.time_start)  # пересборка
            dt = dt.replace()  # noop
            dt = datetime.combine(today, next_lesson.time_start)
            dt = dt.replace()  # noop
            # проще: +1 день
            from datetime import timedelta
            dt = dt + timedelta(days=1)
        next_ts = int(dt.timestamp() * 1000)

    context = {
        "role": "student",
        "profile": student,
        "next_lesson": next_lesson,
        "next_lesson_ts": next_ts,
        "homeworks": Homework.objects.filter(student=student).order_by("completed", "id"),
        "news_items": _normalize_news(),
        "stats": {
            "gpa": float(student.gpa),
            "attendance": int(student.attendance),
        },
    }
    return render(request, "core/dashboard.html", context)


def teacher_dashboard(request, teacher: Teacher):
    pending_works = Homework.objects.filter(completed=True).count()
    context = {
        "role": "teacher",
        "profile": teacher,
        "pending_works": pending_works,
        "news_items": _normalize_news(),
        "next_class": "Группа IT-21 (14:00)",
    }
    return render(request, "core/dashboard_teacher.html", context)


def director_dashboard(request, director):
    context = {
        "role": "director",
        "profile": director,
        "total_students": Student.objects.count(),
        "total_teachers": Teacher.objects.count(),
        "news_items": _normalize_news(),
    }
    return render(request, "core/dashboard_director.html", context)


@require_POST
@login_required(login_url="login")
def toggle_homework(request, task_id: int):
    task = get_object_or_404(Homework, id=task_id)

    # запрет: студент может менять только свои задачи
    if hasattr(request.user, "student") and task.student_id != request.user.student.id:
        return JsonResponse({"status": "forbidden"}, status=403)

    task.completed = not task.completed
    task.save(update_fields=["completed"])
    return JsonResponse({"status": "success", "completed": task.completed})

from django.http import HttpResponse

def schedule_view(request):
    return HttpResponse("Schedule page works")
