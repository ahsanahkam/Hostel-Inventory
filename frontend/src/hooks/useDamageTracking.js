/**
 * =============================================================================
 * useDamageTracking HOOK - Damage Report Management Controller
 * =============================================================================
 * 
 * PURPOSE:
 * This custom hook handles all damage report-related business logic.
 * It acts as the CONTROLLER in the MVC architecture, managing:
 * - Fetching rooms (for dropdown selection)
 * - Fetching damage reports
 * - Creating new damage reports
 * - Updating damage report status (Not Fixed → Fixed)
 * - Deleting damage reports
 * 
 * MVC PATTERN:
 * - MODEL: api.js (handles data communication)
 * - VIEW: DamageTracking.js (handles UI rendering)
 * - CONTROLLER: useDamageTracking.js (this file - handles business logic)
 * 
 * DAMAGE REPORT DATA STRUCTURE:
 * {
 *   id: number,              - Unique identifier
 *   room: number,            - ID of the room where damage occurred
 *   room_number: string,     - Room number (from related Room object)
 *   asset_type: string,      - Type of damaged asset (Bed, Table, etc.)
 *   description: string,     - Description of the damage
 *   status: string,          - 'Not Fixed' or 'Fixed'
 *   reported_at: string,     - Date/time when report was created
 *   reported_by: string      - Username of who reported
 * }
 * 
 * USAGE:
 * const { damageReports, handleSubmit, ... } = useDamageTracking();
 * 
 * =============================================================================
 */

// React hooks for state and lifecycle management
import { useState, useEffect } from 'react';

// Navigation hook for redirecting users
import { useNavigate } from 'react-router-dom';

// API functions for damage report and room operations
import { getRooms, createDamageReport, getDamageReports, updateDamageReport, deleteDamageReport } from '../services/api';

/**
 * Custom hook for damage tracking management
 * 
 * @returns {Object} Object containing state and functions for damage tracking
 */
export const useDamageTracking = () => {
    // =========================================================================
    // STATE VARIABLES
    // =========================================================================
    
    // List of rooms (for the room selection dropdown)
    const [rooms, setRooms] = useState([]);
    
    // List of damage reports fetched from API
    const [damageReports, setDamageReports] = useState([]);
    
    // Currently selected room ID in the form
    const [selectedRoom, setSelectedRoom] = useState('');
    
    // Currently selected asset type in the form
    const [assetType, setAssetType] = useState('Bed');
    
    // Description text for the damage report
    const [description, setDescription] = useState('');
    
    // Loading state while fetching data
    const [loading, setLoading] = useState(true);
    
    // Navigation function
    const navigate = useNavigate();
    
    // =========================================================================
    // CONSTANTS
    // =========================================================================
    
    /**
     * List of asset types available in the system
     * This determines what options appear in the asset type dropdown
     * Matches the choices defined in the backend Asset model
     */
    const ASSET_TYPES = ['Bed', 'Table', 'Chair', 'Cupboard', 'Fan', 'Light', 'Other'];
    
    // =========================================================================
    // USEEFFECT - Initial Data Load
    // Fetches both rooms and damage reports when component mounts
    // =========================================================================
    useEffect(() => {
        fetchRooms();
        fetchDamageReports();
    }, []);  // Empty array = run once on mount
    
    // =========================================================================
    // DATA FETCHING FUNCTIONS
    // =========================================================================
    
    /**
     * Fetch all rooms from the API
     * Used to populate the room selection dropdown
     */
    const fetchRooms = async () => {
        try {
            const response = await getRooms();
            // Ensure we always set an array
            setRooms(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setRooms([]);
            // Redirect to login if authentication fails
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/signin');
            }
        } finally {
            setLoading(false);
        }
    };
    
    /**
     * Fetch all damage reports from the API
     * Called on mount and after create/update/delete operations
     */
    const fetchDamageReports = async () => {
        try {
            const response = await getDamageReports();
            setDamageReports(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching damage reports:', err);
            setDamageReports([]);
        }
    };
    
    // =========================================================================
    // FORM HANDLERS
    // =========================================================================
    
    /**
     * Handle form submission for creating a new damage report
     * 
     * @param {Event} e - The form submit event
     * @param {function} showToast - Callback for toast notifications
     */
    const handleSubmit = async (e, showToast) => {
        e.preventDefault();  // Prevent page refresh
        
        // =====================================================================
        // VALIDATION: Check required fields before submitting
        // =====================================================================
        
        if (!selectedRoom) {
            showToast('Please select a room', 'error');
            return;  // Stop execution if no room selected
        }
        
        if (!description.trim()) {
            showToast('Please enter damage description', 'error');
            return;  // Stop execution if description is empty
        }
        
        // =====================================================================
        // CREATE DAMAGE REPORT
        // =====================================================================
        
        try {
            await createDamageReport({
                room: selectedRoom,           // Room ID
                asset_type: assetType,        // Type of asset (Bed, Table, etc.)
                description: description.trim()  // Trimmed description text
            });
            
            showToast('Damage report added successfully!', 'success');
            
            // Clear the description field (keep room and asset type for convenience)
            setDescription('');
            
            // Refresh the damage reports list
            fetchDamageReports();
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to add damage report', 'error');
            console.error('Error:', err);
        }
    };
    
    /**
     * Update the status of a damage report
     * Used to mark damage as "Fixed" or change it back to "Not Fixed"
     * 
     * @param {number} reportId - ID of the damage report to update
     * @param {string} newStatus - New status value ('Fixed' or 'Not Fixed')
     * @param {function} showToast - Callback for toast notifications
     */
    const handleStatusChange = async (reportId, newStatus, showToast) => {
        try {
            // Find the current report data
            const report = damageReports.find(r => r.id === reportId);
            
            // Update with new status while keeping other data
            await updateDamageReport(reportId, {
                ...report,        // Spread existing report data
                status: newStatus  // Override only the status
            });
            
            showToast('Status updated successfully!', 'success');
            fetchDamageReports();  // Refresh the list
        } catch (err) {
            showToast('Error updating status', 'error');
            console.error('Error:', err);
        }
    };
    
    /**
     * Delete a damage report
     * Shows confirmation dialog with details before deleting
     * 
     * @param {number} reportId - ID of the report to delete
     * @param {string} roomNumber - Room number (for confirmation message)
     * @param {string} assetType - Asset type (for confirmation message)
     * @param {function} showToast - Callback for toast notifications
     */
    const handleDelete = async (reportId, roomNumber, assetType, showToast) => {
        // Show confirmation with specific details about what's being deleted
        if (window.confirm(`Delete damage report for ${assetType} in Room ${roomNumber}?`)) {
            try {
                await deleteDamageReport(reportId);
                showToast('Damage report deleted successfully!', 'success');
                fetchDamageReports();  // Refresh the list
            } catch (err) {
                showToast('Error deleting report', 'error');
                console.error('Error:', err);
            }
        }
    };
    
    // =========================================================================
    // RETURN VALUES
    // Return all state and functions that components need to use
    // =========================================================================
    return {
        // Data state
        rooms,                  // Array: list of rooms for dropdown
        damageReports,          // Array: list of damage reports
        
        // Form state
        selectedRoom,           // string: currently selected room ID
        assetType,              // string: currently selected asset type
        description,            // string: damage description text
        loading,                // boolean: is data loading?
        
        // Constants
        ASSET_TYPES,            // Array: list of asset type options
        
        // Form state setters
        setSelectedRoom,        // Function: update selected room
        setAssetType,           // Function: update asset type
        setDescription,         // Function: update description text
        
        // Event handlers
        handleSubmit,           // Function: create new damage report
        handleStatusChange,     // Function: update report status
        handleDelete,           // Function: delete report
        
        // Navigation
        navigate                // Function: navigate to routes
    };
};
