/**
 * =============================================================================
 * USER MANAGEMENT PAGE - Admin User Control (Warden Only)
 * =============================================================================
 * 
 * PURPOSE:
 * This page allows the Warden to manage all users in the system.
 * Only users with the "Warden" role can access this page.
 * 
 * FEATURES:
 * - View all users in the system
 * - Change user roles (approve pending users)
 * - Delete users from the system
 * - View user contact information
 * 
 * ACCESS CONTROL:
 * - Only Warden role can view this page
 * - Non-Warden users are redirected to dashboard
 * - Warden cannot delete their own account
 * - Warden cannot change their own role
 * 
 * USER ROLES:
 * - Pending: New users waiting for approval (cannot login)
 * - Warden: Full admin access to all features
 * - Sub-Warden: Limited admin access
 * - Inventory Staff: Basic access to asset management
 * 
 * =============================================================================
 */

// React hooks for state and lifecycle management
import React, { useState, useEffect } from 'react';

// Navigation hook
import { useNavigate } from 'react-router-dom';

// API functions for user management
import { getCurrentUser, listUsers, updateUser, deleteUser } from '../services/api';

// Reusable UI components
import Toast from '../components/Toast';
import Button from '../components/Button';

/**
 * UserManagement Component
 * 
 * Admin page for managing system users.
 * Restricted to Warden role only.
 * 
 * @returns {JSX.Element} The user management page
 */
function UserManagement() {
    // =========================================================================
    // STATE VARIABLES
    // =========================================================================
    
    // Current logged-in user (should be Warden)
    const [user, setUser] = useState(null);
    
    // Loading state
    const [loading, setLoading] = useState(true);
    
    // List of all users in the system
    const [allUsers, setAllUsers] = useState([]);
    
    // Toast notification state
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // Navigation function
    const navigate = useNavigate();
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    /**
     * Display toast notification
     */
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };
    
    // =========================================================================
    // USEEFFECT - Check access and fetch data on mount
    // =========================================================================
    useEffect(() => {
        fetchCurrentUser();
    }, []);
    
    // =========================================================================
    // DATA FETCHING FUNCTIONS
    // =========================================================================
    
    /**
     * Fetch current user and verify Warden access
     * Redirects non-Warden users away from this page
     */
    const fetchCurrentUser = async () => {
        try {
            const response = await getCurrentUser();
            setUser(response.data);
            
            // ACCESS CONTROL CHECK
            // Only Warden can access this page
            if (response.data.role !== 'Warden') {
                navigate('/dashboard');
                return;
            }
            
            // If user is Warden, fetch all users
            fetchAllUsers();
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
    
    /**
     * Fetch list of all users in the system
     */
    const fetchAllUsers = async () => {
        try {
            const response = await listUsers();
            setAllUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };
    
    // =========================================================================
    // EVENT HANDLERS
    // =========================================================================
    
    /**
     * Handle role change for a user
     * Called when Warden selects a new role from dropdown
     * 
     * @param {number} userId - ID of the user to update
     * @param {string} newRole - The new role to assign
     */
    const handleRoleChange = async (userId, newRole) => {
        try {
            // Call API to update user's role
            await updateUser(userId, { role: newRole });
            showToast('User role updated successfully!', 'success');
            // Refresh user list to show updated role
            fetchAllUsers();
        } catch (err) {
            showToast('Error updating role: ' + (err.response?.data?.error || 'Unknown error'), 'error');
        }
    };
    
    /**
     * Handle user deletion
     * Shows confirmation dialog before deleting
     * 
     * @param {number} userId - ID of the user to delete
     */
    const handleDeleteUser = async (userId) => {
        // Confirm deletion with user - this is a destructive action
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        try {
            await deleteUser(userId);
            showToast('User deleted successfully!', 'success');
            // Refresh user list to remove deleted user
            fetchAllUsers();
        } catch (err) {
            showToast('Error deleting user: ' + (err.response?.data?.error || 'Unknown error'), 'error');
        }
    };
    
    // =========================================================================
    // LOADING STATE
    // =========================================================================
    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }
    
    // =========================================================================
    // MAIN RENDER
    // =========================================================================
    return (
        <div style={{ padding: '20px' }}>
            {/* Toast notification */}
            <Toast show={toast.show} message={toast.message} type={toast.type} />
            
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>👥 User Management</h1>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
            
            {/* Main content card with yellow/warning theme to indicate admin area */}
            <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fff3cd', border: '2px solid #ffc107', borderRadius: '5px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <h2 style={{ margin: 0 }}>Manage Users</h2>
                    <p style={{ margin: '5px 0 0 0', color: '#856404' }}>Approve pending users and assign roles</p>
                </div>
                
                {/* ============================================================
                    ALL USERS TABLE
                    ============================================================ */}
                <h3 style={{ marginTop: '20px' }}>All Users</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', backgroundColor: '#ffffff' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Username</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Phone</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Role</th>
                            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Map through all users to create table rows */}
                        {allUsers.map(u => (
                            <tr key={u.id}>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.username}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.first_name} {u.last_name}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.email}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{u.phone_number || 'N/A'}</td>
                                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                    {/* 
                                     * ROLE DISPLAY LOGIC:
                                     * - Current user (Warden) sees their role as a static badge
                                     * - Other users have a dropdown to change their role
                                     */}
                                    {u.id === user?.id ? (
                                        // Static badge for current user (cannot change own role)
                                        <span style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', borderRadius: '3px' }}>
                                            {u.role}
                                        </span>
                                    ) : (
                                        // Dropdown for other users - allows role change
                                        <select
                                            value={u.role}
                                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            style={{ 
                                                width: 'auto', 
                                                padding: '5px 8px', 
                                                // Color-coded based on role
                                                backgroundColor: u.role === 'Pending' ? '#6c757d' : u.role === 'Warden' ? '#dc3545' : u.role === 'Sub-Warden' ? '#ffc107' : '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="Pending">Pending (No Access)</option>
                                            <option value="Warden">Warden</option>
                                            <option value="Sub-Warden">Sub-Warden</option>
                                            <option value="Inventory Staff">Inventory Staff</option>
                                        </select>
                                    )}
                                </td>
                                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    {/* 
                                     * DELETE BUTTON LOGIC:
                                     * - Show delete button for other users
                                     * - Show "You" label for current user (cannot delete self)
                                     */}
                                    {u.id !== user?.id ? (
                                        <Button variant="danger" onClick={() => handleDeleteUser(u.id)}>
                                            Delete
                                        </Button>
                                    ) : (
                                        <span style={{ fontStyle: 'italic', color: '#6c757d' }}>You</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Export the component
export default UserManagement;
