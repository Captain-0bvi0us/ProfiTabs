from django.db import models
from django.contrib.auth.models import User


class Tab(models.Model):
    INSTRUMENT_CHOICES = [
        ('guitar', 'Гитара'),
        ('electric', 'Электрогитара'),
        ('bass', 'Бас-гитара'),
        ('drums', 'Барабаны'),
    ]

    title = models.CharField(max_length=200, verbose_name='Название')
    artist = models.CharField(max_length=200, blank=True, verbose_name='Исполнитель')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tabs')
    instrument = models.CharField(max_length=20, choices=INSTRUMENT_CHOICES)
    tempo = models.PositiveIntegerField(default=120)
    time_signature_top = models.PositiveSmallIntegerField(default=4)
    time_signature_bottom = models.PositiveSmallIntegerField(default=4)
    tuning = models.JSONField(
        default=list, blank=True,
        help_text='Настройка струн, напр. ["E4","B3","G3","D3","A2","E2"]'
    )
    data = models.JSONField(
        default=dict,
        help_text='Данные табулатуры (такты, ноты, техники)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Табулатура'
        verbose_name_plural = 'Табулатуры'
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.title} — {self.get_instrument_display()}'


class TabShare(models.Model):
    tab = models.ForeignKey(Tab, on_delete=models.CASCADE, related_name='shares')
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_shares')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_shares')
    message = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Отправка таба'
        verbose_name_plural = 'Отправки табов'
        ordering = ['-created_at']
        unique_together = ['tab', 'from_user', 'to_user']

    def __str__(self):
        return f'{self.from_user} → {self.to_user}: {self.tab.title}'
