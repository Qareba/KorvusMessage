from django.urls import path
from .views import (GetUserAPIView, MessageListView, MessageDelete, 
                    PrivateChatCreateView, PrivateChatListView, PrivateChatView,
                    RegisterView, LoginView, GroupListAPIView, GroupChatAPIView,
                    GroupChatCreateView, GroupAddAPIView)

urlpatterns = [
    path('messages', MessageListView.as_view(), name='message-list-create'),
    path('messages/<int:id>', MessageDelete.as_view(), name='message-delete'),
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('users', GetUserAPIView.as_view(), name='user-list'),
    path('private', PrivateChatListView.as_view(), name='private-chat-list'),
    path('private/<int:chat_id>', PrivateChatView.as_view(), name='private-chat-detail'),
    path('private/create/<int:user_id>', PrivateChatCreateView.as_view(), name='private-chat-create'),
    path('group', GroupListAPIView.as_view(), name='group-chat-list'),
    path('group/<int:chat_id>', GroupChatAPIView.as_view(), name='group-chat-detail'),
    path('group/create', GroupChatCreateView.as_view(), name='group-chat-detail'),
    path('group/add/<int:chat_id>/<int:user_id>', GroupAddAPIView.as_view(), name='group-chat-create'),
]