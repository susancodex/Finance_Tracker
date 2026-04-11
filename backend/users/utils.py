import os
import resend
from django.conf import settings
from .models import OTPVerification, generate_otp


def _build_email_html(otp_code, otp_type):
    if otp_type == 'registration':
        heading = 'Verify your email'
        body_text = 'Use the code below to verify your email address. It expires in <strong style="color:#e2e8f0;">10 minutes</strong>.'
        footer_note = "If you didn't create an account, you can safely ignore this email."
    else:
        heading = 'Reset your password'
        body_text = 'Use the code below to reset your password. It expires in <strong style="color:#e2e8f0;">10 minutes</strong>.'
        footer_note = "If you didn't request a password reset, you can safely ignore this email."

    return f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
             style="background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
        <tr>
          <td style="padding:32px 40px;text-align:center;background:#10b981;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;color:#0f172a;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
              FinanceTracker
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="margin:0 0 12px;color:#f1f5f9;font-size:20px;font-weight:600;">
              {heading}
            </h2>
            <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">
              {body_text}
            </p>
            <div style="text-align:center;margin:0 0 28px;">
              <div style="display:inline-block;background:#0f172a;border:2px solid #10b981;
                          border-radius:12px;padding:20px 40px;">
                <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#10b981;
                             font-family:monospace;">{otp_code}</span>
              </div>
            </div>
            <p style="margin:0;color:#64748b;font-size:13px;text-align:center;">
              {footer_note}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #334155;text-align:center;">
            <p style="margin:0;color:#475569;font-size:12px;">&copy; 2026 Finance Tracker</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""


def send_otp_email(email, otp_code, otp_type):
    resend_api_key = os.environ.get('RESEND_API_KEY', '')

    if otp_type == 'registration':
        subject = 'Your Finance Tracker verification code'
        plain = (
            f"Hi,\n\n"
            f"Your email verification code is: {otp_code}\n\n"
            f"It expires in 10 minutes. If you didn't sign up, ignore this.\n\n"
            f"— Finance Tracker"
        )
    else:
        subject = 'Your Finance Tracker password reset code'
        plain = (
            f"Hi,\n\n"
            f"Your password reset code is: {otp_code}\n\n"
            f"It expires in 10 minutes. If you didn't request this, ignore this email.\n\n"
            f"— Finance Tracker"
        )

    html = _build_email_html(otp_code, otp_type)

    if resend_api_key:
        resend.api_key = resend_api_key
        params = resend.Emails.SendParams(
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
            subject=subject,
            html=html,
            text=plain,
        )
        resend.Emails.send(params)
    else:
        from django.core.mail import EmailMultiAlternatives
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        msg.attach_alternative(html, 'text/html')
        msg.send(fail_silently=False)


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
