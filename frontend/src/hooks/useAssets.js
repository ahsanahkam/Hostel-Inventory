/**
 * =============================================================================
 * useAssets HOOK - Asset Management Controller
 * =============================================================================
 * 
 * PURPOSE:
 * This custom hook handles all asset-related business logic.
 * It acts as the CONTROLLER in the MVC architecture, managing:
 * - Fetching assets from the API
 * - Creating new assets
 * - Updating existing assets
 * - Deleting assets
 * - Managing form state for add/edit operations
 * 
 * MVC PATTERN:
 * - MODEL: api.js (handles data communication)
 * - VIEW: Assets.js (handles UI rendering)
 * - CONTROLLER: useAssets.js (this file - handles business logic)
 * 
 * WHY SEPARATE LOGIC INTO A HOOK?
 * 1. Keeps the View (Assets.js) clean and focused on UI
 * 2. Logic can be reused if needed elsewhere
 * 3. Easier to test and maintain
 * 4. Follows separation of concerns principle
 * 
 * USAGE:
 * const { assets, loading, handleSubmit, ... } = useAssets();
 * 
 * =============================================================================
 */

// React hooks for state and lifecycle
import { useState, useEffect } from 'react';

// Navigation hook for redirecting
import { useNavigate } from 'react-router-dom';

// API functions for asset CRUD operations
import { getAssets, createAsset, updateAsset, deleteAsset } from '../services/api';

/**
 * Custom hook for asset management
 * 
 * @returns {Object} Object containing state and functions for asset management
 */
export const useAssets = () => {
    // =========================================================================
    // STATE VARIABLES
    // =========================================================================
    
    // Array of assets fetched from the API
    const [assets, setAssets] = useState([]);
    
    // Loading state while fetching data
    const [loading, setLoading] = useState(true);
    
    // Toggle to show/hide the add/edit form
    const [showForm, setShowForm] = useState(false);
    
    // The asset currently being edited (null if creating new)
    const [editingAsset, setEditingAsset] = useState(null);
    
    // Form data state with default values
    // This object holds all the form field values
    const [formData, setFormData] = useState({
        name: '',
        asset_type: 'Bed',
        total_quantity: 1,
        condition: 'Good'
    });
    
    // Navigation function
    const navigate = useNavigate();
    
    // =========================================================================
    // DATA FETCHING
    // =========================================================================
    
    /**
     * Fetch all assets from the API
     * Called on component mount and after CRUD operations
     * 
     * @param {function} showToast - Optional callback for error notifications
     */
    const fetchAssets = async (showToast) => {
        try {
            const response = await getAssets();
            // Ensure we always set an array (defensive programming)
            setAssets(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching assets:', err);
            setAssets([]);
            // Redirect to login if authentication fails
            if (err.response?.status === 401 || err.response?.status === 403) {
                navigate('/signin');
            } else if (showToast) {
                showToast('Failed to load assets', 'error');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // =========================================================================
    // USEEFFECT - Initial Data Load
    // Runs once when component using this hook mounts
    // =========================================================================
    useEffect(() => {
        fetchAssets();
    }, []);  // Empty dependency array = run once on mount
    
    // =========================================================================
    // FORM HANDLERS
    // =========================================================================
    
    /**
     * Handle form input changes
     * Updates the formData state when user types in form fields
     * 
     * Uses computed property name [e.target.name] to update the correct field
     * Example: if name="asset_type", updates formData.asset_type
     * 
     * @param {Event} e - The input change event
     */
    const handleChange = (e) => {
        setFormData({
            ...formData,  // Keep existing values
            [e.target.name]: e.target.value  // Update changed field
        });
    };
    
    /**
     * Handle form submission for create/update
     * 
     * @param {Event} e - The form submit event
     * @param {function} showToast - Callback for toast notifications
     */
    const handleSubmit = async (e, showToast) => {
        e.preventDefault();  // Prevent page refresh
        
        try {
            if (editingAsset) {
                // UPDATE existing asset
                await updateAsset(editingAsset.id, formData);
                showToast('Asset updated successfully!');
            } else {
                // CREATE new asset
                await createAsset(formData);
                showToast('Asset created successfully!');
            }
            
            // Reset form state after successful save
            setShowForm(false);
            setEditingAsset(null);
            setFormData({
                name: '',
                asset_type: 'Bed',
                total_quantity: 1,
                condition: 'Good'
            });
            
            // Refresh the asset list
            fetchAssets(showToast);
        } catch (err) {
            showToast(err.response?.data?.error || 'Error saving asset', 'error');
        }
    };
    
    /**
     * Start editing an asset
     * Populates the form with the asset's current values
     * 
     * @param {Object} asset - The asset object to edit
     */
    const handleEdit = (asset) => {
        setEditingAsset(asset);
        // Populate form with asset data
        setFormData({
            name: asset.name,
            asset_type: asset.asset_type,
            total_quantity: asset.total_quantity,
            condition: asset.condition
        });
        setShowForm(true);  // Show the form
    };
    
    /**
     * Delete an asset
     * Shows confirmation dialog before deleting
     * 
     * @param {number} id - The ID of the asset to delete
     * @param {function} showToast - Callback for toast notifications
     */
    const handleDelete = async (id, showToast) => {
        // Confirm before deleting (destructive action)
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                await deleteAsset(id);
                showToast('Asset deleted successfully!');
                fetchAssets(showToast);  // Refresh list
            } catch (err) {
                showToast('Error deleting asset', 'error');
            }
        }
    };
    
    /**
     * Cancel add/edit operation
     * Resets form and hides it
     */
    const handleCancel = () => {
        setShowForm(false);
        setEditingAsset(null);
        // Reset form to default values
        setFormData({
            name: '',
            asset_type: 'Bed',
            total_quantity: 1,
            condition: 'Good'
        });
    };
    
    // =========================================================================
    // RETURN VALUES
    // Return all state and functions that components need
    // =========================================================================
    return {
        // State values
        assets,         // Array of asset objects
        loading,        // Boolean: is data loading?
        showForm,       // Boolean: is form visible?
        editingAsset,   // Object|null: asset being edited
        formData,       // Object: current form values
        
        // State setters
        setShowForm,    // Function: toggle form visibility
        
        // Event handlers
        handleChange,   // Function: handle input changes
        handleSubmit,   // Function: submit form
        handleEdit,     // Function: start editing asset
        handleDelete,   // Function: delete asset
        handleCancel,   // Function: cancel editing
        
        // Utilities
        fetchAssets,    // Function: refresh asset list
        navigate        // Function: navigate to routes

    };
};
