from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User

class LoginForm(AuthenticationForm):
    username = forms.CharField(max_length=150, widget=forms.TextInput(attrs={'autofocus': True, 'class': 'form-control'}))
    password = forms.CharField(label='Password', strip=False, widget=forms.PasswordInput(attrs={'class': 'form-control'}))
