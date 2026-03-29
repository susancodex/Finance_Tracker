from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


# ── Registration ─────────────────────────────────────────────────────────────

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
        # Build user but mark as inactive until email is verified
        user = User(
            email=validated_data['email'],
            username=validated_data.get('username', ''),
            phone_number=validated_data.get('phone_number', None),
            profile_picture=validated_data.get('profile_picture', None),
            role=validated_data.get('role', 'user'),
            is_active=False,   # <-- inactive until OTP verified
        )
        user.set_password(validated_data['password'])  # hash password
        user.save()
        return user


# ── Profile ───────────────────────────────────────────────────────────────────

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


# ── OTP: Verify Email ─────────────────────────────────────────────────────────

class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp   = serializers.CharField(min_length=6, max_length=6)


# ── OTP: Resend OTP ───────────────────────────────────────────────────────────

class ResendOTPSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    otp_type = serializers.ChoiceField(
        choices=['registration', 'password_reset'],
        default='registration',
    )


# ── OTP: Forgot Password ──────────────────────────────────────────────────────

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


# ── OTP: Reset Password ───────────────────────────────────────────────────────

class ResetPasswordSerializer(serializers.Serializer):
    email        = serializers.EmailField()
    otp          = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(min_length=6, write_only=True)
