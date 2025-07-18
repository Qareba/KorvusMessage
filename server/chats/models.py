from django.db import models
from django.contrib.auth.models import AbstractUser
from django.forms import ValidationError


class User(AbstractUser):
    name = models.CharField(max_length=255)
    second_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, unique=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['name', 'second_name']

class Message(models.Model):
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    private_chat = models.ForeignKey("PrivateChat", null=True, blank=True, on_delete=models.CASCADE, related_name='messages')
    group_chat = models.ForeignKey("GroupChat", null=True, blank=True, on_delete=models.CASCADE, related_name='messages')
    edited = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.timestamp}: {self.text[:50]}"

    def clean(self):
        if not self.private_chat and not self.group_chat:
            raise ValidationError("Message must belong to a chat.")
        if self.private_chat and self.group_chat:
            raise ValidationError("Message can't belong to both a group and private chat.")
        
    def save(self, *args, **kwargs):
        self.clean()
        return super().save(*args, **kwargs)


class PrivateChat(models.Model):
    user1 = models.ForeignKey(User, related_name='chats_initiated', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='chats_received', on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user1', 'user2'],
                name = 'unique_private_chat_users'
            )
        ]

    def save(self, *args, **kwargs):
        if self.user1.id > self.user2.id:
            self.user1, self.user2 = self.user2, self.user1
        return super().save(*args, **kwargs)
    
class GroupChat(models.Model):
    name = models.CharField(max_length=255)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    participants = models.ManyToManyField(User, related_name='group_chats')