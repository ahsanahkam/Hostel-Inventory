/**
 * =============================================================================
 * PROFILE PAGE - User Profile Management
 * =============================================================================
 * 
 * PURPOSE:
 * This page allows users to view and update their own profile information.
 * Users can see their current details and update their name and phone number.
 * 
 * FEATURES:
 * - Display current user information (username, email, name, role, phone)
 * - Update profile form (first name, last name, phone number)
 * - Toggle update form visibility
 * - Toast notifications for success/error feedback
 * 
 * NOTE: Users cannot change their username, email, or role from this page.
 * Password changes must be done through the Forgot Password feature.
 * 
 * =============================================================================
 */

// React hooks for state and lifecycle management
import React, { useState, useEffect } from 'react';

// Navigation hook for redirecting users
import { useNavigate } from 'react-router-dom';

// API functions for fetching and updating user data
import { getCurrentUser, updateProfile } from '../services/api';

// Reusable UI components
import Toast from '../components/Toast';
import Button from '../components/Button';

/**
 * Profile Component
 * 
 * Displays the current user's profile and allows them to update it.
 * 
 * @returns {JSX.Element} The profile page
 */
function Profile() {
    // =========================================================================
    // STATE VARIABLES
    // =========================================================================
    
    // Current user object from the backend
    const [user, setUser] = useState(null);
    
    // Form field values for profile update
    // Separate state for each to allow individual updates
    const [phoneNumber, setPhoneNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    
    // Loading state while fetching initial data
    const [loading, setLoading] = useState(true);
    
    // Toggle to show/hide the update form
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    
    // Toast notification state with type for styling (success/error)
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // Navigation function
    const navigate = useNavigate();
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    /**
     * Display a toast notification
     * Auto-hides after 3 seconds
     * 
     * @param {string} message - Text to display
     * @param {string} type - 'success' or 'error' for styling
     */
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };
    
    // =========================================================================
    // USEEFFECT - Fetch user data when component loads
    // =========================================================================
    useEffect(() => {
        fetchCurrentUser();
    }, []);
    
    // =========================================================================
    // DATA FETCHING FUNCTIONS
    // =========================================================================
    
    /**
     * Fetch current user's information from the API
     * Also populates the form fields with existing data
     */
    const fetchCurrentUser = async () => {
        try {
            const response = await getCurrentUser();
            // Store the full user object
            setUser(response.data);
            // Populate form fields with existing values
            // Use empty string as fallback if value doesn't exist
            setPhoneNumber(response.data.phone_number || '');
            setFirstName(response.data.first_name || '');
            setLastName(response.data.last_name || '');
        } catch (err) {
            console.error('Error fetching user:', err);
            // Redirect to login if not authenticated
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/signin');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // =========================================================================
    // EVENT HANDLERS
    // =========================================================================
    
    /**
     * Handle profile update form submission
     * Sends updated data to the API
     * 
     * @param {Event} e - Form submit event
     */
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        
        // Prepare the data to send to the API
        const updateData = {
            phone_number: phoneNumber,
            first_name: firstName,
            last_name: lastName
        };
        
        try {
            // Send update request to API
            await updateProfile(updateData);
            // Show success message
            showToast('Profile updated successfully!', 'success');
            // Hide the update form
            setShowUpdateForm(false);
            // Refresh user data to show updated values
            fetchCurrentUser();
        } catch (err) {
            showToast('Error updating profile', 'error');
        }
    };
    
    // =========================================================================
    // CONDITIONAL RENDERING - Show loading state
    // =========================================================================
    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }
    
    // =========================================================================
    // MAIN RENDER
    // =========================================================================
    return (
        <div style={{ padding: '20px' }}>
            {/* Toast notification component */}
            <Toast show={toast.show} message={toast.message} type={toast.type} />
            
            {/* Header with title and back button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>My Profile</h1>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
            
            {/* User Information Display Card */}
            <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
                <h2>My Information</h2>
                {/* Display all user fields */}
                {/* Using optional chaining (?.) to safely access properties */}
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
                <p><strong>Role:</strong> {user?.role}</p>
                <p><strong>Phone Number:</strong> {user?.phone_number || 'Not set'}</p>
                
                {/* Toggle button to show/hide update form */}
                <div style={{ marginTop: '20px' }}>
                    <Button 
                        variant="primary" 
                        onClick={() => setShowUpdateForm(!showUpdateForm)}
                    >
                        {showUpdateForm ? 'Cancel Update' : 'Update Profile'}
                    </Button>
                </div>
            </div>
            
            {/* Profile Update Form - Only shown when showUpdateForm is true */}
            {showUpdateForm && (
                <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <h3>Update Profile</h3>
                    <form onSubmit={handleUpdateProfile}>
                        {/* First Name input */}
                        <div style={{ marginBottom: '15px' }}>
                            <label>First Name:</label><br />
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter first name"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        {/* Last Name input */}
                        <div style={{ marginBottom: '15px' }}>
                            <label>Last Name:</label><br />
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter last name"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        {/* Phone Number input */}
                        <div style={{ marginBottom: '15px' }}>
                            <label>Phone Number:</label><br />
                            <input
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter phone number"
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>
                        {/* Submit button */}
                        <Button variant="success" type="submit">
                            Save Changes
                        </Button>
                        {/* Note about password changes */}
                        <p style={{ marginTop: '15px', fontSize: '14px', color: '#6c757d' }}>
                            <strong>Need to change password?</strong> Contact the Warden to reset your password via <a href="/forgot-password" style={{ color: '#007bff' }}>Forgot Password</a>
                        </p>
                    </form>
                </div>
            )}
        </div>
    );
}

// Export the component
export default Profile;
