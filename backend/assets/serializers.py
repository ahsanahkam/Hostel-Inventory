"""
================================================================================
ASSET SERIALIZERS - Data Conversion for Asset API
================================================================================

PURPOSE:
This file contains serializers for converting Asset and DamageReport model 
data to JSON and back. Serializers handle the translation between Python 
objects and JSON data used in API requests/responses.

WHAT IS A SERIALIZER?
A serializer does two main things:
1. SERIALIZE: Convert Python model objects → JSON (for API responses)
2. DESERIALIZE: Convert JSON data → Python objects (for saving to database)

WHY SERIALIZERS ARE IMPORTANT:
1. Control which fields are exposed via API
2. Add computed/derived fields (like room_number from related Room)
3. Validate incoming data before saving
4. Handle relationships between models

================================================================================
"""

from rest_framework import serializers
from .models import Asset, DamageReport


class AssetSerializer(serializers.ModelSerializer):
    """
    Serializer for the Asset model.
    
    Converts Asset model instances to JSON and validates incoming data.
    
    Fields Included:
    - id: Asset's unique identifier
    - name: Descriptive name of the asset
    - asset_type: Type category (Bed, Table, Chair, etc.)
    - total_quantity: How many of this asset
    - condition: Current condition (Good/Damaged)
    - room: Room ID (foreign key - for writing)
    - room_display: Room number string (for reading/display)
    - created_at: When asset was created
    - updated_at: When asset was last modified
    
    Special Fields:
    - room_display: A "source" field that pulls room_number from the 
                    related Room object for display purposes
    """
    
    # ==========================================================================
    # CUSTOM FIELD: room_display
    # This is a read-only field that gets the room_number from the related Room
    # 
    # WHY DO WE NEED THIS?
    # - The 'room' field contains the Room ID (number)
    # - But in the UI, we want to display the room number (string)
    # - This gives us both: ID for saving, number for display
    # 
    # 'source' tells DRF where to get the value from:
    # source='room.room_number' means: this_asset.room.room_number
    # ==========================================================================
    room_display = serializers.CharField(source='room.room_number', read_only=True)
    
    class Meta:
        # Specify which model this serializer is for
        model = Asset
        
        # List of fields to include in the serialized output
        fields = [
            'id', 'name', 'asset_type', 'total_quantity', 
            'condition', 'room', 'room_display',
            'created_at', 'updated_at'
        ]
        
        # These fields are auto-generated and can't be set via API
        read_only_fields = ['created_at', 'updated_at']
    

class DamageReportSerializer(serializers.ModelSerializer):
    """
    Serializer for the DamageReport model.
    
    Converts DamageReport model instances to JSON and validates incoming data.
    
    Fields Included:
    - id: Report's unique identifier
    - room: Room ID (foreign key - for writing)
    - room_number: Room number string (for reading/display)
    - asset_type: Type of damaged asset
    - description: Description of the damage
    - status: Current status (Not Fixed, Fixed, Replaced)
    - reported_at: When damage was reported
    - updated_at: When report was last modified
    
    Special Fields:
    - room_number: Gets the room_number from the related Room object
    """
    
    # ==========================================================================
    # CUSTOM FIELD: room_number
    # Gets the room number from the related Room model for display
    # 
    # When sending data TO the API: use 'room' with the Room ID
    # When reading data FROM the API: use 'room_number' for display
    # ==========================================================================
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    
    class Meta:
        # Specify which model this serializer is for
        model = DamageReport
        
        # List of fields to include
        fields = [
            'id', 'room', 'room_number', 'asset_type', 
            'description', 'status', 'reported_at', 'updated_at'
        ]
        
        # These fields are auto-generated
        read_only_fields = ['reported_at', 'updated_at']

