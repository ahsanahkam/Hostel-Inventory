/**
 * =============================================================================
 * ROOMS PAGE - Room Management Interface
 * =============================================================================
 * 
 * PURPOSE:
 * This page provides a complete interface for managing hostel rooms.
 * Users can view, create, edit, and delete rooms in the system.
 * 
 * FEATURES:
 * - Display all rooms in a table format
 * - Add new rooms with form
 * - Edit existing room details
 * - Delete rooms
 * - Show room details including hostel name, floor, capacity, and asset count
 * 
 * MVC ARCHITECTURE:
 * - This file is the VIEW - handles only UI rendering
 * - useRooms HOOK is the CONTROLLER - handles all business logic
 * - api.js SERVICE is the MODEL - handles data communication
 * 
 * ROOM DATA STRUCTURE:
 * - room_number: Unique identifier for the room (e.g., "101", "A-205")
 * - hostel_name: Name of the hostel building (e.g., "Block A")
 * - floor: Floor number (optional)
 * - capacity: Number of students the room can accommodate
 * - asset_count: Number of assets assigned to this room (read-only)
 * 
 * =============================================================================
 */

// useState hook for local toast state
import React, { useState } from 'react';

// Custom hook containing all room management logic
import { useRooms } from '../hooks/useRooms';

// Reusable UI components
import Toast from '../components/Toast';
import Button from '../components/Button';
import FormField from '../components/FormField';

/**
 * Rooms Component
 * 
 * The main room management page.
 * Uses useRooms hook for all CRUD operations.
 * 
 * @returns {JSX.Element} The room management page
 */
function Rooms() {
    // =========================================================================
    // LOCAL STATE
    // =========================================================================
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // =========================================================================
    // CUSTOM HOOK - CONTROLLER LAYER
    // Destructure all data and functions from useRooms hook
    // =========================================================================
    const {
        rooms,          // Array of room objects from the database
        loading,        // Loading state while fetching
        showForm,       // Toggle for form visibility
        editingRoom,    // Room being edited (null if adding new)
        formData,       // Current form values
        setShowForm,    // Function to show/hide form
        handleChange,   // Form input change handler
        handleSubmit,   // Form submission handler
        handleEdit,     // Start editing a room
        handleDelete,   // Delete a room
        handleCancel,   // Cancel editing
        navigate        // Navigation function
    } = useRooms();
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    /**
     * Display a toast notification
     */
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
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
                <h1>Room Management</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                    <Button variant="success" onClick={() => showForm ? handleCancel() : setShowForm(true)}>
                        {showForm ? 'Cancel' : 'Add New Room'}
                    </Button>
                </div>
            </div>
            
            {/* ============================================================
                ADD/EDIT ROOM FORM
                ============================================================ */}
            {showForm && (
                <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
                    <h3>{editingRoom ? 'Edit Room' : 'Add New Room'}</h3>
                    <form onSubmit={(e) => handleSubmit(e, showToast)}>
                        {/* Room Number - unique identifier */}
                        <FormField
                            label="Room Number"
                            type="text"
                            name="room_number"
                            value={formData.room_number}
                            onChange={handleChange}
                            required={true}
                            placeholder="e.g., 101, A-205"
                        />
                        
                        {/* Hostel Name - which building the room is in */}
                        <FormField
                            label="Hostel Name"
                            type="text"
                            name="hostel_name"
                            value={formData.hostel_name}
                            onChange={handleChange}
                            required={true}
                            placeholder="e.g., Block A, Boys Hostel 1"
                        />
                        
                        {/* Floor - optional field */}
                        <FormField
                            label="Floor (Optional)"
                            type="number"
                            name="floor"
                            value={formData.floor}
                            onChange={handleChange}
                            placeholder="e.g., 1, 2, 3"
                        />
                        
                        {/* Student Capacity - how many students can stay */}
                        <FormField
                            label="Student Capacity"
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            min={1}
                            required={true}
                        />
                        
                        <Button type="submit" variant="primary" fullWidth={true}>
                            {editingRoom ? 'Update Room' : 'Create Room'}
                        </Button>
                    </form>
                </div>
            )}
            
            {/* ============================================================
                ROOMS TABLE
                ============================================================ */}
            <h2>All Rooms ({rooms.length})</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Room Number</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hostel Name</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Floor</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Student Capacity</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Assets Count</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Map through rooms array to create table rows */}
                    {rooms.map(room => (
                        <tr key={room.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{room.room_number}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{room.hostel_name}</td>
                            {/* Show 'N/A' if floor is not set */}
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{room.floor || 'N/A'}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{room.capacity}</td>
                            {/* asset_count is calculated by the backend */}
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{room.asset_count}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <button onClick={() => handleEdit(room)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer' }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(room.id, showToast)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Empty state message */}
            {rooms.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#6c757d' }}>
                    No rooms found. Click "Add New Room" to create one.
                </p>
            )}
        </div>
    );
}

// Export the component
export default Rooms;
