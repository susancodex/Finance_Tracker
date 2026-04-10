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


# ── User Registration & Profile ───────────────────────────────────────────────

class UserViewSet(viewsets.ModelViewSet):
    """
    Handles:
    - User registration (POST /users/)      → sends verification OTP
    - User profile     (GET/PATCH /users/me/)
    """
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
        """Register a new (inactive) user and send email OTP."""
        from django.conf import settings as django_settings

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()  # is_active=False is set in the serializer

        # Send OTP for email verification
        otp_code = None
        try:
            otp_code = create_and_send_otp(user.email, 'registration')
        except Exception as e:
            logger.error("Failed to send registration OTP to %s: %s", user.email, e, exc_info=True)

        response_data = {
            'detail': 'Registration successful. Please check your email for a 6-digit verification OTP.',
        }
        # Only expose OTP in response when using console backend (no real email configured)
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
        """Retrieve or update the current logged-in user's profile."""
        user = request.user
        if request.method == 'PATCH':
            serializer = UserSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        else:
            serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ── Change Password (authenticated) ──────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Allow a logged-in user to change their password."""
    user = request.user
    current = request.data.get('current_password')
    new_pw  = request.data.get('new_password')

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


# ── Verify Email OTP ──────────────────────────────────────────────────────────

class VerifyEmailView(APIView):
    """
    POST /api/verify-email/
    Body: { "email": "...", "otp": "123456" }
    Activates the user account if the OTP is correct and not expired.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp   = serializer.validated_data['otp']

        # Find the latest unverified registration OTP for this email
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

        # Mark OTP as used and activate the user
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


# ── Resend OTP ────────────────────────────────────────────────────────────────

class ResendOTPView(APIView):
    """
    POST /api/resend-otp/
    Body: { "email": "...", "otp_type": "registration" | "password_reset" }
    Generates a fresh OTP and re-sends it to the email.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email    = serializer.validated_data['email']
        otp_type = serializer.validated_data.get('otp_type', 'registration')

        # For registration OTP, the user must exist and be inactive
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

        # For password reset OTP, the user must exist and be active
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


# ── Forgot Password ───────────────────────────────────────────────────────────

class ForgotPasswordView(APIView):
    """
    POST /api/forgot-password/
    Body: { "email": "..." }
    Sends a password-reset OTP to the given email (if an active account exists).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']

        # Always respond the same way to prevent email enumeration attacks
        if User.objects.filter(email=email, is_active=True).exists():
            try:
                create_and_send_otp(email, 'password_reset')
            except Exception as e:
                logger.error("Failed to send password reset OTP to %s: %s", email, e, exc_info=True)

        return Response(
            {
                'detail': (
                    'If an account with that email exists, '
                    'a password reset OTP has been sent.'
                )
            },
            status=status.HTTP_200_OK,
        )


# ── Reset Password ────────────────────────────────────────────────────────────

class ResetPasswordView(APIView):
    """
    POST /api/reset-password/
    Body: { "email": "...", "otp": "123456", "new_password": "..." }
    Validates the OTP and updates the user's password.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email        = serializer.validated_data['email']
        otp          = serializer.validated_data['otp']
        new_password = serializer.validated_data['new_password']

        # Find the latest unverified password-reset OTP
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

        # Update password
        try:
            user = User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            return Response(
                {'error': 'No active account found with this email.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        user.set_password(new_password)
        user.save()

        # Mark OTP as used
        record.is_verified = True
        record.save()

        return Response(
            {'detail': 'Password reset successful. You can now log in with your new password.'},
            status=status.HTTP_200_OK,
        )
