from django.core.mail import send_mail
from django.conf import settings
from .models import OTPVerification, generate_otp


def send_otp_email(email, otp_code, otp_type):
    """Build and send OTP email based on type."""
    if otp_type == 'registration':
        subject = 'Verify Your Email - Finance Tracker'
        message = (
            f"Hello,\n\n"
            f"Thank you for registering with Finance Tracker!\n\n"
            f"Your email verification OTP is: {otp_code}\n\n"
            f"This OTP will expire in 10 minutes.\n\n"
            f"If you did not register, please ignore this email.\n\n"
            f"Best regards,\nFinance Tracker Team"
        )
    else:
        subject = 'Password Reset OTP - Finance Tracker'
        message = (
            f"Hello,\n\n"
            f"We received a request to reset your Finance Tracker password.\n\n"
            f"Your password reset OTP is: {otp_code}\n\n"
            f"This OTP will expire in 10 minutes.\n\n"
            f"If you did not request this, please ignore this email.\n\n"
            f"Best regards,\nFinance Tracker Team"
        )

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


def create_and_send_otp(email, otp_type):
    """
    Delete any existing pending OTPs for the given email+type,
    create a fresh one, send it via email, and return the OTP code.
    """
    # Invalidate any previous unused OTPs for this email/type
    OTPVerification.objects.filter(
        email=email,
        otp_type=otp_type,
        is_verified=False,
    ).delete()

    # Generate and store new OTP
    otp_code = generate_otp()
    OTPVerification.objects.create(
        email=email,
        otp=otp_code,
        otp_type=otp_type,
    )

    # Send the email
    send_otp_email(email, otp_code, otp_type)
    return otp_code
