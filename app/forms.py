from django import forms

from .models import Subscriber


class ContactUsForm(forms.Form):
    name = forms.CharField()
    email = forms.EmailField()
    phone = forms.IntegerField(required=False)
    service = forms.CharField()
    message = forms.CharField(widget=forms.Textarea, required=False)


class UnsubscribeForm(forms.ModelForm):
    def clean(self):
        cleaned_data = super().clean()
        try:
            Subscriber.objects.get(email=cleaned_data['email'])
        except:
            self._errors['email'] = 'Email does not exist in subscribers list!'

    class Meta:
        model = Subscriber
        fields = ['email']
