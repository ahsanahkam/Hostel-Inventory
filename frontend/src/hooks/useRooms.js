/**
 * =============================================================================
 * useRooms HOOK - Room Management Controller
 * =============================================================================
 * 
 * PURPOSE:
 * This custom hook handles all room-related business logic.
 * It acts as the CONTROLLER in the MVC architecture, managing:
 * - Fetching rooms from the API
 * - Creating new rooms
 * - Updating existing rooms
 * - Deleting rooms
 * - Managing form state for add/edit operations
 * 
 * MVC PATTERN:
 * - MODEL: api.js (handles data communication)
 * - VIEW: Rooms.js (handles UI rendering)
 * - CONTROLLER: useRooms.js (this file - handles business logic)
 * 
 * ROOM DATA STRUCTURE:
 * {
 *   id: number,          - Unique identifier
 *   room_number: string, - Room number (e.g., "101", "A-201")
 *   hostel_name: string, - Name of the hostel building
 *   floor: string,       - Floor number
 *   capacity: number     - How many students can stay
 * }
 * 
 * USAGE:
 * const { rooms, loading, handleSubmit, ... } = useRooms();
 * 
 * =============================================================================
 */

// React hooks for state and lifecycle management
import { useState, useEffect } from 'react';

// Navigation hook for redirecting users
import { useNavigate } from 'react-router-dom';

// API functions for room CRUD operations
import { getRooms, createRoom, updateRoom, deleteRoom } from '../services/api';

/**
 * Custom hook for room management
 * 
 * @returns {Object} Object containing state and functions for room management
 */
export const useRooms = () => {
    // =========================================================================
    // STATE VARIABLES
    // =========================================================================
    
    // Array of rooms fetched from the API
    const [rooms, setRooms] = useState([]);
    
    // Loading state while fetching data
    const [loading, setLoading] = useState(true);
    
    // Toggle to show/hide the add/edit form
    const [showForm, setShowForm] = useState(false);
    
    // The room currently being edited (null if creating new)
    const [editingRoom, setEditingRoom] = useState(null);
    
    // Form data state with default values for all fields
    const [formData, setFormData] = useState({
        room_number: '',
        hostel_name: '',
        floor: '',
        capacity: 2  // Default capacity of 2 students per room
    });
    
    // Navigation function for redirecting
    const navigate = useNavigate();
    
    // =========================================================================
    // USEEFFECT - Initial Data Load
    // Runs once when component using this hook mounts
    // =========================================================================
    useEffect(() => {
        fetchRooms();
    }, []);  // Empty array means "run only once on mount"
    
    // =========================================================================
    // DATA FETCHING
    // =========================================================================
    
    /**
     * Fetch all rooms from the API
     * Called on component mount and after CRUD operations
     */
    const fetchRooms = async () => {
        try {
            const response = await getRooms();
            // Ensure we always set an array (defensive programming)
            setRooms(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setRooms([]);
            // Redirect to login if user is not authenticated
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/signin');
            }
        } finally {
            // Always set loading to false, whether success or error
            setLoading(false);
        }
    };
    
    // =========================================================================
    // FORM HANDLERS
    // =========================================================================
    
    /**
     * Handle form input changes
     * Updates the formData state when user types in form fields
     * 
     * Uses computed property name [e.target.name] to update the correct field
     * 
     * @param {Event} e - The input change event
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,  // Keep all existing values (spread operator)
            [e.target.name]: e.target.value  // Update only the changed field
        });
    };
    
    /**
     * Handle form submission for create/update operations
     * 
     * @param {Event} e - The form submit event
     * @param {function} showToast - Callback for toast notifications
     */
    const handleSubmit = async (e, showToast) => {
        e.preventDefault();  // Prevent default form submission (page refresh)
        
        try {
            if (editingRoom) {
                // UPDATE mode: room already exists, update it
                await updateRoom(editingRoom.id, formData);
                showToast('Room updated successfully!', 'success');
            } else {
                // CREATE mode: new room, create it
                await createRoom(formData);
                showToast('Room created successfully!', 'success');
            }
            
            // Reset form state after successful save
            setShowForm(false);
            setEditingRoom(null);
            setFormData({
                room_number: '',
                hostel_name: '',
                floor: '',
                capacity: 2
            });
            
            // Refresh the room list to show changes
            fetchRooms();
        } catch (err) {
            // Show error message from API or generic message
            showToast('Error saving room: ' + (err.response?.data?.error || 'Unknown error'), 'error');
        }
    };
    
    /**
     * Start editing a room
     * Populates the form with the room's current values
     * 
     * @param {Object} room - The room object to edit
     */
    const handleEdit = (room) => {
        setEditingRoom(room);  // Store which room we're editing
        // Populate form with room's current data
        setFormData({
            room_number: room.room_number,
            hostel_name: room.hostel_name,
            floor: room.floor || '',  // Use empty string if floor is null
            capacity: room.capacity
        });
        setShowForm(true);  // Show the form
    };
    
    /**
     * Delete a room
     * Shows confirmation dialog before deleting
     * 
     * @param {number} id - The ID of the room to delete
     * @param {function} showToast - Callback for toast notifications
     */
    const handleDelete = async (id, showToast) => {
        // Confirm before deleting (this is a destructive action)
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await deleteRoom(id);
                showToast('Room deleted successfully!', 'success');
                fetchRooms();  // Refresh the list
            } catch (err) {
                showToast('Error deleting room', 'error');
            }
        }
    };
    
    /**
     * Cancel add/edit operation
     * Resets form to initial state and hides it
     */
    const handleCancel = () => {
        setShowForm(false);
        setEditingRoom(null);
        // Reset form to default empty values
        setFormData({
            room_number: '',
            hostel_name: '',
            floor: '',
            capacity: 2
        });
    };
    
    // =========================================================================
    // RETURN VALUES
    // Return all state and functions that components need to use
    // =========================================================================
    return {
        // State values
        rooms,         // Array of room objects
        loading,       // Boolean: is data loading?
        showForm,      // Boolean: is form visible?
        editingRoom,   // Object|null: room being edited
        formData,      // Object: current form values
        
        // State setters
        setShowForm,   // Function: toggle form visibility
        
        // Event handlers
        handleChange,  // Function: handle input changes
        handleSubmit,  // Function: submit form
        handleEdit,    // Function: start editing room
        handleDelete,  // Function: delete room
        handleCancel,  // Function: cancel editing
        
        // Navigation
        navigate       // Function: navigate to routes
    };
};
