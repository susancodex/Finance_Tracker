import os
import logging

logger = logging.getLogger(__name__)


def _send_email(to_email, subject, plain, html):
    try:
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        msg.attach_alternative(html, 'text/html')
        msg.send(fail_silently=False)
    except Exception as e:
        logger.error("Email failed to %s: %s", to_email, str(e))
        raise


def send_budget_alert_email(email, user_name, category_name, budget_amount, spent_amount, percentage, milestone, month):
    from datetime import datetime
    month_label = datetime.strptime(month, '%Y-%m').strftime('%B %Y')

    remaining = budget_amount - spent_amount
    is_over = percentage >= 100

    if is_over:
        subject = f'Budget exceeded: {category_name} ({month_label})'
        heading = 'You\'ve exceeded your budget'
        badge_color = '#ef4444'
        badge_text = 'Over Budget'
        message = f'Your <strong style="color:#f1f5f9;">{category_name}</strong> spending has exceeded your budget for {month_label}.'
        footer_msg = 'Consider reviewing your spending or adjusting your budget limit.'
    else:
        subject = f'Budget alert: {category_name} at {milestone}% ({month_label})'
        heading = f'Budget alert — {milestone}% reached'
        badge_color = '#f59e0b'
        badge_text = f'{milestone}% Used'
        message = f'Your <strong style="color:#f1f5f9;">{category_name}</strong> spending has reached {milestone}% of your budget for {month_label}.'
        footer_msg = f'You have <strong style="color:#10b981;">${remaining:,.2f}</strong> remaining in this budget.'

    plain = (
        f"Hi {user_name},\n\n"
        f"{message.replace('<strong style=\"color:#f1f5f9;\">', '').replace('</strong>', '')}\n\n"
        f"Category: {category_name}\n"
        f"Budget: ${budget_amount:,.2f}\n"
        f"Spent: ${spent_amount:,.2f}\n"
        f"Usage: {percentage:.1f}%\n\n"
        f"— Finance Tracker"
    )

    html = f"""<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
             style="background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
        <tr>
          <td style="padding:32px 40px;text-align:center;background:#10b981;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;color:#0f172a;font-size:22px;font-weight:700;letter-spacing:-0.5px;">FinanceTracker</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <div style="display:inline-block;background:{badge_color}22;border:1px solid {badge_color}55;
                        border-radius:999px;padding:4px 14px;margin-bottom:16px;">
              <span style="color:{badge_color};font-size:13px;font-weight:600;">{badge_text}</span>
            </div>
            <h2 style="margin:0 0 10px;color:#f1f5f9;font-size:20px;font-weight:700;">{heading}</h2>
            <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.6;">{message}</p>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#0f172a;border-radius:12px;border:1px solid #334155;margin-bottom:20px;">
              <tr>
                <td style="padding:14px 20px;border-bottom:1px solid #1e293b;">
                  <span style="color:#64748b;font-size:13px;">Category</span><br>
                  <span style="color:#f1f5f9;font-weight:600;">{category_name}</span>
                </td>
                <td style="padding:14px 20px;border-bottom:1px solid #1e293b;text-align:right;">
                  <span style="color:#64748b;font-size:13px;">Month</span><br>
                  <span style="color:#f1f5f9;font-weight:600;">{month_label}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;">
                  <span style="color:#64748b;font-size:13px;">Spent</span><br>
                  <span style="color:#f1f5f9;font-weight:700;font-size:18px;">${spent_amount:,.2f}</span>
                  <span style="color:#64748b;font-size:13px;"> of ${budget_amount:,.2f}</span>
                </td>
                <td style="padding:14px 20px;text-align:right;">
                  <span style="color:#64748b;font-size:13px;">Usage</span><br>
                  <span style="color:{badge_color};font-weight:700;font-size:18px;">{percentage:.1f}%</span>
                </td>
              </tr>
            </table>
            <div style="background:#0f172a;border-radius:8px;height:10px;overflow:hidden;margin-bottom:20px;">
              <div style="background:{badge_color};height:100%;width:{min(percentage, 100):.1f}%;border-radius:8px;"></div>
            </div>
            <p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.6;">{footer_msg}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #334155;text-align:center;">
            <p style="margin:0;color:#475569;font-size:12px;">&copy; 2026 Finance Tracker &mdash; Budget Alerts</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""

    _send_email(email, subject, plain, html)
