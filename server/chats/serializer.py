from rest_framework import serializers
from .models import Message, User, PrivateChat, GroupChat
from rest_framework.authentication import authenticate

class RegSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = ['id', 'password', 'name', 'second_name', 'phone']

    def create(self, validated_data):
        user = User(
            name=validated_data['name'],
            second_name=validated_data['second_name'],
            phone=validated_data['phone'],
            username=validated_data['phone']  # Use phone as username
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(**attrs)
        if user:
            return user
        return False

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'name', 'second_name']

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Message
        fields = ['id', 'text', 'timestamp', 'user', 'edited']

from .models import PrivateChat

class PrivateChatSerializer(serializers.ModelSerializer):
    user1 = UserSerializer(read_only=True)
    user2 = UserSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = PrivateChat
        fields = ['id', 'user1', 'user2', 'messages']

class PrivateChatCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivateChat
        fields = ['user1', 'user2']


from .models import GroupChat

class GroupChatSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = GroupChat
        fields = ['id', 'name', 'creator', 'participants', 'messages']


class GroupChatCreateSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all()
    )

    class Meta:
        model = GroupChat
        fields = ['name', 'participants']
