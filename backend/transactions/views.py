# transactions/views.py
from rest_framework import viewsets, permissions
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return only transactions belonging to the logged-in user.
        """
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically set the logged-in user when creating a transaction.
        """
        serializer.save(user=self.request.user)