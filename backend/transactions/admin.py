from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'category', 'amount', 'type', 'date']  # use correct fields
    list_filter = ['type', 'date', 'category']
    search_fields = ['note', 'user__email', 'category__name']
    ordering = ['-date', '-id']