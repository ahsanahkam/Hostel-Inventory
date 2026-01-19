/**
 * =============================================================================
 * API SERVICE - Central Communication Layer
 * =============================================================================
 * 
 * PURPOSE:
 * This file acts as the "Service Layer" in our MVC architecture.
 * It handles ALL communication between the React frontend and Django backend.
 * 
 * WHAT IT DOES:
 * - Sends HTTP requests (GET, POST, PUT, DELETE) to the backend server
 * - Uses Axios library to make these requests easier to handle
 * - Returns promises that resolve with the server's response
 * 
 * HOW TO USE:
 * Import the function you need in your component or hook:
 *   import { login, getAssets } from '../services/api';
 * Then call it:
 *   const response = await login({ username: 'john', password: '1234' });
 * 
 * HTTP METHODS EXPLAINED:
 * - GET    = Fetch/retrieve data (like reading a book)
 * - POST   = Create new data (like writing a new page)
 * - PUT    = Update existing data (like editing a page)
 * - DELETE = Remove data (like tearing out a page)
 * 
 * =============================================================================
 */

// Axios is a library that makes HTTP requests easy to write and handle
import axios from 'axios';

// Base URL for all API calls - points to our Django backend server
// Change this if your backend runs on a different port or domain
const API_BASE_URL = 'http://localhost:8000/api';

// This setting ensures cookies (including session ID) are sent with every request
// Required for session-based authentication to work properly
axios.defaults.withCredentials = true;


/* =============================================================================
   AUTHENTICATION FUNCTIONS
   These handle user login, logout, and registration
   ============================================================================= */

/**
 * Register a new user account
 * @param {Object} userData - Contains username, password, email, first_name, last_name
 * @returns {Promise} - Resolves with the created user data or error
 */
export const register = (userData) => {
    return axios.post(`${API_BASE_URL}/users/register/`, userData);
};

/**
 * Log in an existing user
 * @param {Object} credentials - Contains username and password
 * @returns {Promise} - Resolves with user data and session cookie on success
 */
export const login = (credentials) => {
    return axios.post(`${API_BASE_URL}/users/login/`, credentials);
};

/**
 * Log out the current user
 * Clears the session on the server side
 * @returns {Promise} - Resolves when logout is complete
 */
export const logout = () => {
    return axios.post(`${API_BASE_URL}/users/logout/`);
};

/**
 * Get the currently logged-in user's information
 * Used to check if user is still authenticated and get their profile
 * @returns {Promise} - Resolves with current user data or 401 if not logged in
 */
export const getCurrentUser = () => {
    return axios.get(`${API_BASE_URL}/users/me/`);
};

/**
 * Update the current user's profile information
 * @param {Object} profileData - Contains first_name, last_name, phone_number
 * @returns {Promise} - Resolves with updated user data
 */
export const updateProfile = (profileData) => {
    return axios.put(`${API_BASE_URL}/users/profile/update/`, profileData);
};


/* =============================================================================
   USER MANAGEMENT FUNCTIONS (Warden Only)
   These are restricted to users with the "Warden" role
   ============================================================================= */

/**
 * Create a new user (Warden only)
 * @param {Object} userData - Contains username, password, email, role, etc.
 * @returns {Promise} - Resolves with the created user data
 */
export const createUser = (userData) => {
    return axios.post(`${API_BASE_URL}/users/create-user/`, userData);
};

/**
 * Get list of all users in the system (Warden only)
 * @returns {Promise} - Resolves with array of all user objects
 */
export const listUsers = () => {
    return axios.get(`${API_BASE_URL}/users/list/`);
};

/**
 * Update another user's information (Warden only)
 * @param {number} userId - The ID of the user to update
 * @param {Object} userData - The new data for the user
 * @returns {Promise} - Resolves with updated user data
 */
export const updateUser = (userId, userData) => {
    return axios.put(`${API_BASE_URL}/users/update-user/${userId}/`, userData);
};

/**
 * Delete a user from the system (Warden only)
 * @param {number} userId - The ID of the user to delete
 * @returns {Promise} - Resolves when deletion is complete
 */
export const deleteUser = (userId) => {
    return axios.delete(`${API_BASE_URL}/users/delete-user/${userId}/`);
};


/* =============================================================================
   ASSET MANAGEMENT FUNCTIONS
   CRUD operations for hostel assets (furniture, equipment, etc.)
   ============================================================================= */

/**
 * Get all assets in the hostel inventory
 * @returns {Promise} - Resolves with array of all asset objects
 */
export const getAssets = () => {
    return axios.get(`${API_BASE_URL}/assets/assets/`);
};

/**
 * Create a new asset in the inventory
 * @param {Object} assetData - Contains name, category, total_quantity, condition, room
 * @returns {Promise} - Resolves with the created asset data
 */
export const createAsset = (assetData) => {
    return axios.post(`${API_BASE_URL}/assets/assets/`, assetData);
};

/**
 * Update an existing asset's information
 * @param {number} id - The ID of the asset to update
 * @param {Object} assetData - The new data for the asset
 * @returns {Promise} - Resolves with updated asset data
 */
export const updateAsset = (id, assetData) => {
    return axios.put(`${API_BASE_URL}/assets/assets/${id}/`, assetData);
};

/**
 * Delete an asset from the inventory
 * @param {number} id - The ID of the asset to delete
 * @returns {Promise} - Resolves when deletion is complete
 */
export const deleteAsset = (id) => {
    return axios.delete(`${API_BASE_URL}/assets/assets/${id}/`);
};


/* =============================================================================
   ROOM MANAGEMENT FUNCTIONS
   CRUD operations for hostel rooms
   ============================================================================= */

/**
 * Get all rooms in the hostel
 * @returns {Promise} - Resolves with array of all room objects
 */
export const getRooms = () => {
    return axios.get(`${API_BASE_URL}/rooms/`);
};

/**
 * Create a new room
 * @param {Object} roomData - Contains room_number, floor, capacity, etc.
 * @returns {Promise} - Resolves with the created room data
 */
export const createRoom = (roomData) => {
    return axios.post(`${API_BASE_URL}/rooms/`, roomData);
};

/**
 * Update an existing room's information
 * @param {number} id - The ID of the room to update
 * @param {Object} roomData - The new data for the room
 * @returns {Promise} - Resolves with updated room data
 */
export const updateRoom = (id, roomData) => {
    return axios.put(`${API_BASE_URL}/rooms/${id}/`, roomData);
};

/**
 * Delete a room from the system
 * @param {number} id - The ID of the room to delete
 * @returns {Promise} - Resolves when deletion is complete
 */
export const deleteRoom = (id) => {
    return axios.delete(`${API_BASE_URL}/rooms/${id}/`);
};


/* =============================================================================
   DASHBOARD FUNCTION
   Gets summary statistics for the dashboard page
   ============================================================================= */

/**
 * Get dashboard summary statistics
 * Returns counts of assets, rooms, users, and damage reports
 * @returns {Promise} - Resolves with summary object containing all counts
 */
export const getDashboardSummary = () => {
    return axios.get(`${API_BASE_URL}/dashboard/summary/`);
};


/* =============================================================================
   DAMAGE REPORT FUNCTIONS
   CRUD operations for reporting and tracking damaged assets
   ============================================================================= */

/**
 * Get all damage reports
 * @returns {Promise} - Resolves with array of all damage report objects
 */
export const getDamageReports = () => {
    return axios.get(`${API_BASE_URL}/assets/damage-reports/`);
};

/**
 * Create a new damage report
 * @param {Object} reportData - Contains asset, description, quantity_damaged, status
 * @returns {Promise} - Resolves with the created damage report data
 */
export const createDamageReport = (reportData) => {
    return axios.post(`${API_BASE_URL}/assets/damage-reports/`, reportData);
};

/**
 * Update an existing damage report
 * @param {number} id - The ID of the damage report to update
 * @param {Object} reportData - The new data for the report
 * @returns {Promise} - Resolves with updated damage report data
 */
export const updateDamageReport = (id, reportData) => {
    return axios.put(`${API_BASE_URL}/assets/damage-reports/${id}/`, reportData);
};

/**
 * Delete a damage report
 * @param {number} id - The ID of the damage report to delete
 * @returns {Promise} - Resolves when deletion is complete
 */
export const deleteDamageReport = (id) => {
    return axios.delete(`${API_BASE_URL}/assets/damage-reports/${id}/`);
};


/* =============================================================================
   PASSWORD RESET FUNCTIONS (Forgot Password Flow)
   These handle the email-based password reset process
   ============================================================================= */

/**
 * Request a password reset code
 * Sends a 6-digit code to the user's email address
 * @param {string} email - The user's email address
 * @returns {Promise} - Resolves when email is sent (or appears to be sent for security)
 */
export const requestPasswordReset = (email) => {
    return axios.post(`${API_BASE_URL}/users/request-reset/`, { email });
};

/**
 * Verify the reset code entered by the user
 * @param {string} email - The user's email address
 * @param {string} code - The 6-digit code from email
 * @returns {Promise} - Resolves if code is valid, rejects if invalid/expired
 */
export const verifyResetCode = (email, code) => {
    return axios.post(`${API_BASE_URL}/users/verify-code/`, { email, code });
};

/**
 * Reset password using the verified code
 * Final step in the forgot password flow
 * @param {string} email - The user's email address
 * @param {string} code - The verified 6-digit code
 * @param {string} newPassword - The new password to set
 * @returns {Promise} - Resolves when password is successfully changed
 */
export const resetPasswordWithCode = (email, code, newPassword) => {
    return axios.post(`${API_BASE_URL}/users/reset-password-with-code/`, { 
        email, 
        code, 
        new_password: newPassword 
    });
};
