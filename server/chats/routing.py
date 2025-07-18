from django.urls import re_path
from . import consumers, notifications

websocket_urlpatterns = [
    re_path(r'ws/chat/?$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/notifications/?$', notifications.NotificationConsumer.as_asgi()),
]
