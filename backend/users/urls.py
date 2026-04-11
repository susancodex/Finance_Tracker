from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    UserViewSet, change_password,
    VerifyEmailView, ResendOTPView,
    ForgotPasswordView, ResetPasswordView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = router.urls + [
    path('change-password/', change_password, name='change_password'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend_otp'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
]
