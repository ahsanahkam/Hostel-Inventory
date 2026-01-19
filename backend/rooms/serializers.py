"""
================================================================================
ROOM SERIALIZERS - Data Conversion for Room API
================================================================================

PURPOSE:
This file contains the serializer for converting Room model data to JSON 
and back. The serializer handles translation between Python objects and 
JSON data used in API requests/responses.

WHAT IS A SERIALIZER?
A serializer does two main things:
1. SERIALIZE: Convert Python model objects → JSON (for API responses)
2. DESERIALIZE: Convert JSON data → Python objects (for saving to database)

SPECIAL FEATURE - SerializerMethodField:
This serializer demonstrates how to add computed fields that don't exist
in the model. The 'asset_count' field counts related assets dynamically.

================================================================================
"""

from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    """
    Serializer for the Room model.
    
    Converts Room model instances to JSON and validates incoming data.
    
    Fields Included:
    - id: Room's unique identifier
    - room_number: Room number (e.g., "101", "A-201")
    - hostel_name: Name of the hostel building
    - floor: Floor number (optional)
    - capacity: Maximum occupancy
    - asset_count: Number of assets in this room (computed)
    - created_at: When room was created
    - updated_at: When room was last modified
    
    Computed Fields:
    - asset_count: Uses SerializerMethodField to count related assets
    """
    
    # ==========================================================================
    # CUSTOM COMPUTED FIELD: asset_count
    # 
    # SerializerMethodField is a special field type that:
    # 1. Is read-only (can't be set via API)
    # 2. Gets its value from a method you define
    # 3. The method must be named 'get_<fieldname>'
    # 
    # This is useful for:
    # - Computed values (like counts, sums)
    # - Values that require custom logic
    # - Data from related models
    # ==========================================================================
    asset_count = serializers.SerializerMethodField()
    
    class Meta:
        # Specify which model this serializer is for
        model = Room
        
        # List of fields to include in the serialized output
        fields = [
            'id', 'room_number', 'hostel_name', 'floor', 
            'capacity', 'asset_count', 'created_at', 'updated_at'
        ]
        
        # These fields are auto-generated and can't be set via API
        read_only_fields = ['created_at', 'updated_at']
    
    def get_asset_count(self, obj):
        """
        Get the count of assets in this room.
        
        This method is automatically called for the 'asset_count' field.
        DRF looks for a method named 'get_<fieldname>'.
        
        Args:
            obj: The Room instance being serialized
        
        Returns:
            int: Number of assets linked to this room
        
        How It Works:
        - obj is the Room instance
        - obj.assets is the related manager (defined by related_name='assets' in Asset model)
        - .count() returns the number of related Asset objects
        
        SQL equivalent: SELECT COUNT(*) FROM assets_asset WHERE room_id = obj.id
        """
        return obj.assets.count()

