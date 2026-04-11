from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'phone_number', 'profile_picture', 'role']

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            username=validated_data.get('username', ''),
            phone_number=validated_data.get('phone_number', None),
            profile_picture=validated_data.get('profile_picture', None),
            role=validated_data.get('role', 'user'),
            is_active=False,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'phone_number',
            'profile_picture',
            'role',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['email', 'role', 'created_at', 'updated_at']


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_type = serializers.ChoiceField(
        choices=['registration', 'password_reset'],
        default='registration',
    )


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(min_length=6, write_only=True)
