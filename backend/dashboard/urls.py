"""
================================================================================
DASHBOARD URLS - URL Routing for Dashboard API Endpoints
================================================================================

PURPOSE:
This file defines URL patterns for dashboard-related API endpoints.
Currently, there's only one endpoint for the dashboard summary.

ENDPOINTS (prefix: /api/dashboard/):
- GET /api/dashboard/summary/ → Get dashboard statistics

STATISTICS PROVIDED:
- total_assets: Count of all inventory items
- damage_reports: Count of unfixed damage reports
- total_rooms: Count of all rooms
- total_users: Count of all registered users

================================================================================
"""

from django.urls import path
from . import views

# =============================================================================
# URL PATTERNS
# =============================================================================
urlpatterns = [
    # GET /api/dashboard/summary/ - Get dashboard summary statistics
    path('summary/', views.dashboard_summary_view, name='dashboard-summary'),
]

