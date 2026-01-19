/**
 * =============================================================================
 * DASHBOARD PAGE - Main Home Screen
 * =============================================================================
 * 
 * PURPOSE:
 * This is the main landing page after a user logs in.
 * It displays a summary of the hostel inventory system and provides
 * navigation to all other sections of the application.
 * 
 * FEATURES:
 * - Shows system statistics (total assets, damage reports, rooms, users)
 * - Provides navigation buttons to all management pages
 * - Shows user info and logout button
 * - Warden-only features: User Management button and Total Users count
 * 
 * DATA FLOW:
 * 1. Component mounts → useEffect triggers
 * 2. Fetches dashboard summary from API
 * 3. Fetches current user info
 * 4. Displays data in summary cards
 * 
 * =============================================================================
 */

// React hooks for state management and side effects
import React, { useState, useEffect } from 'react';

// useNavigate hook for programmatic navigation (redirecting to other pages)
import { useNavigate } from 'react-router-dom';

// API functions for fetching data and authentication
import { getDashboardSummary, logout, getCurrentUser } from '../services/api';

// Reusable Button component for consistent styling
import Button from '../components/Button';

/**
 * Dashboard Component
 * 
 * The main dashboard that users see after logging in.
 * Shows summary statistics and navigation options.
 * 
 * @returns {JSX.Element} The dashboard page
 */
function Dashboard() {
    // =========================================================================
    // STATE VARIABLES
    // These store data that can change and trigger re-renders when updated
    // =========================================================================
    
    // Summary statistics fetched from the backend API
    // Initialize with zeros to prevent undefined errors before data loads
    const [summary, setSummary] = useState({
        total_assets: 0,
        damage_reports: 0,
        total_rooms: 0,
        total_users: 0
    });
    
    // Current logged-in user's information
    const [user, setUser] = useState(null);
    
    // Loading state to show loading indicator while fetching data
    const [loading, setLoading] = useState(true);
    
    // Navigation function from React Router
    // Used to redirect users to different pages
    const navigate = useNavigate();
    
    // =========================================================================
    // USEEFFECT - Runs when component first mounts (loads)
    // Similar to componentDidMount in class components
    // Empty array [] means this only runs once when page loads
    // =========================================================================
    useEffect(() => {
        fetchDashboardData();  // Get summary statistics
        fetchCurrentUser();     // Get logged-in user info
    }, []);
    
    // =========================================================================
    // DATA FETCHING FUNCTIONS
    // These functions communicate with the backend API
    // =========================================================================
    
    /**
     * Fetch dashboard summary statistics from the API
     * Gets counts of assets, damage reports, rooms, and users
     */
    const fetchDashboardData = async () => {
        try {
            // Call the API and wait for response
            const response = await getDashboardSummary();
            // Update state with the received data
            setSummary(response.data);
        } catch (err) {
            // Log error for debugging
            console.error('Error fetching dashboard data:', err);
            // If unauthorized (401) or forbidden (403), redirect to login
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/signin');
            }
        } finally {
            // Always set loading to false, whether success or error
            setLoading(false);
        }
    };
    
    /**
     * Fetch the currently logged-in user's information
     * Used to display username, role, and control access to features
     */
    const fetchCurrentUser = async () => {
        try {
            const response = await getCurrentUser();
            setUser(response.data);
        } catch (err) {
            console.error('Error fetching user:', err);
        }
    };
    
    // =========================================================================
    // EVENT HANDLERS
    // Functions that respond to user actions (clicks, form submissions, etc.)
    // =========================================================================
    
    /**
     * Handle user logout
     * Clears session and redirects to login page
     */
    const handleLogout = async () => {
        try {
            // Tell the server to end the session
            await logout();
            // Clear any locally stored user data
            localStorage.removeItem('user');
            // Redirect to login page
            navigate('/signin');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };
    
    // =========================================================================
    // CONDITIONAL RENDERING
    // Show loading indicator while data is being fetched
    // =========================================================================
    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }
    
    // =========================================================================
    // MAIN RENDER - The JSX that displays on screen
    // =========================================================================
    return (
        <div style={{ padding: '20px' }}>
            {/* Header Section - Title and User Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Dashboard - Hostel Inventory System</h1>
                <div>
                    {/* Display current user's name and role */}
                    <span style={{ marginRight: '15px' }}>
                        Welcome, {user?.username} ({user?.role})
                    </span>
                    {/* Logout button */}
                    <Button variant="danger" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
            
            {/* Navigation Section - Buttons to access different features */}
            <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={() => navigate('/assets')}>
                    Manage Assets
                </Button>
                <Button variant="primary" onClick={() => navigate('/rooms')}>
                    Manage Rooms
                </Button>
                <Button variant="danger" onClick={() => navigate('/damage-tracking')}>
                    🔧 Damage Tracking
                </Button>
                <Button variant="secondary" onClick={() => navigate('/profile')}>
                    My Profile
                </Button>
                {/* User Management button - Only visible to Warden */}
                {user?.role === 'Warden' && (
                    <Button variant="warning" onClick={() => navigate('/user-management')}>
                        👥 User Management
                    </Button>
                )}
            </div>
            
            {/* Summary Cards Section - Display statistics */}
            <h2>System Summary</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {/* Total Assets Card - Green background */}
                <div style={{ padding: '20px', backgroundColor: '#d4edda', borderRadius: '5px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Total Assets</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0' }}>{summary.total_assets}</p>
                </div>
                
                {/* Damage Reports Card - Red/pink background */}
                {/* Only counts reports with status "Not Fixed" */}
                <div style={{ padding: '20px', backgroundColor: '#f8d7da', borderRadius: '5px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Damage Reports</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0' }}>{summary.damage_reports}</p>
                </div>
                
                {/* Total Rooms Card - Light blue background */}
                <div style={{ padding: '20px', backgroundColor: '#d1ecf1', borderRadius: '5px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Total Rooms</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0' }}>{summary.total_rooms}</p>
                </div>
                
                {/* Total Users Card - Only visible to Warden role */}
                {user?.role === 'Warden' && (
                    <div style={{ padding: '20px', backgroundColor: '#e2e3e5', borderRadius: '5px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Total Users</h3>
                        <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0' }}>{summary.total_users}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Export the component so it can be imported in App.js
export default Dashboard;
