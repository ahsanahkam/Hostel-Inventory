/**
 * =============================================================================
 * DAMAGE TRACKING PAGE - Report and Manage Damaged Assets
 * =============================================================================
 * 
 * PURPOSE:
 * This page allows users to report damaged assets in hostel rooms and
 * track the status of damage reports (Not Fixed, Fixed, Replaced).
 * 
 * FEATURES:
 * - Report new damage by selecting room and asset type
 * - Add description of the damage
 * - View all damage reports in a table
 * - Update status of damage reports
 * - Delete damage reports
 * - Color-coded status badges for easy visibility
 * 
 * DATA FLOW:
 * 1. User selects a room from dropdown
 * 2. User selects the type of damaged asset
 * 3. User describes the damage
 * 4. Report is saved to database
 * 5. Report appears in the summary table
 * 6. Status can be updated as damage is fixed/replaced
 * 
 * STATUS VALUES:
 * - Not Fixed: Damage reported but not yet addressed (red)
 * - Fixed: Damage has been repaired (green)
 * - Replaced: Damaged asset was replaced with new one (blue)
 * 
 * NOTE: The "Damage Reports" count on the dashboard only shows "Not Fixed" reports.
 * 
 * =============================================================================
 */

// useState hook for local toast state
import React, { useState } from 'react';

// Custom hook containing all damage tracking logic
import { useDamageTracking } from '../hooks/useDamageTracking';

// Reusable UI components
import Toast from '../components/Toast';
import Button from '../components/Button';
import FormField from '../components/FormField';

/**
 * DamageTracking Component
 * 
 * Page for reporting and managing damage reports.
 * Uses useDamageTracking hook for all CRUD operations.
 * 
 * @returns {JSX.Element} The damage tracking page
 */
function DamageTracking() {
    // =========================================================================
    // LOCAL STATE
    // Toast notification - kept local as it's UI-only concern
    // =========================================================================
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // =========================================================================
    // CUSTOM HOOK - CONTROLLER LAYER
    // Destructure all data and functions from useDamageTracking hook
    // =========================================================================
    const {
        rooms,            // Array of rooms for dropdown selection
        damageReports,    // Array of all damage reports
        selectedRoom,     // Currently selected room ID in form
        assetType,        // Selected asset type in form
        description,      // Damage description text
        loading,          // Loading state
        ASSET_TYPES,      // Array of valid asset types for dropdown
        setSelectedRoom,  // Update selected room
        setAssetType,     // Update asset type
        setDescription,   // Update description
        handleSubmit,     // Submit new damage report
        handleStatusChange, // Update report status
        handleDelete,     // Delete a damage report
        navigate          // Navigation function
    } = useDamageTracking();
    
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
    // LOADING STATE
    // =========================================================================
    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>;
    }
    
    // =========================================================================
    // MAIN RENDER
    // =========================================================================
    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Toast notification */}
            <Toast show={toast.show} message={toast.message} type={toast.type} />
            
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>🔧 Damage Tracking</h1>
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
            
            {/* ============================================================
                NEW DAMAGE REPORT FORM
                Green themed box for creating new reports
                ============================================================ */}
            <div style={{ backgroundColor: '#d4edda', padding: '20px', borderRadius: '5px', border: '2px solid #28a745', marginBottom: '30px' }}>
                <h2 style={{ marginTop: 0 }}>Report New Damage</h2>
                <form onSubmit={(e) => handleSubmit(e, showToast)}>
                    {/* Step 1: Select Room - dropdown populated from rooms array */}
                    <FormField
                        label="1. Select Room"
                        type="select"
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        required={true}
                        options={[
                            { value: '', label: '-- Select a Room --' },
                            // Map rooms array to dropdown options
                            ...rooms.map(room => ({
                                value: room.id,
                                label: `Room ${room.room_number} - ${room.hostel_name} (Floor ${room.floor})`
                            }))
                        ]}
                    />
                    
                    {/* Step 2: Select Asset Type - predefined list from ASSET_TYPES */}
                    <FormField
                        label="2. Select Asset Type"
                        type="select"
                        value={assetType}
                        onChange={(e) => setAssetType(e.target.value)}
                        required={true}
                        options={ASSET_TYPES.map(type => ({
                            value: type,
                            label: type
                        }))}
                    />
                    
                    {/* Step 3: Describe the damage */}
                    <FormField
                        label="3. Damage Description"
                        type="textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the damage... (e.g., Broken leg, Missing screw, Cracked surface)"
                        required={true}
                    />
                    
                    {/* Submit button */}
                    <Button type="submit" variant="success" fullWidth={true}>
                        Add Damage Report
                    </Button>
                </form>
            </div>
            
            {/* ============================================================
                DAMAGE REPORTS SUMMARY TABLE
                Gray themed box showing all reports
                ============================================================ */}
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', border: '1px solid #dee2e6' }}>
                <h2 style={{ marginTop: 0 }}>Damage Reports Summary ({damageReports.length})</h2>
                
                {/* Empty state message when no reports exist */}
                {damageReports.length === 0 ? (
                    <p style={{ color: '#6c757d', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                        No damage reports yet. Add your first report above.
                    </p>
                ) : (
                    // Table with horizontal scroll for small screens
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                            <thead>
                                {/* Dark header for contrast */}
                                <tr style={{ backgroundColor: '#343a40', color: 'white' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Room</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Asset Type</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Description</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Reported On</th>
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Map through damage reports to create rows */}
                                {damageReports.map(report => (
                                    <tr key={report.id} style={{ borderBottom: '1px solid #ddd' }}>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            Room {report.room_number}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            {report.asset_type}
                                        </td>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            {report.description}
                                        </td>
                                        {/* Status column with color-coded badge */}
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            <span style={{
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                                // Dynamic background color based on status
                                                backgroundColor: 
                                                    report.status === 'Not Fixed' ? '#f8d7da' :  // Red-ish
                                                    report.status === 'Fixed' ? '#d4edda' :      // Green-ish
                                                    '#d1ecf1',                                     // Blue-ish (Replaced)
                                                // Dynamic text color based on status
                                                color:
                                                    report.status === 'Not Fixed' ? '#721c24' :
                                                    report.status === 'Fixed' ? '#155724' :
                                                    '#0c5460',
                                                fontWeight: 'bold'
                                            }}>
                                                {report.status}
                                            </span>
                                        </td>
                                        {/* Date column - formatted for readability */}
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            {/* Convert ISO date string to readable format */}
                                            {new Date(report.reported_at).toLocaleDateString()}
                                        </td>
                                        {/* Actions column - status dropdown and delete button */}
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                {/* Status change dropdown */}
                                                <select
                                                    value={report.status}
                                                    onChange={(e) => handleStatusChange(report.id, e.target.value, showToast)}
                                                    style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc', flex: 1 }}
                                                >
                                                    <option value="Not Fixed">Not Fixed</option>
                                                    <option value="Fixed">Fixed</option>
                                                    <option value="Replaced">Replaced</option>
                                                </select>
                                                {/* Delete button with trash icon */}
                                                <button
                                                    onClick={() => handleDelete(report.id, report.room_number, report.asset_type, showToast)}
                                                    style={{
                                                        padding: '5px 12px',
                                                        backgroundColor: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '3px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold'
                                                    }}
                                                    title="Delete this damage report"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// Export the component
export default DamageTracking;
