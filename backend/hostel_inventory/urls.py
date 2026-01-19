"""
================================================================================
MAIN URL CONFIGURATION - Central URL Routing
================================================================================

PURPOSE:
This is the main URL configuration file for the Hostel Inventory project.
It routes incoming requests to the appropriate app based on the URL prefix.

HOW IT WORKS:
When a request comes in, Django looks at the URL and:
1. Checks which prefix matches (api/users/, api/assets/, etc.)
2. Strips the prefix and forwards to that app's urls.py
3. The app's urls.py handles the rest of the routing

URL STRUCTURE:
/api/users/...     → users/urls.py handles authentication, user management
/api/assets/...    → assets/urls.py handles assets and damage reports
/api/rooms/...     → rooms/urls.py handles room management
/api/dashboard/... → dashboard/urls.py handles dashboard statistics

EXAMPLE FLOW:
Request: POST /api/users/login/
1. Django matches 'api/users/' prefix
2. Strips prefix, remaining path: 'login/'
3. Forwards to users/urls.py
4. users/urls.py matches 'login/' to login_view
5. login_view handles the request

================================================================================
"""

from django.urls import path, include

# =============================================================================
# URL PATTERNS
# Each pattern includes URLs from a specific app
# =============================================================================
urlpatterns = [
    # User authentication and management endpoints
    # Handles: login, logout, register, profile, user CRUD
    path('api/users/', include('users.urls')),
    
    # Asset and damage report endpoints
    # Handles: CRUD for assets and damage reports
    path('api/assets/', include('assets.urls')),
    
    # Room management endpoints
    # Handles: CRUD for rooms
    path('api/rooms/', include('rooms.urls')),
    
    # Dashboard statistics endpoint
    # Handles: Summary data for dashboard
    path('api/dashboard/', include('dashboard.urls')),
]

