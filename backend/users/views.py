import logging

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import OTPVerification
from .serializers import (
    RegisterSerializer, UserSerializer,
    VerifyEmailSerializer, ResendOTPSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer,
)
from .utils import create_and_send_otp

logger = logging.getLogger(__name__)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return RegisterSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        from django.conf import settings as django_settings

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        otp_code = None
        email_error = None
        try:
            otp_code = create_and_send_otp(user.email, 'registration')
        except Exception as e:
            logger.error("Failed to send registration OTP to %s: %s", user.email, e, exc_info=True)
            email_error = str(e)

        if email_error:
            return Response(
                {
                    'error': (
                        'Account created but we could not send the verification email. '
                        'Please go to the verification page and click "Resend code" to try again.'
                    ),
                    'redirect_verify': True,
                },
                status=status.HTTP_201_CREATED,
            )

        response_data = {
            'detail': 'Registration successful. Please check your email for a 6-digit verification OTP.',
        }
        using_console = 'console' in django_settings.EMAIL_BACKEND
        if django_settings.DEBUG and using_console:
            response_data['otp'] = otp_code

        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=['get', 'patch'],
        url_path='me',
        permission_classes=[permissions.IsAuthenticated],
    )
    def me(self, request):
        user = request.user
        if request.method == 'PATCH':
            serializer = UserSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        else:
            serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    user = request.user
    current = request.data.get('current_password')
    new_pw = request.data.get('new_password')

    if not user.check_password(current):
        return Response(
            {'error': 'Current password is incorrect.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not new_pw or len(new_pw) < 6:
        return Response(
            {'error': 'New password must be at least 6 characters.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    user.set_password(new_pw)
    user.save()
    return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']

        record = (
            OTPVerification.objects
            .filter(email=email, otp_type='registration', is_verified=False)
            .first()
        )

        if not record:
            return Response(
                {'error': 'No pending OTP found for this email. Please register or request a new OTP.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if record.is_expired():
            return Response(
                {'error': 'OTP has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if record.otp != otp:
            return Response(
                {'error': 'Invalid OTP. Please check and try again.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        record.is_verified = True
        record.save()

        try:
            user = User.objects.get(email=email)
            user.is_active = True
            user.save()
        except User.DoesNotExist:
            return Response(
                {'error': 'User account not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {'detail': 'Email verified successfully. You can now log in.'},
            status=status.HTTP_200_OK,
        )


class ResendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_type = serializer.validated_data.get('otp_type', 'registration')

        if otp_type == 'registration':
            try:
                user = User.objects.get(email=email)
                if user.is_active:
                    return Response(
                        {'error': 'This account is already verified.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except User.DoesNotExist:
                return Response(
                    {'error': 'No account found with this email.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

        if otp_type == 'password_reset':
            if not User.objects.filter(email=email, is_active=True).exists():
                return Response(
                    {'error': 'No active account found with this email.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

        from django.conf import settings as django_settings

        otp_code = None
        try:
            otp_code = create_and_send_otp(email, otp_type)
        except Exception:
            return Response(
                {'error': 'Failed to send OTP. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        response_data = {'detail': 'A new OTP has been sent to your email.'}
        using_console = 'console' in django_settings.EMAIL_BACKEND
        if django_settings.DEBUG and using_console:
            response_data['otp'] = otp_code

        return Response(response_data, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.conf import settings as django_settings

        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        otp_code = None
        if User.objects.filter(email=email, is_active=True).exists():
            try:
                otp_code = create_and_send_otp(email, 'password_reset')
            except Exception as e:
                logger.error("Failed to send password reset OTP to %s: %s", email, e, exc_info=True)

        response_data = {
            'detail': (
                'If an account with that email exists, '
                'a password reset OTP has been sent.'
            )
        }
        using_console = 'console' in django_settings.EMAIL_BACKEND
        if django_settings.DEBUG and using_console and otp_code:
            response_data['otp'] = otp_code

        return Response(response_data, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']

        record = (
            OTPVerification.objects
            .filter(email=email, otp_type='password_reset', is_verified=False)
            .first()
        )

        if not record:
            return Response(
                {'error': 'No pending OTP found. Please request a new password reset.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if record.is_expired():
            return Response(
                {'error': 'OTP has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if record.otp != otp:
            return Response(
                {'error': 'Invalid OTP. Please check and try again.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'No active account found with this email.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.set_password(new_password)
        user.save()

        record.is_verified = True
        record.save()

        return Response(
            {'detail': 'Password reset successful. You can now log in with your new password.'},
            status=status.HTTP_200_OK,
        )
