from __future__ import annotations

from datetime import datetime, timedelta
from types import SimpleNamespace
from typing import Optional, Tuple, Iterable

from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Avg, Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .forms import LoginForm
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
    Teacher,
)
from .permissions import can_toggle_homework


# -----------------------------
# Helpers
# -----------------------------

def _now_local():
    return timezone.localtime(timezone.now())


def _as_aware_local(dt_naive: datetime) -> datetime:
    tz = timezone.get_current_timezone()
    return timezone.make_aware(dt_naive, tz)


def _next_occurrence_for_entry(entry: ScheduleEntry, now: datetime) -> datetime:
    """
    Next occurrence datetime for ScheduleEntry относительно now (локальная TZ).
    """
    days_ahead = (entry.weekday - now.weekday()) % 7
    candidate_date = now.date() + timedelta(days=days_ahead)

    candidate_naive = datetime.combine(candidate_date, entry.time_start)
    candidate = _as_aware_local(candidate_naive)

    if days_ahead == 0 and candidate <= now:
        candidate = candidate + timedelta(days=7)

    return candidate


def _find_next_lesson(qs, now: datetime) -> Tuple[Optional[ScheduleEntry], Optional[datetime]]:
    """
    Ближайшая пара по реальной дате (weekday + time_start).
    """
    entries = list(qs)
    if not entries:
        return None, None

    best = None
    best_dt = None

    for e in entries:
        dt = _next_occurrence_for_entry(e, now)
        if best_dt is None or dt < best_dt:
            best_dt = dt
            best = e

    return best, best_dt


def _patch_group_code(group: Group) -> Group:
    # чтобы шаблоны могли обращаться как group.code даже если поле называется иначе
    if not hasattr(group, "code"):
        setattr(group, "code", getattr(group, "name", ""))
    return group


def _patch_entry_group_code(entry: ScheduleEntry) -> ScheduleEntry:
    _patch_group_code(entry.group)
    return entry


def _patch_news_alias(news_qs: Iterable[News]) -> list[News]:
    items = list(news_qs)
    for n in items:
        if not hasattr(n, "content"):
            setattr(n, "content", getattr(n, "text", ""))
    return items


def _student_stats(student: Student) -> dict:
    avg_grade = (
        Grade.objects.filter(student=student).aggregate(a=Avg("value")).get("a")
        or getattr(student, "gpa", 0)
        or 0
    )
    return {
        "avg_grade": float(avg_grade),
        "attendance": f"{getattr(student, 'attendance', 0)}%",
    }


def _group_place(student: Student) -> Tuple[int, int]:
    qs = Student.objects.filter(group=student.group).order_by("-gpa", "-attendance", "user__username")
    ids = list(qs.values_list("id", flat=True))
    total = len(ids)
    try:
        place = ids.index(student.id) + 1
    except ValueError:
        place = 0
    return place, total


def _normalize_remark(r: Remark) -> SimpleNamespace:
    level = (getattr(r, "level", "") or "").upper()
    if level == "CRITICAL":
        severity = "high"
        title = "Замечание: критично"
    elif level == "WARN":
        severity = "medium"
        title = "Замечание: предупреждение"
    else:
        severity = "low"
        title = "Замечание"

    return SimpleNamespace(
        id=r.id,
        title=title,
        message=getattr(r, "text", ""),
        severity=severity,
        resolved=getattr(r, "resolved", False),
        created_at=getattr(r, "created_at", None),
        student=getattr(r, "student", None),
        teacher=getattr(r, "teacher", None),
    )


# -----------------------------
# Public pages (guest/login)
# -----------------------------

def guest_landing(request):
    if request.user.is_authenticated:
        return redirect("dashboard_router")

    news = _patch_news_alias(News.objects.order_by("-created_at")[:2])
    return render(request, "core/guest_dashboard.html", {"news": news})


def login_view(request):
    if request.user.is_authenticated:
        return redirect("dashboard_router")

    form = LoginForm(request, data=request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            login(request, form.get_user())
            return redirect("dashboard_router")
        messages.error(request, "Неверный логин или пароль.")

    return render(request, "core/login.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect("login")


# -----------------------------
# Dashboards
# -----------------------------

@login_required
def dashboard_router(request):
    user = request.user

    student = Student.objects.filter(user=user).select_related("group", "user").first()
    if student:
        return student_dashboard(request)

    teacher = Teacher.objects.filter(user=user).select_related("user").first()
    if teacher:
        return teacher_dashboard(request)

    director = Director.objects.filter(user=user).select_related("user").first()
    if director:
        return director_dashboard(request)

    return redirect("guest_landing")


@login_required
def student_dashboard(request):
    student = get_object_or_404(Student.objects.select_related("group", "user"), user=request.user)
    _patch_group_code(student.group)

    now = _now_local()
    schedule_qs = (
        ScheduleEntry.objects.filter(group=student.group)
        .select_related("subject", "teacher__user", "group")
        .order_by("weekday", "time_start")
    )
    next_lesson, next_dt = _find_next_lesson(schedule_qs, now)
    if next_lesson:
        _patch_entry_group_code(next_lesson)

    homeworks = list(
        Homework.objects.filter(student=student)
        .select_related("subject")
        .order_by("completed", "deadline")[:3]
    )
    for hw in homeworks:
        hw.own = True

    news = _patch_news_alias(News.objects.order_by("-created_at")[:4])

    stats = _student_stats(student)
    place, total = _group_place(student)

    context = {
        "student": student,
        "profile": student,  # на случай, если шаблон ждёт profile
        "stats": stats,
        "group_place": place,
        "group_total": total,
        "next_lesson": next_lesson,
        "next_lesson_start": next_dt,
        "timestamp_ms": int(next_dt.timestamp() * 1000) if next_dt else 0,
        "homeworks": homeworks,
        "news": news,
    }
    return render(request, "core/dashboard_student.html", context)


@login_required
def teacher_dashboard(request):
    teacher = get_object_or_404(Teacher.objects.select_related("user"), user=request.user)
    now = _now_local()

    schedule_qs = (
        ScheduleEntry.objects.filter(teacher=teacher)
        .select_related("subject", "teacher__user", "group")
        .order_by("weekday", "time_start")
    )
    next_lesson, next_dt = _find_next_lesson(schedule_qs, now)
    if next_lesson:
        _patch_entry_group_code(next_lesson)

    group_ids = schedule_qs.values_list("group_id", flat=True).distinct()
    groups = list(Group.objects.filter(id__in=group_ids).order_by("code"))
    for g in groups:
        _patch_group_code(g)

    open_remarks = Remark.objects.filter(teacher=teacher, resolved=False).count()
    news = _patch_news_alias(News.objects.order_by("-created_at")[:4])

    context = {
        "teacher": teacher,
        "groups": groups,
        "open_remarks": open_remarks,
        "next_lesson": next_lesson,
        "next_lesson_start": next_dt,
        "timestamp_ms": int(next_dt.timestamp() * 1000) if next_dt else 0,
        "news": news,
    }
    return render(request, "core/dashboard_teacher.html", context)


@login_required
def director_dashboard(request):
    director = get_object_or_404(Director.objects.select_related("user"), user=request.user)

    students_count = Student.objects.count()
    teachers_count = Teacher.objects.count()
    avg_gpa = Student.objects.aggregate(a=Avg("gpa")).get("a") or 0
    avg_att = Student.objects.aggregate(a=Avg("attendance")).get("a") or 0
    open_remarks_all = Remark.objects.filter(resolved=False).count()

    news = _patch_news_alias(News.objects.order_by("-created_at")[:4])

    teacher = Teacher.objects.filter(user=request.user).select_related("user").first()
    teacher_mode = bool(teacher)

    next_lesson = None
    next_dt = None
    groups = []
    my_open_remarks = 0

    if teacher_mode:
        now = _now_local()

        schedule_qs = (
            ScheduleEntry.objects.filter(teacher=teacher)
            .select_related("subject", "teacher__user", "group")
            .order_by("weekday", "time_start")
        )
        next_lesson, next_dt = _find_next_lesson(schedule_qs, now)
        if next_lesson:
            _patch_entry_group_code(next_lesson)

        group_ids = schedule_qs.values_list("group_id", flat=True).distinct()
        groups = list(Group.objects.filter(id__in=group_ids).order_by("code"))
        for g in groups:
            _patch_group_code(g)

        my_open_remarks = Remark.objects.filter(
            Q(resolved=False) & (Q(teacher=teacher) | Q(author=request.user))
        ).count()

    context = {
        "director": director,
        "stats": {
            "students": students_count,
            "teachers": teachers_count,
            "avg_gpa": float(avg_gpa),
            "avg_attendance": f"{avg_att:.0f}%",
            "open_remarks": open_remarks_all,
        },
        "news": news,
        "teacher_mode": teacher_mode,
        "teacher": teacher,
        "teacher_groups": groups,
        "teacher_next_lesson": next_lesson,
        "teacher_next_lesson_start": next_dt,
        "teacher_timestamp_ms": int(next_dt.timestamp() * 1000) if next_dt else 0,
        "my_open_remarks": my_open_remarks,
    }
    return render(request, "core/dashboard_admin.html", context)


# -----------------------------
# Pages
# -----------------------------

@login_required
def schedule(request):
    now = _now_local()

    if Student.objects.filter(user=request.user).exists():
        student = Student.objects.select_related("group").get(user=request.user)
        qs = ScheduleEntry.objects.filter(group=student.group)
    elif Teacher.objects.filter(user=request.user).exists():
        teacher = Teacher.objects.get(user=request.user)
        qs = ScheduleEntry.objects.filter(teacher=teacher)
    elif Director.objects.filter(user=request.user).exists():
        qs = ScheduleEntry.objects.all()
    else:
        qs = ScheduleEntry.objects.none()

    schedule_items = list(
        qs.select_related("subject", "teacher__user", "group").order_by("weekday", "time_start")
    )
    for e in schedule_items:
        _patch_entry_group_code(e)

    return render(request, "core/schedule.html", {"schedule": schedule_items, "now": now})


@login_required
def grades(request):
    student = Student.objects.filter(user=request.user).first()
    if not student:
        return render(request, "core/grades.html", {"grades": []})

    grades_qs = Grade.objects.filter(student=student).select_related("subject").order_by("-created_at")
    return render(request, "core/grades.html", {"grades": grades_qs})


@login_required
def homeworks(request):
    user = request.user

    student = Student.objects.filter(user=user).first()
    teacher = Teacher.objects.filter(user=user).first()
    director = Director.objects.filter(user=user).first()

    if student:
        qs = Homework.objects.filter(student=student).select_related(
            "subject", "student__user", "student__group"
        )
        items = list(qs.order_by("completed", "deadline"))
        for hw in items:
            hw.own = True
            _patch_group_code(hw.student.group)
        return render(request, "core/homeworks.html", {"homeworks": items})

    if teacher:
        subj_ids = teacher.subjects.values_list("id", flat=True)
        qs = Homework.objects.filter(subject_id__in=subj_ids).select_related(
            "subject", "student__user", "student__group"
        )
        items = list(qs.order_by("-deadline")[:80])
        for hw in items:
            hw.own = False
            _patch_group_code(hw.student.group)
        return render(request, "core/homeworks.html", {"homeworks": items})

    if director:
        qs = Homework.objects.all().select_related("subject", "student__user", "student__group")
        items = list(qs.order_by("-deadline")[:120])
        for hw in items:
            hw.own = False
            _patch_group_code(hw.student.group)
        return render(request, "core/homeworks.html", {"homeworks": items})

    return render(request, "core/homeworks.html", {"homeworks": []})


@login_required
def remarks(request):
    user = request.user

    student = Student.objects.filter(user=user).first()
    teacher = Teacher.objects.filter(user=user).first()
    director = Director.objects.filter(user=user).first()

    if student:
        qs = Remark.objects.filter(student=student)
    elif teacher:
        qs = Remark.objects.filter(teacher=teacher)
    elif director:
        qs = Remark.objects.all()
    else:
        qs = Remark.objects.none()

    qs = qs.select_related("student__user", "student__group", "teacher__user").order_by("-created_at")[:120]

    items = []
    for r in qs:
        _patch_group_code(r.student.group)
        items.append(_normalize_remark(r))

    return render(request, "core/remarks.html", {"remarks": items})


@login_required
def rating(request):
    students = list(
        Student.objects.select_related("user", "group").order_by("-gpa", "-attendance", "user__username")
    )
    for s in students:
        _patch_group_code(s.group)

    rating_list = [(i + 1, s) for i, s in enumerate(students)]
    return render(request, "core/rating.html", {"rating": rating_list, "user": request.user})


@login_required
def notifications(request):
    notes = Notification.objects.filter(user=request.user).order_by("-created_at")[:200]
    return render(request, "core/notifications.html", {"notifications": notes})


@login_required
def news_list(request):
    news_items = _patch_news_alias(News.objects.order_by("-created_at")[:200])
    return render(request, "core/news_list.html", {"news_list": news_items})


@login_required
def settings_view(request):
    return render(request, "core/settings.html")


# -----------------------------
# APIs
# -----------------------------

@require_POST
@login_required
def api_toggle_homework(request, pk: int):
    try:
        can_toggle_homework(request.user, pk)
        hw = get_object_or_404(Homework, pk=pk)
        hw.completed = not hw.completed
        hw.save(update_fields=["completed"])
        return JsonResponse({"ok": True, "completed": hw.completed})
    except Exception as e:
        return JsonResponse({"ok": False, "error": str(e)}, status=403)


@require_POST
@login_required
def api_mark_notification_read(request, pk: int):
    note = Notification.objects.filter(pk=pk, user=request.user).first()
    if not note:
        return JsonResponse({"ok": False, "error": "Not found"}, status=404)

    if not note.is_read:
        note.is_read = True
        note.save(update_fields=["is_read"])

    unread = Notification.objects.filter(user=request.user, is_read=False).count()
    return JsonResponse({"ok": True, "unread_count": unread})


# -----------------------------
# Compatibility aliases (под твой core/urls.py)
# -----------------------------

@require_POST
@login_required
def homework_toggle_api(request, hw_id: int):
    return api_toggle_homework(request, pk=hw_id)


@require_POST
@login_required
def notification_read_api(request, notification_id: int):
    return api_mark_notification_read(request, pk=notification_id)


@require_POST
@login_required
def mark_notification_read_api(request, pk: int):
    return api_mark_notification_read(request, pk=pk)


# Pages aliases (если urls ждёт другие имена)
def schedule_view(request):
    return schedule(request)


def grades_view(request):
    return grades(request)


def homeworks_view(request):
    return homeworks(request)


def remarks_view(request):
    return remarks(request)


def rating_view(request):
    return rating(request)


def notifications_view(request):
    return notifications(request)


def news_view(request):
    return news_list(request)


def settings_page(request):
    return settings_view(request)


def schedule_page(request):
    return schedule(request)


def grades_page(request):
    return grades(request)


def homeworks_page(request):
    return homeworks(request)


def remarks_page(request):
    return remarks(request)


def rating_page(request):
    return rating(request)


def notifications_page(request):
    return notifications(request)


def news_list_view(request):
    return news_list(request)


# -----------------------------
# Error pages
# -----------------------------

def error_400(request, exception):
    return render(request, "core/errors/400.html", status=400)


def error_403(request, exception):
    return render(request, "core/errors/403.html", status=403)


def error_404(request, exception):
    return render(request, "core/errors/404.html", status=404)


def error_500(request):
    return render(request, "core/errors/500.html", status=500)
