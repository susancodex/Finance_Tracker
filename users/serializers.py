from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

# Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'phone_number', 'profile_picture', 'role']

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # hash password
        user.save()
        return user

# User Serializer (Profile)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'phone_number', 'profile_picture', 'role', 'created_at', 'updated_at']
        read_only_fields = ['email', 'role', 'created_at', 'updated_at']