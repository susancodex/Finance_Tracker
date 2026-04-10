from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Budget
from .serializers import BudgetSerializer
from transactions.models import Transaction
import datetime


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='with-spending')
    def with_spending(self, request):
        month = request.query_params.get('month', datetime.date.today().strftime('%Y-%m'))
        budgets = Budget.objects.filter(user=request.user, month=month)
        data = []
        for budget in budgets:
            year, mon = month.split('-')
            spent = Transaction.objects.filter(
                user=request.user,
                category=budget.category,
                type='expense',
                date__year=year,
                date__month=mon,
            ).aggregate(total=Sum('amount'))['total'] or 0

            serialized = BudgetSerializer(budget).data
            serialized['spent'] = float(spent)
            serialized['percentage'] = round((float(spent) / float(budget.amount)) * 100, 1) if float(budget.amount) > 0 else 0
            data.append(serialized)
        return Response(data)
