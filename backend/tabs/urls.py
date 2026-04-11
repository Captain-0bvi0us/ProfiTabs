from django.urls import path
from . import views

urlpatterns = [
    path('tabs/', views.TabListCreateView.as_view(), name='tab_list'),
    path('tabs/<int:pk>/', views.TabDetailView.as_view(), name='tab_detail'),
    path('shares/', views.ShareTabView.as_view(), name='share_tab'),
    path('shares/received/', views.ReceivedSharesView.as_view(), name='received_shares'),
    path('shares/sent/', views.SentSharesView.as_view(), name='sent_shares'),
    path('shares/<int:pk>/read/', views.mark_share_read, name='mark_share_read'),
]
