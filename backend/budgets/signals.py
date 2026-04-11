import logging
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum

logger = logging.getLogger(__name__)


def _check_and_alert(transaction):
    if transaction.type != 'expense' or not transaction.category_id:
        return

    from transactions.models import Transaction
    from .models import Budget

    month = transaction.date.strftime('%Y-%m')

    try:
        budget = Budget.objects.get(
            user=transaction.user,
            category=transaction.category,
            month=month,
        )
    except Budget.DoesNotExist:
        return

    if float(budget.amount) <= 0:
        return

    year, mon = month.split('-')
    spent = Transaction.objects.filter(
        user=transaction.user,
        category=transaction.category,
        type='expense',
        date__year=year,
        date__month=mon,
    ).aggregate(total=Sum('amount'))['total'] or 0

    percentage = float(spent) / float(budget.amount) * 100
    notified = budget.last_notified_threshold

    milestone = None
    if percentage >= 100 and (notified is None or notified < 100):
        milestone = 100
    elif percentage >= budget.alert_threshold and notified is None:
        milestone = budget.alert_threshold

    if milestone:
        from users.utils import send_budget_alert_email
        try:
            send_budget_alert_email(
                email=transaction.user.email,
                user_name=transaction.user.first_name or transaction.user.email,
                category_name=transaction.category.name,
                budget_amount=float(budget.amount),
                spent_amount=float(spent),
                percentage=round(percentage, 1),
                milestone=milestone,
                month=month,
            )
            Budget.objects.filter(pk=budget.pk).update(last_notified_threshold=milestone)
            logger.info("Budget alert sent to %s for %s at %s%%", transaction.user.email, budget.category.name, round(percentage, 1))
        except Exception as exc:
            logger.error("Failed to send budget alert: %s", exc)

    elif percentage < budget.alert_threshold and notified is not None:
        Budget.objects.filter(pk=budget.pk).update(last_notified_threshold=None)


def _lazy_connect():
    from transactions.models import Transaction

    if not post_save.has_receivers_for(Transaction):
        post_save.connect(_on_transaction_save, sender=Transaction)
        post_delete.connect(_on_transaction_delete, sender=Transaction)


def _on_transaction_save(sender, instance, **kwargs):
    _check_and_alert(instance)


def _on_transaction_delete(sender, instance, **kwargs):
    _check_and_alert(instance)
