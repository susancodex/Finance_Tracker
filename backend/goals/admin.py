from django.contrib import admin
from .models import Goal


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'target_amount', 'saved_amount', 'status', 'target_date')
    list_filter = ('status',)
    search_fields = ('user__email', 'name')
    ordering = ('-created_at',)
