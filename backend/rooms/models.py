"""
================================================================================
ROOM MODEL - Room Data Definition
================================================================================

PURPOSE:
This file defines the data structure (model) for rooms in the hostel.
Rooms are physical spaces in the hostel where students live and where
assets (beds, tables, etc.) are located.

DATABASE TABLE:
This model creates a table called 'rooms_room' with columns for
room_number, hostel_name, floor, capacity, and timestamps.

RELATIONSHIPS:
- A room can have many Assets (one-to-many)
- A room can have many DamageReports (one-to-many)
- These relationships are defined in the Asset and DamageReport models
  using ForeignKey fields pointing to this Room model

================================================================================
"""

from django.db import models


class Room(models.Model):
    """
    Model representing a room in the hostel.
    
    A room is a physical space in the hostel where students stay.
    Each room has a unique room number, belongs to a hostel building,
    is on a specific floor, and has a capacity (number of students).
    
    Attributes:
        room_number: Unique identifier for the room (e.g., "101", "A-201")
        hostel_name: Name of the hostel building
        floor: Floor number where room is located (optional)
        capacity: Maximum number of students who can stay
        created_at: When the room record was created
        updated_at: When the room record was last modified
    """
    
    # =========================================================================
    # ROOM FIELDS
    # =========================================================================
    
    # Room number - must be unique across all rooms
    # Examples: "101", "A-201", "Block-B-305"
    room_number = models.CharField(max_length=20, unique=True)
    
    # Name of the hostel building where this room is located
    # Examples: "Main Hostel", "Block A", "Women's Hostel"
    hostel_name = models.CharField(max_length=100)
    
    # Floor number (optional - some hostels might not track this)
    # null=True: Allows NULL in database
    # blank=True: Allows empty in forms
    floor = models.IntegerField(null=True, blank=True)
    
    # Maximum number of students who can stay in this room
    # Default is 2 (double occupancy rooms)
    capacity = models.IntegerField(default=2)
    
    # =========================================================================
    # TIMESTAMP FIELDS
    # Automatically managed by Django
    # =========================================================================
    
    # When the room was added to the system (auto-set on creation)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # When the room record was last updated (auto-set on save)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        """
        String representation of the room.
        
        Used in Django admin, debugging, and when displaying room
        in dropdown lists (like in DamageReport form).
        
        Example: "Room 101 - Main Hostel"
        
        Returns:
            str: Room number and hostel name
        """
        return f"Room {self.room_number} - {self.hostel_name}"
    
    class Meta:
        """
        Meta options for the Room model.
        
        verbose_name: Singular name shown in admin
        verbose_name_plural: Plural name shown in admin
        ordering: Default sort order - first by hostel name, then room number
                  This makes rooms appear grouped by hostel in lists
        """
        verbose_name = "Room"
        verbose_name_plural = "Rooms"
        ordering = ['hostel_name', 'room_number']  # Group by hostel, then sort by room

