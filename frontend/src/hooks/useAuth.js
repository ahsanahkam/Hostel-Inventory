/**
 * =============================================================================
 * useAuth HOOK - Authentication Controller
 * =============================================================================
 * 
 * PURPOSE:
 * This custom hook handles all authentication-related business logic.
 * It acts as the CONTROLLER in the MVC architecture, separating
 * authentication logic from the UI components (Views).
 * 
 * WHAT IS A CUSTOM HOOK?
 * A custom hook is a JavaScript function that:
 * - Starts with "use" (like useAuth, useState, useEffect)
 * - Can use other React hooks inside it
 * - Lets you extract and share logic between components
 * 
 * FEATURES:
 * - Handle user login with username/password
 * - Handle user registration
 * - Manage loading and error states
 * - Navigate after successful authentication
 * 
 * USAGE IN COMPONENTS:
 * const { loading, error, handleLogin, handleRegister } = useAuth();
 * 
 * =============================================================================
 */

// useState for managing state within the hook
import { useState } from 'react';

// useNavigate for redirecting users after login/register
import { useNavigate } from 'react-router-dom';

// API functions for authentication
import { login, register } from '../services/api';

/**
 * Custom hook for authentication
 * 
 * @returns {Object} Object containing state and functions for auth
 *   - loading: Boolean indicating if an auth operation is in progress
 *   - error: String containing any error message
 *   - handleLogin: Function to log in a user
 *   - handleRegister: Function to register a new user
 *   - navigate: Function to navigate to different pages
 */
export const useAuth = () => {
    // =========================================================================
    // STATE VARIABLES
    // =========================================================================
    
    // Loading state - true while API call is in progress
    const [loading, setLoading] = useState(false);
    
    // Error message state - displays validation/auth errors to user
    const [error, setError] = useState('');
    
    // Navigation function from React Router
    const navigate = useNavigate();
    
    // =========================================================================
    // LOGIN FUNCTION
    // =========================================================================
    
    /**
     * Handle user login
     * 
     * @param {string} username - The user's username
     * @param {string} password - The user's password
     * @param {function} showToast - Callback function to display toast notification
     */
    const handleLogin = async (username, password, showToast) => {
        // Clear any previous error messages
        setError('');
        // Start loading indicator
        setLoading(true);
        
        try {
            // Call the login API with credentials
            const response = await login({ username, password });
            
            // Store user data in localStorage for persistence
            // This allows the app to remember the user across page refreshes
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Show success message to user
            showToast('Login successful!', 'success');
            
            // Wait 1.5 seconds then redirect to dashboard
            // The delay allows user to see the success message
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            // Extract error message from API response or use default
            const errorMessage = err.response?.data?.error || 'Login failed. Check your username and password.';
            setError(errorMessage);
            console.error('Login error:', err);
        } finally {
            // Always stop loading indicator, whether success or error
            setLoading(false);
        }
    };
    
    // =========================================================================
    // REGISTER FUNCTION
    // =========================================================================
    
    /**
     * Handle user registration
     * 
     * @param {Object} formData - Object containing registration data
     *   - username: string
     *   - email: string
     *   - password: string
     *   - first_name: string (optional)
     *   - last_name: string (optional)
     * @param {function} showToast - Callback function to display toast notification
     */
    const handleRegister = async (formData, showToast) => {
        // Clear any previous error messages
        setError('');
        setLoading(true);
        
        try {
            // Call the register API with form data
            await register(formData);
            
            // Show success message
            showToast('Registration successful! Redirecting to login...', 'success');
            
            // Wait 2 seconds then redirect to login page
            setTimeout(() => {
                navigate('/signin');
            }, 2000);
        } catch (err) {
            // Try to get specific error message from API response
            // API might return error in different formats
            const errorMsg = err.response?.data?.error || 
                           err.response?.data?.username?.[0] || 
                           'Registration failed. Please check your details.';
            setError(errorMsg);
            console.error('Registration error:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };
    
    // =========================================================================
    // RETURN VALUES
    // Return all state and functions that components need
    // =========================================================================
    return {
        loading,        // Boolean: is operation in progress?
        error,          // String: error message to display
        handleLogin,    // Function: call to log in user
        handleRegister, // Function: call to register user
        navigate        // Function: navigate to different routes
    };
};
