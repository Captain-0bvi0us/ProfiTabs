from django.contrib import admin
from .models import Tab, TabShare


@admin.register(Tab)
class TabAdmin(admin.ModelAdmin):
    list_display = ['title', 'artist', 'instrument', 'author', 'created_at']
    list_filter = ['instrument']
    search_fields = ['title', 'artist']


@admin.register(TabShare)
class TabShareAdmin(admin.ModelAdmin):
    list_display = ['tab', 'from_user', 'to_user', 'is_read', 'created_at']
    list_filter = ['is_read']
