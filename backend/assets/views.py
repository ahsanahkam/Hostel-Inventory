"""
================================================================================
ASSET VIEWS - API Endpoints for Asset and Damage Report Operations
================================================================================

PURPOSE:
This file contains the API endpoint handlers (views) for managing:
1. Assets - Inventory items (beds, tables, chairs, etc.)
2. Damage Reports - Reports of damaged assets in rooms

WHAT IS A VIEWSET?
A ViewSet is a class-based view that combines multiple related views.
Instead of creating separate functions for list, create, update, delete,
a ModelViewSet provides all of these automatically!

ModelViewSet automatically provides:
- list()   - GET /api/assets/       → Get all assets
- create() - POST /api/assets/      → Create new asset
- retrieve() - GET /api/assets/1/   → Get asset with id=1
- update() - PUT /api/assets/1/     → Update asset with id=1
- destroy() - DELETE /api/assets/1/ → Delete asset with id=1

WHY USE VIEWSET INSTEAD OF FUNCTION VIEWS?
1. Less code - one class handles all CRUD operations
2. Consistent API structure
3. Automatic URL routing with DRF routers
4. Easy to add custom actions if needed

URL ENDPOINTS (configured in urls.py with router):
Assets:
- GET    /api/assets/          - List all assets
- POST   /api/assets/          - Create new asset
- GET    /api/assets/<id>/     - Get single asset
- PUT    /api/assets/<id>/     - Update asset
- DELETE /api/assets/<id>/     - Delete asset

Damage Reports:
- GET    /api/damage-reports/          - List all damage reports
- POST   /api/damage-reports/          - Create new damage report
- GET    /api/damage-reports/<id>/     - Get single report
- PUT    /api/damage-reports/<id>/     - Update report (e.g., change status)
- DELETE /api/damage-reports/<id>/     - Delete report

================================================================================
"""

# =============================================================================
# IMPORTS
# =============================================================================

# Django REST Framework imports
from rest_framework import viewsets, status     # ViewSet class and HTTP status codes
from rest_framework.response import Response    # JSON response helper
from rest_framework.permissions import AllowAny # Allow unauthenticated access

# Local imports - our models and serializers
from .models import Asset, DamageReport                     # Database models
from .serializers import AssetSerializer, DamageReportSerializer  # JSON converters


# =============================================================================
# ASSET VIEWSET
# =============================================================================

class AssetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Asset CRUD operations.
    
    A ViewSet automatically provides:
    - list():     GET /api/assets/        - Get all assets
    - create():   POST /api/assets/       - Create new asset
    - retrieve(): GET /api/assets/{id}/   - Get single asset by ID
    - update():   PUT /api/assets/{id}/   - Update an asset
    - destroy():  DELETE /api/assets/{id}/ - Delete an asset
    
    Attributes:
        queryset: The base query for retrieving assets (all assets)
        serializer_class: The serializer used to convert Asset ↔ JSON
        permission_classes: Who can access (AllowAny = everyone)
    
    How It Works:
    1. Request comes in (e.g., POST to create asset)
    2. ViewSet determines which action (create, list, etc.)
    3. Serializer validates and converts data
    4. Model is created/updated/deleted in database
    5. Serializer converts result to JSON response
    """
    
    # Define the base queryset - which assets to work with
    # Asset.objects.all() means "all assets in the database"
    queryset = Asset.objects.all()
    
    # Specify which serializer class to use for converting Asset ↔ JSON
    serializer_class = AssetSerializer
    
    # Set permissions - AllowAny means no authentication required
    # In a production app, you might want stricter permissions
    permission_classes = [AllowAny]


# =============================================================================
# DAMAGE REPORT VIEWSET
# =============================================================================

class DamageReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Damage Report CRUD operations.
    
    A ViewSet automatically provides:
    - list():     GET /api/damage-reports/        - Get all reports
    - create():   POST /api/damage-reports/       - Create new report
    - retrieve(): GET /api/damage-reports/{id}/   - Get single report
    - update():   PUT /api/damage-reports/{id}/   - Update report status
    - destroy():  DELETE /api/damage-reports/{id}/ - Delete report
    
    Attributes:
        queryset: The base query for retrieving reports (all reports)
        serializer_class: The serializer for DamageReport ↔ JSON
        permission_classes: Who can access (AllowAny = everyone)
    
    Common Operations:
    - Create: Report new damage in a room
    - Update: Change status from "Not Fixed" to "Fixed"
    - List: View all damage reports for tracking
    - Delete: Remove resolved/old reports
    """
    
    # Define the base queryset - all damage reports
    queryset = DamageReport.objects.all()
    
    # Specify the serializer class
    serializer_class = DamageReportSerializer
    
    # Set permissions
    permission_classes = [AllowAny]

