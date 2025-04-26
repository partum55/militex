from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from django.db import transaction

User = get_user_model()

def create_user(data):
    """
    Create a new user with the provided data
    
    Args:
        data (dict): User data including username, email, password, etc.
        
    Returns:
        User: The created user instance
        
    Raises:
        ValidationError: If there's an issue with the provided data
    """
    try:
        with transaction.atomic():
            # Extract required fields
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            
            # Validate required fields
            if not username or not password:
                raise ValidationError("Username and password are required")
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                raise ValidationError("Username already exists")
            
            if email and User.objects.filter(email=email).exists():
                raise ValidationError("Email already in use")
            
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone_number=data.get('phone_number', ''),
                is_military=data.get('is_military', False),
                military_id=data.get('military_id', '')
            )
            
            return user
    except Exception as e:
        if not isinstance(e, ValidationError):
            raise ValidationError(f"Error creating user: {str(e)}")
        raise

def get_user_profile(user_id):
    """
    Get a user's profile data
    
    Args:
        user_id (int): ID of the user to retrieve
        
    Returns:
        User: The user instance if found
        
    Raises:
        ValidationError: If the user doesn't exist
    """
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ValidationError("User not found")

def update_user_profile(user, data):
    """
    Update a user's profile with the provided data
    
    Args:
        user (User): User instance to update
        data (dict): Data to update the user with
        
    Returns:
        User: The updated user instance
    """
    try:
        with transaction.atomic():
            # Update basic fields
            for field in ['first_name', 'last_name', 'email', 'phone_number']:
                if field in data:
                    setattr(user, field, data[field])
            
            # Handle military status update
            if 'is_military' in data:
                user.is_military = data['is_military']
                
                # Reset verification if military status changed to false
                if not user.is_military:
                    user.is_verified = False
                    user.military_id = ''
            
            # Update military ID if provided
            if user.is_military and 'military_id' in data:
                user.military_id = data['military_id']
            
            # Handle password update if provided
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            user.save()
            return user
    except Exception as e:
        raise ValidationError(f"Error updating user profile: {str(e)}")

def verify_military_status(user, verification_data):
    """
    Verify a user's military status
    
    Args:
        user (User): User to verify
        verification_data (dict): Data to verify military status
        
    Returns:
        User: Updated user instance
    """
    if not user.is_military:
        raise ValidationError("User is not registered as military personnel")
    
    # In a real application, this would involve checking against
    # a military database or document verification process
    # For now, just mark as verified based on provided military_id
    
    if verification_data.get('military_id'):
        user.military_id = verification_data['military_id']
        user.is_verified = True
        user.save()
    
    return user

def delete_user(user_id):
    """
    Delete a user account
    
    Args:
        user_id (int): ID of the user to delete
        
    Raises:
        ValidationError: If the user doesn't exist
    """
    try:
        user = User.objects.get(id=user_id)
        user.delete()
    except User.DoesNotExist:
        raise ValidationError("User not found")

def change_password(user, current_password, new_password):
    """
    Change a user's password
    
    Args:
        user (User): User instance
        current_password (str): Current password for verification
        new_password (str): New password to set
        
    Returns:
        User: Updated user instance
        
    Raises:
        ValidationError: If current password is invalid
    """
    if not user.check_password(current_password):
        raise ValidationError("Current password is incorrect")
    
    user.set_password(new_password)
    user.save()
    return user

def get_users_by_criteria(criteria=None, is_military=None, is_verified=None):
    """
    Get users filtered by various criteria
    
    Args:
        criteria (dict): Filter criteria
        is_military (bool): Filter by military status
        is_verified (bool): Filter by verification status
        
    Returns:
        QuerySet: Filtered user queryset
    """
    queryset = User.objects.all()
    
    if criteria:
        queryset = queryset.filter(**criteria)
    
    if is_military is not None:
        queryset = queryset.filter(is_military=is_military)
        
    if is_verified is not None:
        queryset = queryset.filter(is_verified=is_verified)
    
    return queryset
