from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Tab, TabShare


class TabListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.profile.display_name', read_only=True)

    class Meta:
        model = Tab
        fields = [
            'id', 'title', 'artist', 'instrument', 'tempo',
            'author', 'author_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['author']


class TabDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.profile.display_name', read_only=True)

    class Meta:
        model = Tab
        fields = [
            'id', 'title', 'artist', 'instrument', 'tempo',
            'time_signature_top', 'time_signature_bottom',
            'tuning', 'data',
            'author', 'author_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['author']


class TabShareCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TabShare
        fields = ['tab', 'to_user', 'message']

    def validate_to_user(self, value):
        if value == self.context['request'].user:
            raise serializers.ValidationError('Нельзя отправить таб самому себе.')
        return value

    def validate_tab(self, value):
        if value.author != self.context['request'].user:
            shared_to_me = TabShare.objects.filter(
                tab=value, to_user=self.context['request'].user
            ).exists()
            if not shared_to_me:
                raise serializers.ValidationError('Вы можете делиться только своими табами или табами, которые были отправлены вам.')
        return value


class TabShareListSerializer(serializers.ModelSerializer):
    tab_detail = TabListSerializer(source='tab', read_only=True)
    from_username = serializers.CharField(source='from_user.profile.display_name', read_only=True)
    to_username = serializers.CharField(source='to_user.profile.display_name', read_only=True)

    class Meta:
        model = TabShare
        fields = [
            'id', 'tab', 'tab_detail', 'from_user', 'from_username',
            'to_user', 'to_username', 'message', 'is_read', 'created_at',
        ]
