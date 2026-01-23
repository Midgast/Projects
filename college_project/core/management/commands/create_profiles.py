from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import UserProfile, Student, Teacher, Director, Group

class Command(BaseCommand):
    help = "Create UserProfile and profiles for existing users"

    def handle(self, *args, **options):
        for user in User.objects.all():
            if not hasattr(user, 'userprofile'):
                role = 'student'
                if hasattr(user, 'director'):
                    role = 'director'
                elif hasattr(user, 'teacher'):
                    role = 'teacher'
                UserProfile.objects.create(user=user, role=role)
                if role == 'student' and not hasattr(user, 'student'):
                    group, _ = Group.objects.get_or_create(code='default', defaults={'name': 'Default Group'})
                    Student.objects.create(user=user, group=group)
        self.stdout.write(self.style.SUCCESS("Profiles created for existing users"))
