from django.contrib import admin
from .models import Budget


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'amount', 'month', 'created_at')
    list_filter = ('month',)
    search_fields = ('user__email', 'category__name')
    ordering = ('-month',)
