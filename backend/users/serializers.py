"""
================================================================================
USER SERIALIZERS - Data Conversion for User API
================================================================================

PURPOSE:
This file contains serializers for converting User model data to JSON and back.
Serializers are like translators between Python objects and JSON data.

WHAT IS A SERIALIZER?
A serializer does two main things:
1. SERIALIZE: Convert Python model objects → JSON (for API responses)
2. DESERIALIZE: Convert JSON data → Python objects (for saving to database)

Example:
Python Object: UserProfile(id=1, username='john', email='john@test.com')
     ↓ Serialize (for API response)
JSON: {"id": 1, "username": "john", "email": "john@test.com"}

WHY USE SERIALIZERS?
1. Control what fields are exposed in the API
2. Validate incoming data
3. Handle complex nested relationships
4. Hide sensitive data (like passwords)

================================================================================
"""

from rest_framework import serializers
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model.
    
    Converts UserProfile model instances to JSON and validates incoming data.
    
    Fields Included:
    - id: User's unique identifier
    - username: Login username
    - email: User's email address
    - first_name: User's first name
    - last_name: User's last name
    - role: User's role (Warden, Sub-Warden, etc.)
    - phone_number: Contact number
    - created_at: Account creation timestamp
    - updated_at: Last modification timestamp
    
    Fields Excluded:
    - password: Never exposed in API (write_only)
    - reset_code: Security-sensitive
    - reset_code_expires: Security-sensitive
    
    Read-Only Fields:
    - id, created_at, updated_at: These are auto-generated
    """
    
    class Meta:
        # Specify which model this serializer is for
        model = UserProfile
        
        # List of fields to include in the serialized output
        # Note: 'password' is not in this list - we don't expose it!
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'created_at', 'updated_at']
        
        # Read-only fields can't be set via API
        # They're either auto-generated or managed internally
        read_only_fields = ['id', 'created_at', 'updated_at']
        
        # Extra settings for specific fields
        # write_only: password can be sent in but never read back
        extra_kwargs = {'password': {'write_only': True}}

