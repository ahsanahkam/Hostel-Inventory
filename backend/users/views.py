"""
================================================================================
USER VIEWS - API Endpoints for User Operations
================================================================================

PURPOSE:
This file contains all the API endpoint functions (views) for user-related
operations in the Hostel Inventory System. Each function handles a specific
API endpoint and returns a JSON response.

WHAT IS A VIEW IN DJANGO?
A view is a function that takes a web request and returns a web response.
In Django REST Framework (DRF), views handle API requests and return JSON.

API ENDPOINTS DEFINED HERE:
1. POST /api/users/register/        - Register new user
2. POST /api/users/login/           - Login user
3. POST /api/users/logout/          - Logout user
4. GET  /api/users/me/              - Get current logged-in user
5. PUT  /api/users/profile/         - Update own profile
6. POST /api/users/create/          - Create user (Warden only)
7. GET  /api/users/                 - List all users (Warden only)
8. PUT  /api/users/<id>/            - Update user (Warden only)
9. DELETE /api/users/<id>/          - Delete user (Warden only)
10. POST /api/users/request-reset/  - Request password reset
11. POST /api/users/verify-code/    - Verify reset code
12. POST /api/users/reset-password/ - Reset password with code

AUTHENTICATION:
Uses session-based authentication. When user logs in, their user_id is stored
in the session. Subsequent requests check session for authentication.

PERMISSIONS:
- AllowAny: Used because we handle authentication manually via sessions
- Role checks: Warden-only operations check user.role == 'Warden'

================================================================================
"""

# =============================================================================
# IMPORTS
# =============================================================================

# Django REST Framework imports for building APIs
from rest_framework import status                    # HTTP status codes (200, 400, etc.)
from rest_framework.decorators import api_view, permission_classes  # Decorators for views
from rest_framework.response import Response         # JSON response helper
from rest_framework.permissions import AllowAny      # Allow unauthenticated access

# Django imports for email functionality
from django.core.mail import send_mail              # Send emails
from django.conf import settings                     # Access settings.py values

# Local imports
from .models import UserProfile                      # User model
from .serializers import UserProfileSerializer       # Converts model to JSON


# =============================================================================
# AUTHENTICATION VIEWS
# =============================================================================

@api_view(['POST'])  # Only accept POST requests
@permission_classes([AllowAny])  # Allow unauthenticated access (needed for registration)
def register_view(request):
    """
    Register a new user account.
    
    Endpoint: POST /api/users/register/
    
    Request Body:
    {
        "username": "john_doe",      (required)
        "password": "mypassword",    (required)
        "email": "john@example.com", (required)
        "first_name": "John",        (optional)
        "last_name": "Doe"           (optional)
    }
    
    Business Logic:
    - First user ever registered becomes Warden (admin)
    - All subsequent users get 'Pending' role (need approval)
    
    Returns:
    - Success: User data and success message
    - Error: Error message with appropriate status code
    """
    # Extract data from request body
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')  # Default to empty string
    last_name = request.data.get('last_name', '')
    
    # Validate required fields
    if not username or not password or not email:
        return Response({'error': 'Username, password and email are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Check if username already exists
    if UserProfile.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # =========================================================================
    # ROLE ASSIGNMENT LOGIC
    # First user = Warden (admin), subsequent users = Pending (need approval)
    # =========================================================================
    user_count = UserProfile.objects.count()
    role = 'Warden' if user_count == 0 else 'Pending'
    
    # Create the user
    user = UserProfile.objects.create(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role
    )
    
    # Hash and save the password (NEVER store plain text!)
    user.set_password(password)
    user.save()
    
    # Return success response with user data
    return Response({
        'user': UserProfileSerializer(user).data,
        'message': f'User registered successfully as {role}'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticate user and create session.
    
    Endpoint: POST /api/users/login/
    
    Request Body:
    {
        "username": "john_doe",
        "password": "mypassword"
    }
    
    Business Logic:
    - Verifies credentials
    - Users with 'Pending' role cannot login (need Warden approval first)
    - On success, stores user_id in session for authentication
    
    Security Note:
    - Returns generic "Username or password is wrong" for both wrong username
      and wrong password to prevent username enumeration attacks
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Validate required fields
    if not username or not password:
        return Response({'error': 'Username and password required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Try to find user by username
        user = UserProfile.objects.get(username=username)
        
        # Verify password
        if user.check_password(password):
            # Check if user is pending approval
            if user.role == 'Pending':
                return Response({'error': 'Your account is pending approval by the Warden. Please wait for role assignment.'}, 
                              status=status.HTTP_403_FORBIDDEN)
            
            # =========================================================
            # SESSION AUTHENTICATION
            # Store user_id in session - this is how we track login state
            # =========================================================
            request.session['user_id'] = user.id
            
            return Response({
                'user': UserProfileSerializer(user).data,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        else:
            # Wrong password - use generic error message for security
            return Response({'error': 'Username or password is wrong'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
    except UserProfile.DoesNotExist:
        # User not found - use same generic error for security
        return Response({'error': 'Username or password is wrong'}, 
                       status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Logout user by clearing their session.
    
    Endpoint: POST /api/users/logout/
    
    Session flush removes all data from the session, effectively logging
    the user out from all perspectives.
    """
    request.session.flush()  # Clear all session data
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def current_user_view(request):
    """
    Get the currently logged-in user's information.
    
    Endpoint: GET /api/users/me/
    
    Used by frontend to:
    - Check if user is logged in
    - Get user's role for permission checks
    - Display user info in profile/navigation
    """
    # Get user_id from session (set during login)
    user_id = request.session.get('user_id')
    
    if not user_id:
        return Response({'error': 'Not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        user = UserProfile.objects.get(id=user_id)
        return Response(UserProfileSerializer(user).data, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_profile_view(request):
    """
    Update the currently logged-in user's profile.
    
    Endpoint: PUT /api/users/profile/
    
    Request Body (all optional):
    {
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "1234567890"
    }
    
    Note: Users cannot change their own role, username, or email through
    this endpoint - only Warden can change those via update_user_view.
    """
    user_id = request.session.get('user_id')
    if not user_id:
        return Response({'error': 'Not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        user = UserProfile.objects.get(id=user_id)
        
        # Update only the fields that are provided
        # If field not in request, keep existing value
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.phone_number = request.data.get('phone_number', user.phone_number)
        user.save()
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'message': 'Profile updated successfully'
        }, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)


# =============================================================================
# USER MANAGEMENT VIEWS (Warden Only)
# =============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def create_user_view(request):
    """
    Create a new user account (Warden only).
    
    Endpoint: POST /api/users/create/
    
    Request Body:
    {
        "username": "new_user",
        "password": "password123",
        "email": "user@example.com",
        "role": "Inventory Staff",     (optional, defaults to 'Inventory Staff')
        "first_name": "New",           (optional)
        "last_name": "User"            (optional)
    }
    
    Permission: Only users with role 'Warden' can create other users.
    """
    # =========================================================================
    # AUTHENTICATION CHECK
    # Verify user is logged in
    # =========================================================================
    user_id = request.session.get('user_id')
    if not user_id:
        return Response({'error': 'Not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # =========================================================================
    # PERMISSION CHECK
    # Only Warden can create users
    # =========================================================================
    try:
        current_user = UserProfile.objects.get(id=user_id)
        if current_user.role != 'Warden':
            return Response({'error': 'Only Warden can create users'}, 
                          status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Extract data from request
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    role = request.data.get('role', 'Inventory Staff')  # Default role
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    # Validate required fields
    if not username or not password or not email:
        return Response({'error': 'Username, password and email are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Check for duplicate username
    if UserProfile.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Create the new user
    user = UserProfile.objects.create(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role
    )
    user.set_password(password)
    user.save()
    
    return Response({
        'user': UserProfileSerializer(user).data,
        'message': 'User created successfully'
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_users_view(request):
    """
    List all users in the system (Warden only).
    
    Endpoint: GET /api/users/
    
    Returns: Array of all user objects (serialized)
    
    Permission: Only users with role 'Warden' can view all users.
    """
    user_id = request.session.get('user_id')
    if not user_id:
        return Response({'error': 'Not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        current_user = UserProfile.objects.get(id=user_id)
        if current_user.role != 'Warden':
            return Response({'error': 'Only Warden can view all users'}, 
                          status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Get all users and serialize them
    users = UserProfile.objects.all()
    return Response(UserProfileSerializer(users, many=True).data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_user_view(request, user_id):
    """
    Update any user's information (Warden only).
    
    Endpoint: PUT /api/users/<user_id>/
    
    Request Body (all optional):
    {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone_number": "1234567890",
        "role": "Sub-Warden",
        "password": "newpassword"      (if changing password)
    }
    
    Permission: Only users with role 'Warden' can update other users.
    
    Args:
        user_id: The ID of the user to update (from URL)
    """
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return Response({'error': 'Not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if current user is Warden
    try:
        current_user = UserProfile.objects.get(id=current_user_id)
        if current_user.role != 'Warden':
            return Response({'error': 'Only Warden can update other users'}, 
                          status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Find the user to update
    try:
        target_user = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Target user not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Update only the fields that are provided in the request
    # Using 'in' check instead of get() to distinguish between
    # "field not provided" vs "field provided as empty"
    if 'first_name' in request.data:
        target_user.first_name = request.data['first_name']
    if 'last_name' in request.data:
        target_user.last_name = request.data['last_name']
    if 'email' in request.data:
        target_user.email = request.data['email']
    if 'phone_number' in request.data:
        target_user.phone_number = request.data['phone_number']
    if 'role' in request.data:
        target_user.role = request.data['role']
    if 'password' in request.data and request.data['password']:
        # Only update password if provided and not empty
        target_user.set_password(request.data['password'])
    
    target_user.save()
    return Response({
        'user': UserProfileSerializer(target_user).data,
        'message': 'User updated successfully'
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_user_view(request, user_id):
    """
    Delete a user account (Warden only).
    
    Endpoint: DELETE /api/users/<user_id>/
    
    Permission: Only users with role 'Warden' can delete users.
    
    Safety: Warden cannot delete their own account.
    
    Args:
        user_id: The ID of the user to delete (from URL)
    """
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return Response({'error': 'Not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if current user is Warden
    try:
        current_user = UserProfile.objects.get(id=current_user_id)
        if current_user.role != 'Warden':
            return Response({'error': 'Only Warden can delete users'}, 
                          status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Prevent self-deletion (Warden can't delete themselves)
    if int(user_id) == int(current_user_id):
        return Response({'error': 'Cannot delete your own account'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Delete the user
    try:
        target_user = UserProfile.objects.get(id=user_id)
        target_user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# =============================================================================
# PASSWORD RESET VIEWS
# Three-step password reset process:
# 1. Request reset code (sends email)
# 2. Verify the code
# 3. Reset password with the code
# =============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset_view(request):
    """
    Step 1: Request a password reset code.
    
    Endpoint: POST /api/users/request-reset/
    
    Request Body:
    {
        "email": "user@example.com"
    }
    
    Process:
    1. Finds user by email
    2. Generates 6-digit reset code
    3. Sends code to user's email
    4. Code expires in 15 minutes
    
    Security Note:
    Always returns success message even if email doesn't exist.
    This prevents attackers from discovering valid email addresses.
    """
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = UserProfile.objects.get(email=email)
        
        # Generate reset code (stored in user model)
        try:
            reset_code = user.generate_reset_code()
        except Exception as e:
            return Response({'error': f'Failed to generate code: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Send email with reset code
        try:
            send_mail(
                subject='Password Reset Code - Hostel Inventory',
                message=f'Your password reset code is: {reset_code}\n\nThis code will expire in 15 minutes.\n\nIf you did not request this reset, please ignore this email.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            return Response({'message': 'Reset code sent to your email'}, status=status.HTTP_200_OK)
        except Exception as e:
            # Email failed but code was generated - user can still use it
            return Response({'message': 'Reset code generated (check server logs)'}, status=status.HTTP_200_OK)
            
    except UserProfile.DoesNotExist:
        # Don't reveal if email exists or not (security)
        return Response({'message': 'If email exists, reset code has been sent'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_code_view(request):
    """
    Step 2: Verify the reset code is valid.
    
    Endpoint: POST /api/users/verify-code/
    
    Request Body:
    {
        "email": "user@example.com",
        "code": "123456"
    }
    
    This step is optional but provides better UX - user knows if code
    is valid before they try to set a new password.
    """
    email = request.data.get('email')
    code = request.data.get('code')
    
    if not email or not code:
        return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = UserProfile.objects.get(email=email)
        
        # Verify the code using model method
        if user.verify_reset_code(code):
            return Response({'message': 'Code verified successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_with_code_view(request):
    """
    Step 3: Reset password using the verified code.
    
    Endpoint: POST /api/users/reset-password/
    
    Request Body:
    {
        "email": "user@example.com",
        "code": "123456",
        "new_password": "newpassword123"
    }
    
    Process:
    1. Verify code is still valid
    2. Set new password (hashed)
    3. Clear the reset code (prevents reuse)
    """
    email = request.data.get('email')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    
    if not email or not code or not new_password:
        return Response({'error': 'Email, code and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password length
    if len(new_password) < 4:
        return Response({'error': 'Password must be at least 4 characters'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = UserProfile.objects.get(email=email)
        
        # Verify code one more time
        if user.verify_reset_code(code):
            # Set new password (hashed)
            user.set_password(new_password)
            # Clear the reset code so it can't be reused
            user.clear_reset_code()
            return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

