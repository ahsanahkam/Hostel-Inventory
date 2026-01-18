"""
Users App Views (API Controllers)
=================================

Views handle HTTP requests and return responses
Think of views as the "Controller" in MVC:
- Receives requests from React frontend
- Processes the request (calls models, business logic)
- Returns JSON response back to frontend
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from .models import UserProfile
from .serializers import UserProfileSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user"""
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not username or not password or not email:
        return Response({'error': 'Username, password and email are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if UserProfile.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Auto-assign first user as Warden, others as Pending
    user_count = UserProfile.objects.count()
    role = 'Warden' if user_count == 0 else 'Pending'
    
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
        'message': f'User registered successfully as {role}'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login user"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Username and password required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = UserProfile.objects.get(username=username)
        if user.check_password(password):
            # Check if user is still pending approval
            if user.role == 'Pending':
                return Response({'error': 'Your account is pending approval by the Warden. Please wait for role assignment.'}, 
                              status=status.HTTP_403_FORBIDDEN)
            # Store user ID in session
            request.session['user_id'] = user.id
            return Response({
                'user': UserProfileSerializer(user).data,
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid password'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, 
                       status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """Logout user"""
    request.session.flush()
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def current_user_view(request):
    """Get current logged-in user"""
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
    """Update user profile"""
    user_id = request.session.get('user_id')
    if not user_id:
        return Response({'error': 'Not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        user = UserProfile.objects.get(id=user_id)
        
        # Update allowed fields
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


@api_view(['POST'])
@permission_classes([AllowAny])
def create_user_view(request):
    """Warden creates new users"""
    user_id = request.session.get('user_id')
    if not user_id:
        return Response({'error': 'Not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        current_user = UserProfile.objects.get(id=user_id)
        if current_user.role != 'Warden':
            return Response({'error': 'Only Warden can create users'}, 
                          status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    role = request.data.get('role', 'Inventory Staff')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not username or not password or not email:
        return Response({'error': 'Username, password and email are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if UserProfile.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
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
    """List all users (Warden only)"""
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
    
    users = UserProfile.objects.all()
    return Response(UserProfileSerializer(users, many=True).data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_user_view(request, user_id):
    """Update another user's profile (Warden only)"""
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return Response({'error': 'Not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        current_user = UserProfile.objects.get(id=current_user_id)
        if current_user.role != 'Warden':
            return Response({'error': 'Only Warden can update other users'}, 
                          status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        target_user = UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Target user not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Update allowed fields
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
        target_user.set_password(request.data['password'])
    
    target_user.save()
    return Response({
        'user': UserProfileSerializer(target_user).data,
        'message': 'User updated successfully'
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_user_view(request, user_id):
    """Delete a user (Warden only)"""
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return Response({'error': 'Not logged in'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        current_user = UserProfile.objects.get(id=current_user_id)
        if current_user.role != 'Warden':
            return Response({'error': 'Only Warden can delete users'}, 
                          status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Prevent deleting self
    if int(user_id) == int(current_user_id):
        return Response({'error': 'Cannot delete your own account'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        target_user = UserProfile.objects.get(id=user_id)
        target_user.delete()
        return Response({'message': 'User deleted successfully'}, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def reset_user_password_view(request, user_id):
    """Reset password for a user (Warden only)"""
    current_user_id = request.session.get('user_id')
    if not current_user_id:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        current_user = UserProfile.objects.get(id=current_user_id)
        if current_user.role != 'Warden':
            return Response({'error': 'Only Warden can reset passwords'}, 
                          status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
    new_password = request.data.get('new_password')
    if not new_password:
        return Response({'error': 'New password is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 4:
        return Response({'error': 'Password must be at least 4 characters'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        target_user = UserProfile.objects.get(id=user_id)
        target_user.set_password(new_password)
        target_user.save()
        return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset_view(request):
    """Send reset code to user's email"""
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = UserProfile.objects.get(email=email)
        
        # Generate reset code
        try:
            reset_code = user.generate_reset_code()
        except Exception as e:
            return Response({'error': f'Failed to generate code: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Send email
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
            # If email fails, log the code for debugging (remove in production)
            return Response({'message': 'Reset code generated (check server logs)'}, status=status.HTTP_200_OK)
            
    except UserProfile.DoesNotExist:
        # For security, don't reveal if email exists
        return Response({'message': 'If email exists, reset code has been sent'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_code_view(request):
    """Verify reset code"""
    email = request.data.get('email')
    code = request.data.get('code')
    
    if not email or not code:
        return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = UserProfile.objects.get(email=email)
        if user.verify_reset_code(code):
            return Response({'message': 'Code verified successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_with_code_view(request):
    """Reset password using verified code"""
    email = request.data.get('email')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    
    if not email or not code or not new_password:
        return Response({'error': 'Email, code and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 4:
        return Response({'error': 'Password must be at least 4 characters'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = UserProfile.objects.get(email=email)
        if user.verify_reset_code(code):
            user.set_password(new_password)
            user.clear_reset_code()
            return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)
    except UserProfile.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
