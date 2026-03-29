# users/urls.py
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
    # Authenticated password change (from Profile page)
    path('change-password/', change_password, name='change_password'),

    # OTP email verification (registration flow)
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-otp/',   ResendOTPView.as_view(),   name='resend_otp'),

    # Forgot / reset password (unauthenticated)
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/',  ResetPasswordView.as_view(),  name='reset_password'),
]
