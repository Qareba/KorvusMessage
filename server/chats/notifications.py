# consumers.py (или notifications.py)
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from urllib.parse import parse_qs
from rest_framework.authtoken.models import Token
from asgiref.sync import sync_to_async
from django.core.exceptions import ObjectDoesNotExist


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        params = parse_qs(self.scope['query_string'].decode())
        token = params.get('token', [None])[0]

        if not token:
            await self.close(code=4000)
            return

        user = await self.get_user_from_token(token)
        if not user:
            await self.close(code=4001)
            return

        self.scope['user'] = user
        self.room_group_name = f'notifications_{user.id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def notify(self, event):
        await self.send(text_data=json.dumps({
            'event': 'notify',
            'message': event['message'],
            'from_user': event.get('from_user'),
            'group': event.get('group')
        }))

    async def get_user_from_token(self, token):
        try:
            token_obj = await sync_to_async(Token.objects.get)(key=token)
            return await sync_to_async(lambda: token_obj.user)()
        except ObjectDoesNotExist:
            return None
