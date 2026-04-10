from rest_framework import serializers
from .models import Budget


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.type', read_only=True)

    class Meta:
        model = Budget
        fields = ['id', 'category', 'category_name', 'category_type', 'amount', 'month', 'created_at']
        read_only_fields = ['id', 'created_at']
