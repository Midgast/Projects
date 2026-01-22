from __future__ import annotations

import random
from datetime import date, timedelta, time

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from core.models import (
    Group,
    Subject,
    Student,
    Teacher,
    Director,
    ScheduleEntry,
    Grade,
    Homework,
    Remark,
    News,
    Notification,
)


class Command(BaseCommand):
    help = "Seed demo data: 20 students (2 groups), 3 teachers, 1 director, schedule, grades, homeworks, remarks, news, notifications."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding demo data..."))

        # --- Clean volatile data (safe to повторять seed)
        ScheduleEntry.objects.all().delete()
        Grade.objects.all().delete()
        Homework.objects.all().delete()
        Remark.objects.all().delete()
        Notification.objects.all().delete()
        News.objects.all().delete()

        # Если в базе уже есть "пустые" code, удалим их (они как раз ломают UNIQUE)
        Subject.objects.filter(code__isnull=True).delete()
        Subject.objects.filter(code="").delete()
        Group.objects.filter(code__isnull=True).delete()
        Group.objects.filter(code="").delete()

        # 1) Groups (ВАЖНО: уникальный code)
        g1, _ = Group.objects.update_or_create(code="PO-1", defaults={"name": "ПО-1"})
        g2, _ = Group.objects.update_or_create(code="PO-2", defaults={"name": "ПО-2"})

        # 2) Subjects (ВАЖНО: уникальный code)
        sub_web, _ = Subject.objects.update_or_create(code="WEB", defaults={"name": "Веб-разработка"})
        sub_py, _ = Subject.objects.update_or_create(code="PY", defaults={"name": "Python Backend"})
        sub_ui, _ = Subject.objects.update_or_create(code="UIUX", defaults={"name": "UI/UX Design"})
        subjects = [sub_web, sub_py, sub_ui]

        # 3) Teachers (3)
        t1 = self._get_or_create_user("teacher_web", "Teacher", "Web")
        t2 = self._get_or_create_user("teacher_py", "Teacher", "Python")
        t3 = self._get_or_create_user("teacher_ui", "Teacher", "UIUX")

        teacher1, _ = Teacher.objects.get_or_create(user=t1)
        teacher2, _ = Teacher.objects.get_or_create(user=t2)
        teacher3, _ = Teacher.objects.get_or_create(user=t3)

        teacher1.subjects.set([sub_web])
        teacher2.subjects.set([sub_py])
        teacher3.subjects.set([sub_ui])

        # 4) Director (1)
        duser = self._get_or_create_user("director", "Director", "One")
        Director.objects.get_or_create(user=duser)

        # 5) Students (20, 2 groups)
        students = []
        for i in range(1, 21):
            username = f"student{i:02d}"
            user = self._get_or_create_user(username, "Student", f"{i:02d}")
            group = g1 if i <= 10 else g2

            gpa = round(random.uniform(3.2, 5.0), 2)
            attendance = random.randint(80, 100)

            st, _ = Student.objects.get_or_create(
                user=user,
                defaults={"group": group, "gpa": gpa, "attendance": attendance},
            )
            st.group = group
            st.gpa = gpa
            st.attendance = attendance
            st.save()

            students.append(st)

        # 6) Schedule
        def mk(weekday, start_hm, end_hm, subject, teacher, group, room):
            sh, sm = start_hm
            eh, em = end_hm
            return ScheduleEntry.objects.create(
                weekday=weekday,
                time_start=time(sh, sm),
                time_end=time(eh, em),
                subject=subject,
                teacher=teacher,
                group=group,
                location=room,
            )

        # group ПО-1
        mk(0, (9, 0), (10, 20), sub_py, teacher2, g1, "101 каб")
        mk(0, (10, 30), (11, 50), sub_web, teacher1, g1, "204 каб")
        mk(2, (9, 0), (10, 20), sub_ui, teacher3, g1, "Design Lab")
        mk(4, (11, 0), (12, 20), sub_web, teacher1, g1, "204 каб")

        # group ПО-2
        mk(1, (9, 0), (10, 20), sub_web, teacher1, g2, "204 каб")
        mk(1, (10, 30), (11, 50), sub_py, teacher2, g2, "101 каб")
        mk(3, (9, 0), (10, 20), sub_ui, teacher3, g2, "Design Lab")
        mk(4, (9, 0), (10, 20), sub_py, teacher2, g2, "101 каб")

        # 7) Grades
        for st in students:
            for _ in range(4):
                subject = random.choice(subjects)
                Grade.objects.create(
                    student=st,
                    subject=subject,
                    value=round(random.uniform(2.8, 5.0), 2),
                    note=random.choice(["Контрольная", "Практика", "Домашка", "Тест"]),
                )

        # 8) Homeworks
        today = date.today()
        for st in students:
            for k in range(3):
                subject = random.choice(subjects)
                Homework.objects.create(
                    student=st,
                    subject=subject,
                    title=f"Задание #{k+1}: {subject.name}",
                    deadline=today + timedelta(days=random.randint(1, 10)),
                    completed=random.choice([False, False, True]),
                )

        # 9) Remarks
        levels = ["INFO", "WARN", "CRITICAL"]
        for st in random.sample(students, 8):
            teacher = random.choice([teacher1, teacher2, teacher3])
            Remark.objects.create(
                student=st,
                teacher=teacher,
                level=random.choice(levels),
                text=random.choice([
                    "Опоздание на пару",
                    "Нет домашней работы",
                    "Отвлекался на занятии",
                    "Пропуск без причины",
                ]),
                resolved=random.choice([False, False, True]),
            )

        # 10) News
        News.objects.create(
            title="Хакатон колледжа",
            text="В субботу стартует хакатон. Команды, темы и призы — в админке."
        )
        News.objects.create(
            title="Обновление платформы",
            text="Добавили рейтинг, уведомления и стеклянный UI. Проверь свой профиль."
        )

        # 11) Notifications
        all_users = list(User.objects.filter(username__in=[
            "director", "teacher_web", "teacher_py", "teacher_ui"
        ])) + [st.user for st in students]

        for u in all_users:
            Notification.objects.create(user=u, title="Добро пожаловать", message="Платформа College Core готова к работе.", link="/dashboard/")
            Notification.objects.create(user=u, title="Новости", message="Проверь раздел новостей колледжа.", link="/news/")
            Notification.objects.create(user=u, title="Расписание", message="Открой расписание на неделю.", link="/schedule/")
            Notification.objects.create(user=u, title="Рейтинг", message="Рейтинг студентов обновляется автоматически.", link="/rating/")
            Notification.objects.create(user=u, title="Домашки", message="Проверь домашние задания и отметь выполненные.", link="/homeworks/")

        self.stdout.write(self.style.SUCCESS("Seed complete.\n"))
        self.stdout.write(self.style.SUCCESS("Logins:"))
        self.stdout.write("Director: director / 12345678")
        self.stdout.write("Teachers: teacher_web / 12345678, teacher_py / 12345678, teacher_ui / 12345678")
        self.stdout.write("Students: student01..student20 / 12345678")

    def _get_or_create_user(self, username: str, first: str, last: str):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={"first_name": first, "last_name": last},
        )
        if created:
            user.set_password("12345678")
            user.save()
        return user
