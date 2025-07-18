from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Message, PrivateChat, User, GroupChat
from .serializer import MessageSerializer, PrivateChatSerializer, RegSerializer, LoginSerializer, UserSerializer, GroupChatSerializer
from django.shortcuts import get_object_or_404
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated

class MessageListView(APIView):
    
    def get(self, request):
        messages = Message.objects.all()
        serializer = MessageSerializer(messages, many = True)
        return Response({
            'messages': serializer.data
        })
    
    def post(self, request):
        serializer = MessageSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageDelete(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, req, id, *args, **kwargs):
        message = get_object_or_404(Message, id = id)
        if message.user != req.user:
            return Response({'error': 'You do not have permission to delete this message'}, status=status.HTTP_403_FORBIDDEN)
        message.delete()
        return Response({
            'delete': 'succesful'
        })
    

class RegisterView(APIView):
    
    def post(self, request):
        serializer = RegSerializer(data = request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = Token.objects.create(user=user)
            return Response({
                'id': user.id,
                'name': user.name,
                'second_name': user.second_name,
                'phone': user.phone,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(APIView):
    
    def post(self, request):
        serializer = LoginSerializer(data = request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'id': user.id,
                'name': user.name,
                'second_name': user.second_name,
                'phone': user.phone,
                'token': token.key
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
class GetUserAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    

class PrivateChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        chat = get_object_or_404(PrivateChat, id=chat_id)
        if request.user != chat.user1 and request.user != chat.user2:
            return Response({
                'message': 'its not your chat'
            })
        messages = Message.objects.filter(private_chat__id=chat_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
class PrivateChatCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        user2 = get_object_or_404(User, id=user_id)
        chat = PrivateChat.objects.filter(user1=request.user, user2=user2).first() or \
            PrivateChat.objects.filter(user1=user2, user2=request.user).first()
        status_code = status.HTTP_200_OK
        if not chat:
            chat = PrivateChat.objects.create(user1=request.user, user2=user2)
            status_code = status.HTTP_201_CREATED

        return Response({
            'message': 'Chat created successfully',
            'chat_id': chat.id
        }, status=status_code)

class PrivateChatListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chats = PrivateChat.objects.filter(user1=request.user) | PrivateChat.objects.filter(user2=request.user)
        serializer = PrivateChatSerializer(chats, many=True)
        return Response(serializer.data)
    
class GroupChatAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        chat = get_object_or_404(GroupChat, id=chat_id)
        if request.user not in chat.participants.all():
            return Response({
                'message': 'its not your chat'
            })
        messages = Message.objects.filter(group_chat__id=chat_id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    

class GroupChatCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get('name')
        chat = GroupChat.objects.create(creator=request.user, name = name)
        chat.participants.add(request.user)
        return Response({
            'message': 'Chat created successfully',
            'chat_id': chat.id,
            'name': name,
            # 'participants': chat.participants,
        }, status=status.HTTP_201_CREATED)
    
class GroupAddAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id, user_id):
        chat = get_object_or_404(GroupChat, id=chat_id)
        if chat.creator != request.user:
            return Response({'message': 'Only creator can add users'}, status=403)
        user = get_object_or_404(User, id=user_id)
        if user in chat.participants.all():
            return Response({'message': 'User already in group'}, status=400)
        chat.participants.add(user)
        return Response({
            'message': 'User added to group chat successfully',
            'chat_id': chat.id,
            'user_id': user.id
        }, status=status.HTTP_200_OK)
    
class GroupListAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        chats = GroupChat.objects.filter(participants=request.user)
        serializer = GroupChatSerializer(chats, many=True)
        return Response(serializer.data)
