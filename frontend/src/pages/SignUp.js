/**
 * =============================================================================
 * SIGN UP PAGE - User Registration Screen
 * =============================================================================
 * 
 * PURPOSE:
 * This page allows new users to create an account in the system.
 * After registration, the account will be in "Pending" status until
 * the Warden approves and assigns a role.
 * 
 * FEATURES:
 * - Collects username, email, password, first name, last name
 * - Form validation (required fields)
 * - Shows pending approval notice
 * - Toast notification on successful registration
 * - Link to Sign In page for existing users
 * 
 * REGISTRATION FLOW:
 * 1. User fills out the form
 * 2. Data is sent to backend API
 * 3. If successful, shows success message
 * 4. User redirected to login (but can't login until approved)
 * 5. Warden must assign role in User Management
 * 
 * NOTE: The first user to register automatically becomes the Warden.
 * All subsequent users start with "Pending" role.
 * 
 * =============================================================================
 */

// useState hook to manage form data and toast visibility
import React, { useState } from 'react';

// Custom hook that handles authentication logic (register, login, etc.)
import { useAuth } from '../hooks/useAuth';

// Reusable UI components
import Toast from '../components/Toast';
import Button from '../components/Button';
import FormField from '../components/FormField';

/**
 * SignUp Component
 * 
 * Renders the registration form for new users.
 * Uses useAuth hook for registration logic.
 * 
 * @returns {JSX.Element} The sign up page
 */
function SignUp() {
    // =========================================================================
    // STATE VARIABLES
    // =========================================================================
    
    // Form data stored as an object (all fields in one state)
    // This is an alternative to having separate useState for each field
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    
    // Toast notification state
    const [toast, setToast] = useState({ show: false, message: '' });
    
    // =========================================================================
    // CUSTOM HOOK
    // Get registration function and states from useAuth
    // =========================================================================
    const { loading, error, handleRegister } = useAuth();
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    /**
     * Display a toast notification message
     * Auto-hides after 2 seconds
     */
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message });
        setTimeout(() => {
            setToast({ show: false, message: '' });
        }, 2000);
    };
    
    /**
     * Handle input field changes
     * Updates the specific field in formData object
     * 
     * Uses computed property name [e.target.name] to update the right field
     * Example: If name="username" and value="john", this sets formData.username = "john"
     * 
     * @param {Event} e - The input change event
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,  // Keep all existing values
            [e.target.name]: e.target.value  // Update only the changed field
        });
    };
    
    /**
     * Handle form submission
     * Calls the register function from useAuth hook
     */
    const onSubmit = (e) => {
        e.preventDefault();  // Prevent page refresh
        handleRegister(formData, showToast);
    };

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
            {/* Toast notification */}
            <Toast show={toast.show} message={toast.message} />
            
            {/* Page title */}
            <h2>Sign Up - Hostel Inventory System</h2>
            
            {/* Important notice about pending approval */}
            {/* This helps users understand they can't login immediately */}
            <div style={{ padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '5px', marginBottom: '15px' }}>
                <strong>Note:</strong> After registration, your account will be pending approval. The Warden must assign you a role before you can log in.
            </div>
            
            {/* Error message display */}
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            
            {/* Registration form */}
            <form onSubmit={onSubmit}>
                {/* Username field - required, must be unique */}
                <FormField
                    label="Username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required={true}
                />
                
                {/* Email field - required for password reset */}
                <FormField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required={true}
                />
                
                {/* First name field - optional */}
                <FormField
                    label="First Name"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                />
                
                {/* Last name field - optional */}
                <FormField
                    label="Last Name"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                />
                
                {/* Password field - required */}
                <FormField
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={true}
                />
                
                {/* Submit button - green for positive action */}
                <Button type="submit" disabled={loading} variant="success" fullWidth={true}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </Button>
            </form>
            
            {/* Link to Sign In page for existing users */}
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Already have an account? <a href="/signin">Sign In</a>
            </p>
        </div>
    );
}

// Export the component for use in App.js
export default SignUp;
