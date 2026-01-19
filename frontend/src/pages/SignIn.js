/**
 * =============================================================================
 * SIGN IN PAGE - User Login Screen
 * =============================================================================
 * 
 * PURPOSE:
 * This page allows existing users to log into the system.
 * It collects username and password, validates them with the backend,
 * and redirects to the dashboard on successful login.
 * 
 * FEATURES:
 * - Username and password input fields
 * - Form validation (required fields)
 * - Error message display for failed login
 * - Toast notification on successful login
 * - Links to Sign Up and Forgot Password pages
 * 
 * MVC ARCHITECTURE:
 * - This is the VIEW - it only handles the UI
 * - Business logic is in the useAuth HOOK (Controller)
 * - API calls are in the api.js SERVICE (Model communication)
 * 
 * =============================================================================
 */

// useState hook to manage component state (input values, toast visibility)
import React, { useState } from 'react';

// Custom hook that handles authentication logic (login, logout, etc.)
// This separates business logic from UI - the "Controller" in MVC
import { useAuth } from '../hooks/useAuth';

// Reusable UI components for consistent styling across the app
import Toast from '../components/Toast';       // Popup notification
import Button from '../components/Button';     // Styled button
import FormField from '../components/FormField'; // Input field with label

/**
 * SignIn Component
 * 
 * Renders the login form and handles user authentication.
 * Uses the useAuth hook for login logic to follow MVC pattern.
 * 
 * @returns {JSX.Element} The sign in page
 */
function SignIn() {
    // =========================================================================
    // STATE VARIABLES
    // Local state for form inputs and UI feedback
    // =========================================================================
    
    // Input field values - controlled components
    // "Controlled" means React manages the input value via state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Toast notification state
    // show: boolean to display/hide toast
    // message: text to display in the toast
    const [toast, setToast] = useState({ show: false, message: '' });
    
    // =========================================================================
    // CUSTOM HOOK
    // useAuth provides authentication functionality
    // This is the "Controller" - it handles business logic
    // =========================================================================
    const { loading, error, handleLogin } = useAuth();
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    /**
     * Display a toast notification message
     * Auto-hides after 1.5 seconds
     * 
     * @param {string} message - Text to display in the toast
     * @param {string} type - Type of toast (success/error) - not currently used but available for future
     */
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message });
        // Automatically hide toast after 1.5 seconds
        setTimeout(() => {
            setToast({ show: false, message: '' });
        }, 1500);
    };
    
    // =========================================================================
    // EVENT HANDLERS
    // =========================================================================
    
    /**
     * Handle form submission
     * Prevents default form behavior and calls the login function
     * 
     * @param {Event} e - The form submit event
     */
    const onSubmit = (e) => {
        // Prevent page refresh on form submit
        e.preventDefault();
        // Call the handleLogin function from useAuth hook
        // Pass credentials and the showToast callback for feedback
        handleLogin(username, password, showToast);
    };

    // =========================================================================
    // RENDER - The JSX that displays on screen
    // =========================================================================
    return (
        // Main container - centered on page with border
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
            {/* Toast notification - appears at top of form */}
            <Toast show={toast.show} message={toast.message} />
            
            {/* Page title */}
            <h2>Sign In - Hostel Inventory System</h2>
            
            {/* Error message display - shows when login fails */}
            {/* The error comes from useAuth hook */}
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            
            {/* Login form */}
            <form onSubmit={onSubmit}>
                {/* Username input field */}
                <FormField
                    label="Username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={true}
                />
                
                {/* Password input field */}
                <FormField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={true}
                />
                
                {/* Submit button - disabled while loading to prevent double submission */}
                <Button type="submit" disabled={loading} variant="primary" fullWidth={true}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </Button>
            </form>
            
            {/* Link to Sign Up page for new users */}
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                Don't have an account? <a href="/signup">Sign Up</a>
            </p>
            
            {/* Link to Forgot Password page */}
            <p style={{ marginTop: '10px', textAlign: 'center' }}>
                <a href="/forgot-password" style={{ color: '#dc3545', textDecoration: 'none' }}>Forgot Password?</a>
            </p>
        </div>
    );
}

// Export the component so it can be used in App.js routing
export default SignIn;
