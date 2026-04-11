from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Tab, TabShare
from .serializers import (
    TabListSerializer, TabDetailSerializer,
    TabShareCreateSerializer, TabShareListSerializer,
)


class TabListCreateView(generics.ListCreateAPIView):
    """List current user's tabs or create a new one."""

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TabDetailSerializer
        return TabListSerializer

    def get_queryset(self):
        return Tab.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class TabDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TabDetailSerializer

    def get_queryset(self):
        user = self.request.user
        own = Q(author=user)
        shared = Q(shares__to_user=user)
        return Tab.objects.filter(own | shared).distinct()

    def perform_update(self, serializer):
        if serializer.instance.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Можно редактировать только свои табы.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Можно удалять только свои табы.')
        instance.delete()


class ShareTabView(generics.CreateAPIView):
    serializer_class = TabShareCreateSerializer

    def perform_create(self, serializer):
        serializer.save(from_user=self.request.user)


class ReceivedSharesView(generics.ListAPIView):
    serializer_class = TabShareListSerializer

    def get_queryset(self):
        return TabShare.objects.filter(
            to_user=self.request.user
        ).select_related('tab', 'from_user__profile', 'to_user__profile')


class SentSharesView(generics.ListAPIView):
    serializer_class = TabShareListSerializer

    def get_queryset(self):
        return TabShare.objects.filter(
            from_user=self.request.user
        ).select_related('tab', 'from_user__profile', 'to_user__profile')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_share_read(request, pk):
    try:
        share = TabShare.objects.get(pk=pk, to_user=request.user)
    except TabShare.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    share.is_read = True
    share.save()
    return Response({'status': 'ok'})
