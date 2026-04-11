from django.apps import AppConfig


class BudgetsConfig(AppConfig):
    name = 'budgets'

    def ready(self):
        from transactions.models import Transaction
        from django.db.models.signals import post_save, post_delete
        from .signals import _on_transaction_save, _on_transaction_delete

        post_save.connect(_on_transaction_save, sender=Transaction)
        post_delete.connect(_on_transaction_delete, sender=Transaction)
