from __future__ import annotations

import base64
import random
from datetime import date, timedelta, time

from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import (
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


# 1x1 PNG (transparent). Нужен, потому что News.image = REQUIRED
_PNG_1X1 = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+lmZkAAAAASUVORK5CYII="
)


class Command(BaseCommand):
    help = "Seed demo data (idempotent): users, groups, subjects, schedule, grades, homeworks, remarks, news, notifications."

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding demo data (idempotent)..."))

        # 0) Чистим “волатильные” данные — безопасно повторять seed
        ScheduleEntry.objects.all().delete()
        Grade.objects.all().delete()
        Homework.objects.all().delete()
        Remark.objects.all().delete()
        Notification.objects.all().delete()
        News.objects.all().delete()

        # 1) Groups (по code — уникально)
        g1 = self._upsert(Group, {"code": "PO-1"}, {"name": "ПО-1"})
        g2 = self._upsert(Group, {"code": "PO-2"}, {"name": "ПО-2"})

        # 2) Subjects (по code — уникально)
        sub_web = self._upsert(Subject, {"code": "WEB"}, {"name": "Веб-разработка"})
        sub_py = self._upsert(Subject, {"code": "PY"}, {"name": "Python Backend"})
        sub_ui = self._upsert(Subject, {"code": "UIUX"}, {"name": "UI/UX Design"})
        subjects = [sub_web, sub_py, sub_ui]

        # 3) Teachers (3) + назначение предметов
        t1u = self._upsert_user("teacher_web", "Teacher", "Web")
        t2u = self._upsert_user("teacher_py", "Teacher", "Python")
        t3u = self._upsert_user("teacher_ui", "Teacher", "UIUX")

        t1 = self._upsert(Teacher, {"user": t1u}, {"department": "IT"})
        t2 = self._upsert(Teacher, {"user": t2u}, {"department": "IT"})
        t3 = self._upsert(Teacher, {"user": t3u}, {"department": "Design"})

        t1.subjects.set([sub_web])
        t2.subjects.set([sub_py])
        t3.subjects.set([sub_ui])

        # 4) Director (1) + директор также Teacher (без поля bio!)
        duser = self._upsert_user("director", "Director", "One")
        self._upsert(Director, {"user": duser}, {})
        d_teacher = self._upsert(Teacher, {"user": duser}, {"department": "Administration"})
        # директор как преподаватель может вести один предмет (для teacher-mode)
        d_teacher.subjects.set([sub_py])

        # 5) Students (20, 2 группы)
        students = []
        for i in range(1, 21):
            username = f"student{i:02d}"
            u = self._upsert_user(username, "Student", f"{i:02d}")

            group = g1 if i <= 10 else g2
            gpa = round(random.uniform(3.2, 5.0), 2)
            attendance = random.randint(80, 100)

            st = self._upsert(
                Student,
                {"user": u},
                {
                    "group": group,
                    "course": 2,
                    "specialty": "Software Engineering",
                    "gpa": gpa,
                    "attendance": attendance,
                },
            )
            students.append(st)

        # 6) Schedule (пример “как в колледже”)
        def mk(weekday: int, sh: int, sm: int, eh: int, em: int, subject, teacher, group, room: str):
            ScheduleEntry.objects.create(
                weekday=weekday,
                time_start=time(sh, sm),
                time_end=time(eh, em),
                subject=subject,
                teacher=teacher,
                group=group,
                location=room,
            )

        # ПО-1
        mk(0, 9, 0, 10, 20, sub_py, t2, g1, "101 каб")
        mk(0, 10, 30, 11, 50, sub_web, t1, g1, "204 каб")
        mk(2, 9, 0, 10, 20, sub_ui, t3, g1, "Design Lab")
        mk(4, 11, 0, 12, 20, sub_web, t1, g1, "204 каб")

        # ПО-2
        mk(1, 9, 0, 10, 20, sub_web, t1, g2, "204 каб")
        mk(1, 10, 30, 11, 50, sub_py, t2, g2, "101 каб")
        mk(3, 9, 0, 10, 20, sub_ui, t3, g2, "Design Lab")
        mk(4, 9, 0, 10, 20, sub_py, t2, g2, "101 каб")

        # Директор как преподаватель (чтобы teacher-mode на его даше был “живой”)
        mk(2, 10, 30, 11, 50, sub_py, d_teacher, g1, "101 каб")

        # 7) Grades
        for st in students:
            for _ in range(4):
                subj = random.choice(subjects)
                Grade.objects.create(
                    student=st,
                    subject=subj,
                    value=round(random.uniform(2.8, 5.0), 1),
                    note=random.choice(["Контрольная", "Практика", "Домашка", "Тест"]),
                )

        # 8) Homeworks
        today = date.today()
        for st in students:
            for k in range(3):
                subj = random.choice(subjects)
                Homework.objects.create(
                    student=st,
                    subject=subj,
                    title=f"Задание #{k+1}: {subj.name}",
                    description="",
                    deadline=today + timedelta(days=random.randint(1, 10)),
                    completed=random.choice([False, False, True]),
                )

        # 9) Remarks (часть — от преподавателей, часть — от директора)
        levels = ["INFO", "WARN", "CRITICAL"]

        # от преподавателей
        for st in random.sample(students, 8):
            teacher = random.choice([t1, t2, t3])
            Remark.objects.create(
                student=st,
                teacher=teacher,
                author=teacher.user,
                level=random.choice(levels),
                text=random.choice([
                    "Опоздание на пару",
                    "Нет домашней работы",
                    "Отвлекался на занятии",
                    "Пропуск без причины",
                ]),
                resolved=random.choice([False, False, True]),
            )

        # от директора (teacher может быть null)
        for st in random.sample(students, 4):
            Remark.objects.create(
                student=st,
                teacher=None,
                author=duser,
                level=random.choice(["WARN", "CRITICAL"]),
                text=random.choice([
                    "Замечание от администрации",
                    "Нарушение дисциплины",
                    "Требуется беседа",
                ]),
                resolved=False,
            )

        # 10) News (обязательная картинка!)
        News.objects.create(
            title="Хакатон колледжа",
            text="В субботу стартует хакатон. Команды, темы и призы — уточняй у куратора.",
            tag="events",
            image=ContentFile(_PNG_1X1, name="news_hackathon.png"),
        )
        News.objects.create(
            title="Обновление платформы",
            text="Добавили рейтинг, уведомления и стеклянный UI. Проверь свой профиль.",
            tag="updates",
            image=ContentFile(_PNG_1X1, name="news_update.png"),
        )

        # 11) Notifications (всем пользователям)
        all_users = [duser, t1u, t2u, t3u] + [st.user for st in students]

        for u in all_users:
            Notification.objects.create(
                user=u, type="system",
                title="Добро пожаловать",
                message="College Core готов к работе.",
                link="/dashboard/",
            )
            Notification.objects.create(
                user=u, type="news",
                title="Новости",
                message="Проверь актуальные новости колледжа.",
                link="/news/",
            )
            Notification.objects.create(
                user=u, type="system",
                title="Расписание",
                message="Открой расписание на неделю.",
                link="/schedule/",
            )

        self.stdout.write(self.style.SUCCESS("Seed complete."))
        self.stdout.write(self.style.SUCCESS("Logins:"))
        self.stdout.write("Director: director / 12345678")
        self.stdout.write("Teachers: teacher_web / 12345678, teacher_py / 12345678, teacher_ui / 12345678")
        self.stdout.write("Students: student01..student20 / 12345678")

    def _upsert(self, model, lookup: dict, defaults: dict):
        obj, _ = model.objects.update_or_create(**lookup, defaults=defaults)
        return obj

    def _upsert_user(self, username: str, first: str, last: str) -> User:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"first_name": first, "last_name": last},
        )
        # гарантируем, что пароль известен для демо (можно повторять seed)
        if created or not user.has_usable_password():
            user.set_password("12345678")
        user.first_name = first
        user.last_name = last
        user.save()
        return user
