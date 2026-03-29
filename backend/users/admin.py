from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Columns to show in the user list
    list_display = ('email', 'username', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')

    # Fields searchable in the admin
    search_fields = ('email', 'username', 'phone_number')
    ordering = ('email',)

    # Make timestamps read-only
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined')

    # Fields for editing existing users
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password', 'role', 'profile_picture', 'phone_number')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )

    # Fields for adding a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'profile_picture', 'phone_number', 'is_staff', 'is_active'),
        }),
    )