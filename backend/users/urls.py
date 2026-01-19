"""
================================================================================
USER URLS - URL Routing for User API Endpoints
================================================================================

PURPOSE:
This file defines all URL patterns (routes) for user-related API endpoints.
Each URL pattern maps a URL path to a view function that handles the request.

HOW DJANGO URLS WORK:
1. Request comes in (e.g., POST /api/users/login/)
2. Django matches the URL against patterns in this file
3. When a match is found, the corresponding view function is called
4. The view processes the request and returns a response

URL PATTERNS DEFINED:
Authentication:
- /api/users/register/      → Register new user
- /api/users/login/         → Login user
- /api/users/logout/        → Logout user
- /api/users/me/            → Get current user info

Profile:
- /api/users/profile/update/ → Update own profile

User Management (Warden only):
- /api/users/create-user/           → Create new user
- /api/users/list/                  → List all users
- /api/users/update-user/<id>/      → Update user by ID
- /api/users/delete-user/<id>/      → Delete user by ID

Password Reset:
- /api/users/request-reset/         → Request reset code (email)
- /api/users/verify-code/           → Verify reset code
- /api/users/reset-password-with-code/ → Reset password using code

NOTE: These URLs are prefixed with 'api/users/' in the main urls.py file.

================================================================================
"""

from django.urls import path
from . import views

# =============================================================================
# URL PATTERNS
# Each tuple contains: (url_pattern, view_function, name)
# - url_pattern: The URL path (after /api/users/)
# - view_function: The function to handle requests to this URL
# - name: A unique name for this URL (used for reverse lookups)
# =============================================================================
urlpatterns = [
    # =========================================================================
    # AUTHENTICATION ENDPOINTS
    # =========================================================================
    
    # POST /api/users/register/ - Register new user account
    path('register/', views.register_view, name='register'),
    
    # POST /api/users/login/ - Login with username/password
    path('login/', views.login_view, name='login'),
    
    # POST /api/users/logout/ - Logout current user
    path('logout/', views.logout_view, name='logout'),
    
    # GET /api/users/me/ - Get current logged-in user's info
    path('me/', views.current_user_view, name='current-user'),
    
    # =========================================================================
    # PROFILE ENDPOINTS
    # =========================================================================
    
    # PUT /api/users/profile/update/ - Update own profile
    path('profile/update/', views.update_profile_view, name='update-profile'),
    
    # =========================================================================
    # USER MANAGEMENT ENDPOINTS (Warden Only)
    # =========================================================================
    
    # POST /api/users/create-user/ - Create a new user
    path('create-user/', views.create_user_view, name='create-user'),
    
    # GET /api/users/list/ - List all users
    path('list/', views.list_users_view, name='list-users'),
    
    # PUT /api/users/update-user/<id>/ - Update user by ID
    # <int:user_id> captures the ID from the URL as an integer
    path('update-user/<int:user_id>/', views.update_user_view, name='update-user'),
    
    # DELETE /api/users/delete-user/<id>/ - Delete user by ID
    path('delete-user/<int:user_id>/', views.delete_user_view, name='delete-user'),
    
    # =========================================================================
    # PASSWORD RESET ENDPOINTS
    # =========================================================================
    
    # POST /api/users/request-reset/ - Request password reset code
    path('request-reset/', views.request_password_reset_view, name='request-reset'),
    
    # POST /api/users/verify-code/ - Verify the reset code
    path('verify-code/', views.verify_reset_code_view, name='verify-code'),
    
    # POST /api/users/reset-password-with-code/ - Reset password using code
    path('reset-password-with-code/', views.reset_password_with_code_view, name='reset-password-with-code'),
]

