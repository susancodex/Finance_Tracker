# categories/views.py
from rest_framework import viewsets, permissions
from .models import Category
from .serializers import CategorySerializer

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Return only categories belonging to the logged-in user.
        """
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically set the logged-in user when creating a category.
        """
        serializer.save(user=self.request.user)