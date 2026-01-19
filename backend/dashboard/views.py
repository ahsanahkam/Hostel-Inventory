"""
================================================================================
DASHBOARD VIEWS - API Endpoints for Dashboard Statistics
================================================================================

PURPOSE:
This file contains the API endpoint for the dashboard summary view.
The dashboard provides a quick overview of the system's key statistics.

WHAT THIS ENDPOINT PROVIDES:
- Total Assets: Count of all inventory items
- Damage Reports: Count of unfixed damage reports only
- Total Rooms: Count of all rooms in the system
- Total Users: Count of all registered users

API ENDPOINT:
GET /api/dashboard/summary/ → Returns summary statistics

USAGE:
The frontend Dashboard page calls this endpoint to display the 
summary cards showing counts of assets, rooms, damage reports, etc.

NOTE ON DAMAGE REPORTS COUNT:
Only counts reports with status 'Not Fixed' because that's what 
management cares about - issues that need attention. Fixed issues
are not shown on the dashboard.

================================================================================
"""

# =============================================================================
# IMPORTS
# =============================================================================

# Django REST Framework imports
from rest_framework.decorators import api_view, permission_classes  # Function decorators
from rest_framework.response import Response     # JSON response helper
from rest_framework.permissions import AllowAny  # Allow unauthenticated access

# Import models from other apps to get counts
from assets.models import Asset, DamageReport    # Asset and DamageReport models
from rooms.models import Room                     # Room model
from users.models import UserProfile             # User model


# =============================================================================
# DASHBOARD SUMMARY VIEW
# =============================================================================

@api_view(['GET'])  # Only accept GET requests (retrieving data, not modifying)
@permission_classes([AllowAny])  # Allow unauthenticated access
def dashboard_summary_view(request):
    """
    Get summary statistics for the dashboard.
    
    Endpoint: GET /api/dashboard/summary/
    
    Returns:
    {
        "total_assets": 150,      - Count of all assets in inventory
        "damage_reports": 5,       - Count of UNFIXED damage reports only
        "total_rooms": 50,        - Count of all rooms
        "total_users": 10         - Count of all registered users
    }
    
    Note: damage_reports only counts 'Not Fixed' status because:
    - We want to show issues that need attention
    - Fixed issues don't need to be highlighted on dashboard
    - This gives management a quick view of pending problems
    
    Frontend Note:
    - 'total_users' is only shown to Warden role (hidden for other roles)
    - This is controlled in the frontend Dashboard component
    """
    
    # Count all assets in the system
    # Asset.objects.count() is SQL: SELECT COUNT(*) FROM assets_asset
    total_assets = Asset.objects.count()
    
    # Count only damage reports that are "Not Fixed"
    # .filter() adds a WHERE clause: WHERE status = 'Not Fixed'
    damage_reports = DamageReport.objects.filter(status='Not Fixed').count()
    
    # Count all rooms in the system
    total_rooms = Room.objects.count()
    
    # Count all registered users
    total_users = UserProfile.objects.count()
    
    # Return JSON response with all statistics
    return Response({
        'total_assets': total_assets,
        'damage_reports': damage_reports,
        'total_rooms': total_rooms,
        'total_users': total_users
    })

