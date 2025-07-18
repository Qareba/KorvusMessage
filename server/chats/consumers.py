from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
from .models import Message, PrivateChat, GroupChat
from urllib.parse import parse_qs
from rest_framework.authentication import get_authorization_header
from .auth import BearerToken
from rest_framework.authtoken.models import Token
from django.core.exceptions import ObjectDoesNotExist

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        params = parse_qs(self.scope['query_string'].decode())
        token = params.get('token', [None])[0]
        chat_type = params.get('chat', [None])[0]
        chat_id = params.get('chatId', [None])[0]
        self.chat_type = chat_type
        self.chat_id = chat_id

        if not token:
            await self.close(code=4000)
            return
        if chat_type not in ['private', 'group'] or not chat_id:
            await self.close(code=4003)
            return
    
        
        user = await self.get_user_from_token(token)
        if not user:
            await self.close(code=4001)
            return

        if chat_type == 'private':
            private_chat = await sync_to_async(PrivateChat.objects.get)(id=chat_id)
            if not private_chat:
                await self.close(code=4004)
                return
            user1 = await sync_to_async(lambda: private_chat.user1)()
            user2 = await sync_to_async(lambda: private_chat.user2)()
            if user != user1 and user != user2:
                await self.close(code=4005)
                return
                
        elif chat_type == 'group':
            group_chat = await sync_to_async(GroupChat.objects.get)(id=chat_id)
            if not group_chat:
                await self.close(code=4004)
                return
            if not await sync_to_async(group_chat.participants.filter(id=user.id).exists)():
                await self.close(code=4005)
                return
        self.scope['user'] = user

        self.room_group_name = f'chat_{chat_type}_{chat_id}'

        # Исправлено: self.channel_name (не chanel_name)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data.get('type') == 'delete':
            msg_id = data.get('id')
            if msg_id:
                # Получаем сообщение по id
                message = await sync_to_async(lambda: Message.objects.filter(id=msg_id).first())()
                if not message:
                    return
                msg_user = await sync_to_async(lambda: message.user)()
                if msg_user != self.scope['user']:
                    await self.send(text_data=json.dumps({
                        'error': 'You do not have permission to delete this message'
                    }))
                    return
                await sync_to_async(message.delete)()
                # Рассылаем всем клиентам событие об удалении
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "delete_message",
                        "id": msg_id
                    }
                )
            return 
        elif data.get('type') == 'update':
            msg_id = data.get('id')
            new_text = data.get('text')

            if not msg_id or not new_text:
                return  # Плохой запрос

    # Получаем сообщение
            message = await sync_to_async(lambda: Message.objects.filter(id=msg_id).first())()
            if not message:
                return

    # Проверяем владельца
            msg_user = await sync_to_async(lambda: message.user)()
            if msg_user != self.scope['user']:
                await self.send(text_data=json.dumps({
            'error': 'You do not have permission to edit this message'
                }))
                return

    # Обновляем текст
            message.text = new_text
            message.edited = True  # Если ты хочешь отмечать, что сообщение редактировалось
            await sync_to_async(message.save)()

    # Рассылаем обновлённое сообщение
            await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "update_message",  # для Channels
                "event": "update",         # для клиента
                "id": msg_id,
                "text": new_text,
                "user": message.user.username,
                "edited": True
            })
            return


        message = data.get('text')
        if message:
            user = self.scope['user']

            if self.chat_type == 'private':
                chat = await self.get_private_chat(user)
                if not chat:
                    await self.close(code=4004)
                    return
                message_obj = await sync_to_async(Message.objects.create)(text=message, user=user, private_chat=chat)
            elif self.chat_type == 'group':
                chat = await self.get_group_chat(user)
                if not chat:
                    await self.close(code=4004)
                    return
                message_obj = await sync_to_async(Message.objects.create)(text=message, user=user, group_chat=chat)
            else:
                await self.close(code=4003)
                return

            await self.channel_layer.group_send(
            self.room_group_name,
                        {
                            'type': 'chat_message',
                            'message': message,
                            'id': message_obj.id,
                            'user': {
                                'name': user.name
                            }
                        }
                    )

    async def chat_message(self, event):
        message = event['message']
        msg_id = event['id']
        user = event['user']

        await self.send(text_data=json.dumps({
            'text': message,
            'id': msg_id,
            'user': user
        }))

    async def delete_message(self, event):
        await self.send(text_data=json.dumps({
        'event': 'delete',
        'id': event['id'],
    }))
        
    async def get_user_from_token(self, token):
        try:
            token_obj = await sync_to_async(Token.objects.get)(key=token)
            user = await sync_to_async(lambda: token_obj.user)()
            return user
        except ObjectDoesNotExist:
            return None
        
    async def get_private_chat(self, user):
        try:
            chat = await sync_to_async(PrivateChat.objects.get)(id=self.chat_id)
            user1 = await sync_to_async(lambda: chat.user1)()
            user2 = await sync_to_async(lambda: chat.user2)()
            if user != user1 and user != user2:
                return None
            return chat
        except PrivateChat.DoesNotExist:
            return None

    async def get_group_chat(self, user):
        try:
            chat = await sync_to_async(GroupChat.objects.get)(id=self.chat_id)
            if not await sync_to_async(chat.participants.filter(id=user.id).exists)():
                return None
            return chat
        except GroupChat.DoesNotExist:
            return None

    async def update_message(self, event):
        await self.send(text_data=json.dumps({
        "event": "update",
        "text": event["text"],
        "id": event["id"],
        "user": event["user"],
        "edited": event["edited"]
    }))



