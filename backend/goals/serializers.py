from rest_framework import serializers
from .models import Goal


class GoalSerializer(serializers.ModelSerializer):
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = ['id', 'name', 'target_amount', 'saved_amount', 'target_date', 'status', 'percentage', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_percentage(self, obj):
        if obj.target_amount and float(obj.target_amount) > 0:
            return round((float(obj.saved_amount) / float(obj.target_amount)) * 100, 1)
        return 0
