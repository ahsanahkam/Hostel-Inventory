"""
================================================================================
ASSET MODELS - Asset and Damage Report Data Definitions
================================================================================

PURPOSE:
This file defines the data structures (models) for:
1. Asset - Inventory items like beds, tables, chairs, etc.
2. DamageReport - Reports of damaged assets in rooms

WHAT IS A MODEL?
A model in Django represents a database table. Each class becomes a table,
and each attribute becomes a column in that table.

DATABASE TABLES CREATED:
- 'assets_asset': Stores all inventory items
- 'assets_damagereport': Stores damage reports

RELATIONSHIPS:
- Asset can optionally belong to a Room (ForeignKey)
- DamageReport must belong to a Room (ForeignKey, required)

================================================================================
"""

from django.db import models


class Asset(models.Model):
    """
    Model representing an inventory asset in the hostel.
    
    An asset is any physical item that the hostel owns and tracks,
    such as beds, tables, chairs, fans, lights, etc.
    
    Attributes:
        name: Descriptive name of the asset
        asset_type: Category of asset (Bed, Table, etc.)
        total_quantity: How many of this asset exist
        condition: Current condition (Good or Damaged)
        room: Optional - which room the asset is in
        created_at: When the asset record was created
        updated_at: When the asset record was last modified
    """
    
    # =========================================================================
    # ASSET TYPE CHOICES
    # Predefined categories for assets
    # Format: (database_value, display_value)
    # =========================================================================
    ASSET_TYPE_CHOICES = [
        ('Bed', 'Bed'),
        ('Table', 'Table'),
        ('Chair', 'Chair'),
        ('Cupboard', 'Cupboard'),
        ('Fan', 'Fan'),
        ('Light', 'Light'),
        ('Other', 'Other'),  # For items not in the list above
    ]
    
    # =========================================================================
    # CONDITION CHOICES
    # Tracks whether asset is in good or damaged condition
    # =========================================================================
    CONDITION_CHOICES = [
        ('Good', 'Good'),      # Asset is functioning properly
        ('Damaged', 'Damaged'), # Asset needs repair/replacement
    ]
    
    # =========================================================================
    # ASSET FIELDS
    # =========================================================================
    
    # Descriptive name of the asset (e.g., "Single Bed", "Study Table")
    name = models.CharField(max_length=200)
    
    # Type/category of the asset - uses choices defined above
    asset_type = models.CharField(max_length=50, choices=ASSET_TYPE_CHOICES)
    
    # How many of this asset exist (default: 1)
    total_quantity = models.IntegerField(default=1)
    
    # Current condition of the asset (default: Good)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='Good')
    
    # =========================================================================
    # ROOM RELATIONSHIP (Optional)
    # ForeignKey creates a many-to-one relationship with Room
    # =========================================================================
    room = models.ForeignKey(
        'rooms.Room',           # References the Room model in rooms app
        on_delete=models.SET_NULL,  # If room is deleted, set this to NULL
        null=True,              # Allow NULL in database (no room assigned)
        blank=True,             # Allow empty in forms
        related_name='assets'   # Access assets from room: room.assets.all()
    )
    
    # =========================================================================
    # TIMESTAMP FIELDS
    # Automatically managed by Django
    # =========================================================================
    
    # When the asset was added to inventory (auto-set on creation)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # When the asset record was last updated (auto-set on save)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        """
        String representation of the asset.
        
        Used in Django admin and debugging.
        Example: "Single Bed (Bed) - Good"
        
        Returns:
            str: Name, type, and condition of asset
        """
        return f"{self.name} ({self.asset_type}) - {self.condition}"
    
    class Meta:
        """
        Meta options for the Asset model.
        
        verbose_name: Singular name in admin
        verbose_name_plural: Plural name in admin
        ordering: Default sort order (newest first by created_at)
        """
        verbose_name = "Asset"
        verbose_name_plural = "Assets"
        ordering = ['-created_at']  # Minus sign = descending (newest first)


class DamageReport(models.Model):
    """
    Model representing a report of damaged asset in a room.
    
    When staff discovers damage to an asset in a room, they create
    a damage report. The report tracks:
    - Which room
    - What type of asset
    - Description of damage
    - Status (Not Fixed, Fixed, Replaced)
    
    This helps management track and resolve damage issues.
    
    Attributes:
        room: The room where damage was found (required)
        asset_type: Type of asset that's damaged
        description: Detailed description of the damage
        status: Current status of the repair
        reported_at: When the damage was reported
        updated_at: When the report was last modified
    """
    
    # =========================================================================
    # ASSET TYPE CHOICES
    # Same as Asset model - which type of asset is damaged
    # =========================================================================
    ASSET_TYPE_CHOICES = [
        ('Bed', 'Bed'),
        ('Table', 'Table'),
        ('Chair', 'Chair'),
        ('Cupboard', 'Cupboard'),
        ('Fan', 'Fan'),
        ('Light', 'Light'),
        ('Other', 'Other'),
    ]
    
    # =========================================================================
    # STATUS CHOICES
    # Tracks the repair/resolution status
    # =========================================================================
    STATUS_CHOICES = [
        ('Not Fixed', 'Not Fixed'),  # Damage reported but not addressed
        ('Fixed', 'Fixed'),           # Damage has been repaired
        ('Replaced', 'Replaced'),     # Asset was replaced
    ]
    
    # =========================================================================
    # DAMAGE REPORT FIELDS
    # =========================================================================
    
    # Room where damage was found (required - CASCADE deletes report if room deleted)
    room = models.ForeignKey(
        'rooms.Room',
        on_delete=models.CASCADE,       # If room deleted, delete this report too
        related_name='damage_reports'   # Access from room: room.damage_reports.all()
    )
    
    # Type of asset that's damaged
    asset_type = models.CharField(max_length=50, choices=ASSET_TYPE_CHOICES)
    
    # Detailed description of what's damaged and how
    # TextField allows unlimited length (unlike CharField)
    description = models.TextField()
    
    # Current repair status (default: Not Fixed)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Not Fixed')
    
    # =========================================================================
    # TIMESTAMP FIELDS
    # =========================================================================
    
    # When the damage was reported (auto-set on creation)
    reported_at = models.DateTimeField(auto_now_add=True)
    
    # When the report was last updated (auto-set on save)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        """
        String representation of the damage report.
        
        Used in Django admin and debugging.
        Example: "Bed damage in Room 101 - Not Fixed"
        
        Returns:
            str: Asset type, room number, and status
        """
        return f"{self.asset_type} damage in Room {self.room.room_number} - {self.status}"
    
    class Meta:
        """
        Meta options for the DamageReport model.
        
        verbose_name: Singular name in admin
        verbose_name_plural: Plural name in admin
        ordering: Default sort order (newest first by reported_at)
        """
        verbose_name = "Damage Report"
        verbose_name_plural = "Damage Reports"
        ordering = ['-reported_at']  # Newest reports first

