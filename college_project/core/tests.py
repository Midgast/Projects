from django.test import TestCase
from django.contrib.auth.models import User
from .models import UserProfile, Notification

class UserProfileModelTest(TestCase):
    def test_create_user_profile(self):
        user = User.objects.create_user('testuser', 'test@example.com', 'testpass')
        profile = UserProfile.objects.create(user=user, role='student')
        self.assertEqual(profile.role, 'student')

class NotificationModelTest(TestCase):
    def test_send_notification(self):
        user = User.objects.create_user('testuser2', 'test2@example.com', 'testpass')
        note = Notification.objects.create(user=user, message='Test notification')
        self.assertEqual(note.message, 'Test notification')
        self.assertFalse(note.is_read)
