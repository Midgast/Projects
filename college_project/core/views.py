# college_project/core/views.py
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from types import SimpleNamespace
from typing import Optional, Iterable

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Avg, Q
from django.http import JsonResponse, HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from .models import (
    Director,
    Grade,
    Group,
    Homework,
    News,
    Notification,
    Remark,
    ScheduleEntry,
    Student,
    Subject,
    Teacher,
)


# =========================
# Helpers: roles & time
# =========================

def _profiles(user):
    """Return (student, teacher, director). Any can be None."""
    student = teacher = director = None
    try:
        student = user.student
    except Exception:
        student = None

    try:
        teacher = user.teacher
    except Exception:
        teacher = None

    try:
        director = user.director
    except Exception:
        director = None

    return student, teacher, director


def _weekday_label(dow: int) -> str:
    # Monday=0 ... Sunday=6 (Django/Python weekday)
    labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    try:
        return labels[int(dow)]
    except Exception:
        return "—"


def _next_occurrence_datetime(entry: ScheduleEntry, now: datetime) -> datetime:
    """
    Find next datetime occurrence for weekly ScheduleEntry (day_of_week + time_start).
    Uses settings TIME_ZONE.
    """
    if timezone.is_naive(now):
        now = timezone.make_aware(now, timezone.get_current_timezone())

    days_ahead = (entry.day_of_week - now.weekday()) % 7
    target_date = (now + timedelta(days=days_ahead)).date()
    candidate = timezone.make_aware(
        datetime.combine(target_date, entry.time_start),
        timezone.get_current_timezone(),
    )
    # If it's today but already started, jump a week
    if candidate <= now:
        candidate = candidate + timedelta(days=7)
    return candidate


def _find_next_lesson(qs: Iterable[ScheduleEntry], now: datetime):
    """Return (entry, start_dt) for the closest upcoming entry, else (None, None)."""
    best = None
    best_dt = None
    for e in qs:
        dt = _next_occurrence_datetime(e, now)
        if best_dt is None or dt < best_dt:
            best_dt = dt
            best = e
    return best, best_dt


def _teacher_groups_qs(teacher: Teacher):
    return Group.objects.filter(schedule_entries__teacher=teacher).distinct().order_by("code")


def _safe_int(s: str | None) -> Optional[int]:
    if not s:
        return None
    try:
        return int(s)
    except Exception:
        return None


# =========================
# Auth
# =========================

def guest_landing(request):
    # Публичная “пустая” витрина (до логина)
    return render(request, "core/guest_dashboard.html")


def login_view(request):
    if request.user.is_authenticated:
        return redirect("/dashboard/")

    error = ""
    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "").strip()
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect(request.GET.get("next") or "/dashboard/")
        error = "Неверный логин или пароль."

    return render(request, "core/login.html", {"error": error})


def logout_view(request):
    logout(request)
    return redirect("/login/")


# =========================
# Dashboards (router)
# =========================

@login_required
def dashboard_router(request):
    student, teacher, director = _profiles(request.user)

    # Важно: директор приоритетнее, даже если он ещё и teacher
    if director:
        return director_dashboard(request)
    if teacher:
        return teacher_dashboard(request)
    if student:
        return student_dashboard(request)

    # Если вдруг юзер без профилей
    return redirect("/")


@login_required
def student_dashboard(request):
    student, _, _ = _profiles(request.user)
    if not student:
        return redirect("/dashboard/")

    now = timezone.localtime()
    schedule_qs = (
        ScheduleEntry.objects
        .filter(group=student.group)
        .select_related("subject", "teacher__user", "group")
    )
    next_entry, next_dt = _find_next_lesson(schedule_qs, now)

    news = News.objects.all()[:2]
    homeworks = (
        Homework.objects
        .filter(student=student)
        .select_related("subject")
        .order_by("completed", "deadline")[:6]
    )

    # Рейтинг места в группе (по GPA, потом посещаемость)
    group_students = (
        Student.objects
        .filter(group=student.group)
        .select_related("user")
        .order_by("-gpa", "-attendance", "user__last_name", "user__first_name")
    )
    group_place = None
    for idx, s in enumerate(group_students, start=1):
        if s.id == student.id:
            group_place = idx
            break

    # Средний балл по оценкам (реальный) + посещаемость
    avg_grade = (
        Grade.objects.filter(student=student).aggregate(a=Avg("value")).get("a") or 0
    )

    context = {
        "student": student,
        "stats": {"avg_grade": float(avg_grade), "attendance": f"{student.attendance}%"},
        "group_place": group_place,
        "group_total": group_students.count(),
        "next_lesson": next_entry,
        "next_lesson_start": next_dt,
        "timestamp_ms": int(next_dt.timestamp() * 1000) if next_dt else 0,
        "homeworks": homeworks,
        "news": news,
    }
    return render(request, "core/dashboard_student.html", context)


@login_required
def teacher_dashboard(request):
    _, teacher, director = _profiles(request.user)

    # Если это директор, но у него есть teacher-профиль — пускаем как teacher тоже.
    if not teacher and director:
        try:
            teacher = request.user.teacher
        except Exception:
            teacher = None

    if not teacher:
        return redirect("/dashboard/")

    now = timezone.localtime()
    schedule_qs = (
        ScheduleEntry.objects
        .filter(teacher=teacher)
        .select_related("subject", "teacher__user", "group")
    )
    next_entry, next_dt = _find_next_lesson(schedule_qs, now)

    groups = _teacher_groups_qs(teacher)
    open_remarks = Remark.objects.filter(Q(teacher=teacher) | Q(author=request.user), resolved=False).count()
    news = News.objects.all()[:2]

    context = {
        "teacher": teacher,
        "next_lesson": next_entry,
        "next_lesson_start": next_dt,
        "timestamp_ms": int(next_dt.timestamp() * 1000) if next_dt else 0,
        "groups": groups,
        "open_remarks": open_remarks,
        "news": news,
    }
    return render(request, "core/dashboard_teacher.html", context)


@login_required
def director_dashboard(request):
    _, teacher, director = _profiles(request.user)
    if not director:
        return redirect("/dashboard/")

    # Директор = тоже преподаватель (если есть teacher-профиль)
    if not teacher:
        try:
            teacher = request.user.teacher
        except Exception:
            teacher = None

    now = timezone.localtime()

    # “Системная” статистика
    stats = {
        "students": Student.objects.count(),
        "teachers": Teacher.objects.count(),
        "open_remarks": Remark.objects.filter(resolved=False).count(),
    }
    recent_news = News.objects.all()[:2]

    # Teacher-блок (если директор реально преподаёт)
    next_entry = next_dt = None
    teacher_groups = Group.objects.none()
    my_open_remarks = 0
    if teacher:
        schedule_qs = (
            ScheduleEntry.objects
            .filter(teacher=teacher)
            .select_related("subject", "teacher__user", "group")
        )
        next_entry, next_dt = _find_next_lesson(schedule_qs, now)
        teacher_groups = _teacher_groups_qs(teacher)
        my_open_remarks = Remark.objects.filter(Q(teacher=teacher) | Q(author=request.user), resolved=False).count()

    context = {
        "director": director,
        "stats": stats,
        "news": recent_news,
        "teacher_mode": bool(teacher),
        "next_lesson": next_entry,
        "next_lesson_start": next_dt,
        "timestamp_ms": int(next_dt.timestamp() * 1000) if next_dt else 0,
        "groups": teacher_groups,
        "my_open_remarks": my_open_remarks,
    }
    return render(request, "core/dashboard_admin.html", context)


# =========================
# Pages
# =========================

@login_required
def schedule(request):
    student, teacher, director = _profiles(request.user)
    now = timezone.localtime()

    # scope
    base_qs = ScheduleEntry.objects.select_related("subject", "teacher__user", "group")

    group_id = _safe_int(request.GET.get("group"))
    if student:
        qs = base_qs.filter(group=student.group)
    elif teacher and not director:
        qs = base_qs.filter(teacher=teacher)
    else:
        # director: all (optional group filter)
        qs = base_qs.all()
        if group_id:
            qs = qs.filter(group_id=group_id)

    qs = qs.order_by("day_of_week", "time_start")

    next_entry, next_dt = _find_next_lesson(qs, now)

    # Next lesson card (template expects next_lesson.target_ms + strings)
    next_card = None
    if next_entry and next_dt:
        if teacher and not student:
            teacher_label = f"Группа {next_entry.group.code}"
        else:
            tname = next_entry.teacher.user.get_full_name() or next_entry.teacher.user.username
            teacher_label = tname

        next_card = SimpleNamespace(
            subject=next_entry.subject.name,
            room=next_entry.location,
            time=f"{next_entry.time_start} — {next_entry.time_end}",
            teacher=teacher_label,
            target_ms=int(next_dt.timestamp() * 1000),
        )

    # Table entries (template expects `entries`)
    entries = []
    for e in qs:
        tname = e.teacher.user.get_full_name() or e.teacher.user.username
        entries.append(
            SimpleNamespace(
                day_label=_weekday_label(e.day_of_week),
                time=f"{e.time_start} — {e.time_end}",
                subject=e.subject.name,
                location=e.location,
                teacher=tname if (student or director) else e.group.code,
                badge="Пара",
                badge_tone="good",
            )
        )

    context = {
        "next_lesson": next_card,
        "entries": entries,
    }
    return render(request, "core/schedule.html", context)


@login_required
def rating(request):
    student, teacher, director = _profiles(request.user)

    groups = Group.objects.all().order_by("code")
    selected_group_id = _safe_int(request.GET.get("group"))

    # default group for students
    if student and not selected_group_id:
        selected_group_id = student.group_id

    students_qs = Student.objects.select_related("user", "group")
    if selected_group_id:
        students_qs = students_qs.filter(group_id=selected_group_id)

    students_qs = students_qs.order_by("-gpa", "-attendance", "user__last_name", "user__first_name")

    students_list = list(students_qs[:200])  # safety cap
    top3 = students_list[:3]

    context = {
        "groups": groups,
        "selected_group_id": selected_group_id,
        "students": students_list,
        "top3": top3,
    }
    return render(request, "core/rating.html", context)


@login_required
def grades(request):
    student, teacher, director = _profiles(request.user)

    subject_id = _safe_int(request.GET.get("subject"))
    group_id = _safe_int(request.GET.get("group"))

    # Student mode
    if student and not (teacher or director):
        qs = Grade.objects.filter(student=student).select_related("subject")
        if subject_id:
            qs = qs.filter(subject_id=subject_id)

        qs = qs.order_by("-created_at")

        avg_grade = qs.aggregate(a=Avg("value")).get("a") or 0

        # best/weak subject (by avg)
        per_subject = (
            Grade.objects.filter(student=student)
            .values("subject__name")
            .annotate(a=Avg("value"))
            .order_by("-a")
        )
        best_subject = per_subject[0]["subject__name"] if per_subject else "—"
        weak_subject = per_subject.reverse()[0]["subject__name"] if per_subject else "—"

        subjects = (
            Subject.objects.filter(grade__student=student).distinct().order_by("name")
        )

        context = {
            "mode": "student",
            "subjects": subjects,
            "selected_subject_id": subject_id,
            "avg_grade": float(avg_grade),
            "best_subject": best_subject,
            "weak_subject": weak_subject,
            "attendance": student.attendance,
            "grades": qs,
        }
        return render(request, "core/grades.html", context)

    # Staff mode (teacher/director)
    qs = Grade.objects.select_related("student__user", "student__group", "subject")
    subjects = Subject.objects.all().order_by("name")
    groups = Group.objects.all().order_by("code")

    if teacher and not director:
        # ограничиваем предметами учителя
        qs = qs.filter(subject__in=teacher.subjects.all())
        subjects = teacher.subjects.all().order_by("name")

    if subject_id:
        qs = qs.filter(subject_id=subject_id)
    if group_id:
        qs = qs.filter(student__group_id=group_id)

    qs = qs.order_by("-created_at")

    context = {
        "mode": "staff",
        "subjects": subjects,
        "groups": groups,
        "selected_subject_id": subject_id,
        "selected_group_id": group_id,
        "grades": qs[:300],
    }
    return render(request, "core/grades.html", context)


@login_required
def homeworks(request):
    student, teacher, director = _profiles(request.user)

    # Student: own tasks with toggle
    if student and not (teacher or director):
        qs = (
            Homework.objects
            .filter(student=student)
            .select_related("subject")
            .order_by("completed", "deadline")
        )

        total = qs.count()
        done = qs.filter(completed=True).count()
        pending = total - done

        context = {
            "mode": "student",
            "allow_toggle": True,
            "homeworks": qs[:200],
            "total_count": total,
            "completed_count": done,
            "pending_count": pending,
        }
        return render(request, "core/homeworks.html", context)

    # Staff: overview (read-only)
    qs = Homework.objects.select_related("student__user", "student__group", "subject")
    if teacher and not director:
        qs = qs.filter(subject__in=teacher.subjects.all())

    qs = qs.order_by("completed", "deadline", "-created_at")

    total = qs.count()
    done = qs.filter(completed=True).count()
    pending = total - done

    context = {
        "mode": "staff",
        "allow_toggle": False,
        "homeworks": qs[:300],
        "total_count": total,
        "completed_count": done,
        "pending_count": pending,
    }
    return render(request, "core/homeworks.html", context)


@login_required
def remarks(request):
    student, teacher, director = _profiles(request.user)

    status = (request.GET.get("status") or "open").strip()  # open|resolved|all
    level = (request.GET.get("level") or "all").strip()     # INFO|WARN|CRITICAL|all

    qs = Remark.objects.select_related("student__user", "student__group", "teacher__user", "author")

    if student and not (teacher or director):
        qs = qs.filter(student=student)
    elif teacher and not director:
        qs = qs.filter(Q(teacher=teacher) | Q(author=request.user))
    else:
        qs = qs.all()

    if status == "open":
        qs = qs.filter(resolved=False)
    elif status == "resolved":
        qs = qs.filter(resolved=True)

    if level in {"INFO", "WARN", "CRITICAL"}:
        qs = qs.filter(level=level)

    open_count = qs.filter(resolved=False).count() if status == "all" else (
        Remark.objects.filter(resolved=False).count() if (director or teacher) else Remark.objects.filter(student=student, resolved=False).count()
    )

    context = {
        "remarks": qs.order_by("resolved", "-created_at")[:300],
        "open_count": open_count,
        "status": status,
        "level": level,
    }
    return render(request, "core/remarks.html", context)


@login_required
def notifications(request):
    notes = Notification.objects.filter(user=request.user).order_by("is_read", "-created_at")[:200]
    return render(request, "core/notifications.html", {"notifications": notes})


@login_required
def news_list(request):
    return render(request, "core/news_list.html", {"items": News.objects.all()[:30]})


@login_required
def settings_view(request):
    return render(request, "core/settings.html")


# =========================
# APIs
# =========================

@login_required
def api_toggle_homework(request, hw_id: int):
    if request.method != "POST":
        return JsonResponse({"ok": False, "error": "POST required"}, status=405)

    hw = get_object_or_404(Homework, id=hw_id)
    if hw.student.user_id != request.user.id:
        return HttpResponseForbidden("Forbidden")

    hw.completed = not hw.completed
    hw.save(update_fields=["completed"])
    return JsonResponse({"ok": True, "completed": hw.completed})


@login_required
def api_mark_notification_read(request, notif_id: int):
    if request.method != "POST":
        return JsonResponse({"ok": False, "error": "POST required"}, status=405)

    n = get_object_or_404(Notification, id=notif_id, user=request.user)
    if not n.is_read:
        n.is_read = True
        n.save(update_fields=["is_read"])
    return JsonResponse({"ok": True})
