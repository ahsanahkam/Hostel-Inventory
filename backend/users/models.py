"""
================================================================================
USER PROFILE MODEL - User Data Definition
================================================================================

PURPOSE:
This file defines the data structure (model) for users in our hostel inventory
system. In Django, a model represents a database table. Each model class
becomes a table, and each attribute becomes a column.

WHAT IS A MODEL?
A model is like a blueprint for data. It defines:
- What information we store (fields/columns)
- What type of data each field holds (text, number, date, etc.)
- Rules and constraints (required, unique, max length, etc.)
- Relationships with other models (ForeignKey, etc.)

DATABASE TABLE:
This model creates a table called 'users_userprofile' with columns for
username, password, email, role, phone_number, reset_code, etc.

WHY NOT USE DJANGO'S BUILT-IN USER MODEL?
We created a custom UserProfile model to:
1. Have more control over user fields
2. Add custom fields like 'role' and 'phone_number'
3. Implement custom password reset with email codes

ROLE SYSTEM:
- Pending: New users waiting for approval
- Warden: Full access (admin-like)
- Sub-Warden: Limited management access
- Inventory Staff: Basic inventory access

================================================================================
"""

from django.db import models

# Password hashing utilities for security
# make_password: converts plain text to hashed password
# check_password: verifies plain text against hashed password
from django.contrib.auth.hashers import make_password, check_password

# Timezone utilities for handling dates and times
from django.utils import timezone
from datetime import timedelta

# For generating random reset codes
import random
import string


class UserProfile(models.Model):
    """
    Custom user model for the Hostel Inventory System.
    
    This model stores user account information including authentication
    credentials, personal details, and role-based permissions.
    
    Attributes:
        username: Unique identifier for login
        password: Hashed password (never store plain text!)
        email: User's email address
        first_name: User's first name
        last_name: User's last name
        role: User's role determining permissions
        phone_number: Optional contact number
        reset_code: 6-digit code for password reset
        reset_code_expires: When the reset code expires
        created_at: Account creation timestamp
        updated_at: Last modification timestamp
    """
    
    # =========================================================================
    # ROLE CHOICES
    # Defines the available roles in the system
    # Format: (database_value, display_value)
    # =========================================================================
    ROLE_CHOICES = [
        ('Pending', 'Pending'),           # Awaiting approval
        ('Warden', 'Warden'),              # Full access (admin)
        ('Sub-Warden', 'Sub-Warden'),      # Limited management
        ('Inventory Staff', 'Inventory Staff'),  # Basic access
    ]
    
    # =========================================================================
    # AUTHENTICATION FIELDS
    # =========================================================================
    
    # Unique username for login - must be unique across all users
    username = models.CharField(max_length=150, unique=True)
    
    # Password stored as hash - NEVER store plain text passwords!
    # The set_password() method handles hashing
    password = models.CharField(max_length=128)
    
    # User's email address (used for password reset)
    email = models.EmailField()
    
    # =========================================================================
    # PERSONAL INFORMATION FIELDS
    # =========================================================================
    
    # User's first name (optional - blank=True allows empty string)
    first_name = models.CharField(max_length=150, blank=True)
    
    # User's last name (optional)
    last_name = models.CharField(max_length=150, blank=True)
    
    # User's role - determines what they can access
    # Default is 'Pending' - new users need approval
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Pending')
    
    # Phone number (optional - null=True allows NULL in database)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # =========================================================================
    # PASSWORD RESET FIELDS
    # Used for "Forgot Password" functionality
    # =========================================================================
    
    # 6-digit reset code sent to user's email
    reset_code = models.CharField(max_length=6, blank=True, null=True)
    
    # When the reset code expires (15 minutes after generation)
    reset_code_expires = models.DateTimeField(blank=True, null=True)
    
    # =========================================================================
    # TIMESTAMP FIELDS
    # Automatically managed by Django
    # =========================================================================
    
    # When the user account was created (auto-set on creation)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # When the user account was last updated (auto-set on save)
    updated_at = models.DateTimeField(auto_now=True)
    
    # =========================================================================
    # PASSWORD METHODS
    # =========================================================================
    
    def set_password(self, raw_password):
        """
        Hash and store a password securely.
        
        NEVER store plain text passwords! This method uses Django's
        make_password() to create a secure hash.
        
        Args:
            raw_password (str): The plain text password from user
        """
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        """
        Verify if a password matches the stored hash.
        
        Used during login to verify credentials without exposing
        the actual password.
        
        Args:
            raw_password (str): The plain text password to verify
            
        Returns:
            bool: True if password matches, False otherwise
        """
        return check_password(raw_password, self.password)
    
    # =========================================================================
    # PASSWORD RESET METHODS
    # =========================================================================
    
    def generate_reset_code(self):
        """
        Generate a 6-digit reset code for password reset.
        
        The code expires after 15 minutes for security.
        Code is sent to user's email by the view.
        
        Returns:
            str: The generated 6-digit code
        """
        # Generate random 6-digit code (e.g., "847291")
        self.reset_code = ''.join(random.choices(string.digits, k=6))
        
        # Set expiration to 15 minutes from now
        self.reset_code_expires = timezone.now() + timedelta(minutes=15)
        
        # Save to database
        self.save()
        
        return self.reset_code
    
    def verify_reset_code(self, code):
        """
        Verify if a reset code is valid.
        
        Checks:
        1. Code exists
        2. Code matches
        3. Code hasn't expired
        
        Args:
            code (str): The code to verify
            
        Returns:
            bool: True if code is valid, False otherwise
        """
        # Check if reset code exists
        if not self.reset_code or not self.reset_code_expires:
            return False
        
        # Check if code matches
        if self.reset_code != code:
            return False
        
        # Check if code has expired
        if timezone.now() > self.reset_code_expires:
            return False
        
        return True
    
    def clear_reset_code(self):
        """
        Clear the reset code after successful password reset.
        
        Important for security - prevents code reuse.
        """
        self.reset_code = None
        self.reset_code_expires = None
        self.save()
    
    # =========================================================================
    # DJANGO SPECIAL METHODS
    # =========================================================================
    
    def __str__(self):
        """
        String representation of the user.
        
        Used in Django admin and debugging.
        Example: "john_doe (Warden)"
        
        Returns:
            str: Username and role
        """
        return f"{self.username} ({self.role})"
    
    class Meta:
        """
        Meta options for the model.
        
        verbose_name: Singular name shown in admin
        verbose_name_plural: Plural name shown in admin
        """
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

