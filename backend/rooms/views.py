"""
================================================================================
ROOM VIEWS - API Endpoints for Room Operations
================================================================================

PURPOSE:
This file contains the API endpoint handler (view) for managing rooms.
Rooms represent physical spaces in the hostel where students live.

WHAT IS A VIEWSET?
A ViewSet is a class-based view that combines multiple related views.
ModelViewSet automatically provides all CRUD operations:
- list()   - GET /api/rooms/       → Get all rooms
- create() - POST /api/rooms/      → Create new room
- retrieve() - GET /api/rooms/1/   → Get room with id=1
- update() - PUT /api/rooms/1/     → Update room with id=1
- destroy() - DELETE /api/rooms/1/ → Delete room with id=1

URL ENDPOINTS (configured in urls.py with router):
- GET    /api/rooms/          - List all rooms
- POST   /api/rooms/          - Create new room
- GET    /api/rooms/<id>/     - Get single room
- PUT    /api/rooms/<id>/     - Update room
- DELETE /api/rooms/<id>/     - Delete room

RELATED DATA:
Rooms are related to:
- Assets: A room can have many assets (beds, tables, etc.)
- DamageReports: A room can have damage reports filed against it

================================================================================
"""

# =============================================================================
# IMPORTS
# =============================================================================

# Django REST Framework imports
from rest_framework import viewsets, status     # ViewSet class and HTTP status codes
from rest_framework.decorators import action    # Decorator for custom actions (not currently used)
from rest_framework.response import Response    # JSON response helper
from rest_framework.permissions import AllowAny # Allow unauthenticated access

# Local imports
from .models import Room                        # Room model
from .serializers import RoomSerializer         # Room serializer


# =============================================================================
# ROOM VIEWSET
# =============================================================================

class RoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Room CRUD operations.
    
    A ViewSet automatically provides:
    - list():     GET /api/rooms/        - Get all rooms
    - create():   POST /api/rooms/       - Create new room
    - retrieve(): GET /api/rooms/{id}/   - Get single room by ID
    - update():   PUT /api/rooms/{id}/   - Update a room
    - destroy():  DELETE /api/rooms/{id}/ - Delete a room
    
    Attributes:
        queryset: The base query for retrieving rooms (all rooms)
        serializer_class: The serializer used to convert Room ↔ JSON
        permission_classes: Who can access (AllowAny = everyone)
    
    Room Data Structure:
    {
        "id": 1,
        "room_number": "101",
        "hostel_name": "Main Hostel",
        "floor": 1,
        "capacity": 2,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
    }
    
    Usage Notes:
    - room_number must be unique
    - Deleting a room will CASCADE delete its damage reports
    - Assets linked to room will have room set to NULL (not deleted)
    """
    
    # Define the base queryset - all rooms
    # The ordering is defined in Room model's Meta class
    queryset = Room.objects.all()
    
    # Specify the serializer class for Room ↔ JSON conversion
    serializer_class = RoomSerializer
    
    # Set permissions - AllowAny means no authentication required
    permission_classes = [AllowAny]

