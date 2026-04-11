from django.core.mail import send_mail
from django.conf import settings
from .models import OTPVerification, generate_otp


def send_otp_email(email, otp_code, otp_type):
    if otp_type == 'registration':
        subject = 'Your Finance Tracker verification code'
        message = (
            f"Hi,\n\n"
            f"Your email verification code is: {otp_code}\n\n"
            f"It expires in 10 minutes. If you didn't sign up, ignore this.\n\n"
            f"— Finance Tracker"
        )
    else:
        subject = 'Your Finance Tracker password reset code'
        message = (
            f"Hi,\n\n"
            f"Your password reset code is: {otp_code}\n\n"
            f"It expires in 10 minutes. If you didn't request this, ignore this email.\n\n"
            f"— Finance Tracker"
        )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


def create_and_send_otp(email, otp_type):
    OTPVerification.objects.filter(
        email=email,
        otp_type=otp_type,
        is_verified=False,
    ).delete()

    otp_code = generate_otp()
    OTPVerification.objects.create(
        email=email,
        otp=otp_code,
        otp_type=otp_type,
    )

    send_otp_email(email, otp_code, otp_type)
    return otp_code
