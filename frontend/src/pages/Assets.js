/**
 * =============================================================================
 * ASSETS PAGE - Asset Management Interface
 * =============================================================================
 * 
 * PURPOSE:
 * This page provides a complete interface for managing hostel assets.
 * Users can view, create, edit, and delete assets in the inventory.
 * 
 * FEATURES:
 * - Display all assets in a table format
 * - Add new assets with form
 * - Edit existing assets
 * - Delete assets
 * - Filter and display asset conditions with color coding
 * 
 * MVC ARCHITECTURE:
 * - This file is the VIEW - handles only UI rendering
 * - useAssets HOOK is the CONTROLLER - handles all business logic
 * - api.js SERVICE is the MODEL - handles data communication
 * 
 * DATA FLOW:
 * 1. useAssets hook fetches data from API on mount
 * 2. Assets are displayed in table
 * 3. User actions (add/edit/delete) trigger hook functions
 * 4. Hook makes API calls and updates state
 * 5. Component re-renders with new data
 * 
 * =============================================================================
 */

// useState hook for local toast state
import React, { useState } from 'react';

// Custom hook containing all asset management logic
// This separates business logic from UI - following MVC pattern
import { useAssets } from '../hooks/useAssets';

// Reusable UI components for consistent styling
import Toast from '../components/Toast';
import Button from '../components/Button';
import FormField from '../components/FormField';

/**
 * Assets Component
 * 
 * The main asset management page.
 * Uses useAssets hook for all CRUD operations and state management.
 * 
 * @returns {JSX.Element} The assets management page
 */
function Assets() {
    // =========================================================================
    // LOCAL STATE
    // Toast notification - kept local as it's UI-only concern
    // =========================================================================
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // =========================================================================
    // CUSTOM HOOK - CONTROLLER LAYER
    // Destructure all data and functions from useAssets hook
    // This hook handles:
    //   - Fetching assets from API
    //   - Managing form state
    //   - Creating, updating, deleting assets
    // =========================================================================
    const {
        assets,         // Array of asset objects from the database
        loading,        // Boolean indicating if data is being fetched
        showForm,       // Boolean to show/hide the add/edit form
        editingAsset,   // The asset being edited (null if adding new)
        formData,       // Current form field values
        setShowForm,    // Function to toggle form visibility
        handleChange,   // Function to handle form input changes
        handleSubmit,   // Function to submit the form
        handleEdit,     // Function to start editing an asset
        handleDelete,   // Function to delete an asset
        handleCancel,   // Function to cancel editing
        navigate        // Function to navigate to other pages
    } = useAssets();
    
    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================
    
    /**
     * Display a toast notification
     * @param {string} message - Text to display
     * @param {string} type - 'success' or 'error' for styling
     */
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    };
    
    // =========================================================================
    // CONDITIONAL RENDER - Loading State
    // =========================================================================
    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }
    
    // =========================================================================
    // MAIN RENDER
    // =========================================================================
    return (
        <div style={{ padding: '20px' }}>
            {/* Toast notification for success/error feedback */}
            <Toast show={toast.show} message={toast.message} type={toast.type} />
            
            {/* Header section with title and action buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Asset Management</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Navigation back to dashboard */}
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                    {/* Toggle button for add/cancel form */}
                    <Button variant="success" onClick={() => showForm ? handleCancel() : setShowForm(true)}>
                        {showForm ? 'Cancel' : 'Add New Asset'}
                    </Button>
                </div>
            </div>
            
            {/* ============================================================
                ADD/EDIT ASSET FORM
                Only rendered when showForm is true
                ============================================================ */}
            {showForm && (
                <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
                    {/* Title changes based on whether editing or adding */}
                    <h3>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h3>
                    
                    {/* Form passes showToast callback to handleSubmit for feedback */}
                    <form onSubmit={(e) => handleSubmit(e, showToast)}>
                        {/* Asset Name - text input */}
                        <FormField
                            label="Asset Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required={true}
                        />
                        
                        {/* Asset Type - dropdown select with predefined options */}
                        <FormField
                            label="Asset Type"
                            type="select"
                            name="asset_type"
                            value={formData.asset_type}
                            onChange={handleChange}
                            options={[
                                { value: 'Bed', label: 'Bed' },
                                { value: 'Table', label: 'Table' },
                                { value: 'Chair', label: 'Chair' },
                                { value: 'Cupboard', label: 'Cupboard' },
                                { value: 'Fan', label: 'Fan' },
                                { value: 'Light', label: 'Light' },
                                { value: 'Other', label: 'Other' }
                            ]}
                        />
                        
                        {/* Total Quantity - number input with minimum 1 */}
                        <FormField
                            label="Total Quantity"
                            type="number"
                            name="total_quantity"
                            value={formData.total_quantity}
                            onChange={handleChange}
                            min={1}
                            required={true}
                        />
                        
                        {/* Condition - dropdown select */}
                        <FormField
                            label="Condition"
                            type="select"
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            options={[
                                { value: 'Good', label: 'Good' },
                                { value: 'Damaged', label: 'Damaged' }
                            ]}
                        />
                        
                        {/* Submit button - text changes based on mode */}
                        <Button type="submit" variant="primary" fullWidth={true}>
                            {editingAsset ? 'Update Asset' : 'Create Asset'}
                        </Button>
                    </form>
                </div>
            )}
            
            {/* ============================================================
                ASSETS TABLE
                Displays all assets in a tabular format
                ============================================================ */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    {/* Table header row - blue background */}
                    <tr style={{ backgroundColor: '#007bff', color: 'white' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Type</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Qty</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Condition</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Loop through assets array and render a row for each */}
                    {/* .map() is like a for-each loop that returns JSX */}
                    {assets.map(asset => (
                        // Key prop is required for React to track list items
                        <tr key={asset.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{asset.name}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{asset.asset_type}</td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{asset.total_quantity}</td>
                            {/* Condition cell with color-coded badge */}
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <span style={{ 
                                    padding: '5px 10px', 
                                    borderRadius: '3px',
                                    // Conditional styling: green for Good, red for Damaged
                                    backgroundColor: asset.condition === 'Good' ? '#d4edda' : '#f8d7da',
                                    color: asset.condition === 'Good' ? '#155724' : '#721c24'
                                }}>
                                    {asset.condition}
                                </span>
                            </td>
                            {/* Action buttons for each row */}
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                {/* Edit button - populates form with asset data */}
                                <button onClick={() => handleEdit(asset)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer' }}>
                                    Edit
                                </button>
                                {/* Delete button - removes asset after confirmation (if any) */}
                                <button onClick={() => handleDelete(asset.id, showToast)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Empty state message - shown when no assets exist */}
            {assets.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#6c757d' }}>
                    No assets found. Click "Add New Asset" to create one.
                </p>
            )}
        </div>
    );
}

// Export the component for use in App.js routing
export default Assets;
