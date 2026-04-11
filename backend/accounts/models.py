from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    instrument = models.CharField(max_length=50, blank=True, help_text='Основной инструмент')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'

    def __str__(self):
        return self.display_name or self.user.username

    def save(self, *args, **kwargs):
        if not self.display_name:
            self.display_name = self.user.username
        super().save(*args, **kwargs)
