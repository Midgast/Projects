from django.core.exceptions import PermissionDenied
from core.models import Student, Homework

def can_toggle_homework(user, homework_id):
    try:
        student = Student.objects.get(user=user)
        homework = Homework.objects.get(id=homework_id)
        if homework.student != student:
            raise PermissionDenied('You cannot modify others homework.')
        return True
    except Student.DoesNotExist:
        raise PermissionDenied('Only students can toggle homework.')
    except Homework.DoesNotExist:
        raise PermissionDenied('Homework not found.')

def can_view_student_data(user, student_id):
    try:
        student = Student.objects.get(user=user)
        if student.id != student_id:
            raise PermissionDenied('You cannot view others data.')
        return True
    except Student.DoesNotExist:
        raise PermissionDenied('Only students can view this data.')
