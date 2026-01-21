from django import forms
from .models import Submission


class SubmissionForm(forms.ModelForm):
    class Meta:
        model = Submission
        fields = ['file', 'message']
        widgets = {
            'message': forms.Textarea(attrs={'rows':4, 'placeholder':'Комментарий к работе (необязательно)'}),
        }


class GradeForm(forms.ModelForm):
    class Meta:
        model = Submission
        fields = ['grade', 'feedback']
        widgets = {
            'feedback': forms.Textarea(attrs={'rows':4}),
        }
