from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import UserViewSet, change_password

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = router.urls + [
    path('change-password/', change_password, name='change_password'),
]
