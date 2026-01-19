/**
 * =============================================================================
 * Button COMPONENT - Reusable Button UI Element
 * =============================================================================
 * 
 * PURPOSE:
 * This is a reusable button component that provides consistent styling
 * across the entire application. Instead of writing button styles everywhere,
 * we use this component to ensure all buttons look the same.
 * 
 * WHY USE A REUSABLE COMPONENT?
 * 1. Consistency: All buttons in the app look the same
 * 2. Maintainability: Change button style once, it updates everywhere
 * 3. Cleaner code: Less repetitive styling in other components
 * 
 * AVAILABLE VARIANTS (styles):
 * - 'primary' (blue)   - Main actions like "Save", "Submit"
 * - 'secondary' (gray) - Less important actions like "Cancel"
 * - 'success' (green)  - Positive actions like "Confirm", "Approve"
 * - 'danger' (red)     - Destructive actions like "Delete"
 * - 'warning' (yellow) - Caution actions
 * 
 * USAGE EXAMPLES:
 * <Button onClick={handleSave}>Save</Button>                    // Blue button
 * <Button variant="danger" onClick={handleDelete}>Delete</Button>  // Red button
 * <Button variant="success" type="submit">Submit</Button>       // Green submit
 * <Button fullWidth disabled>Loading...</Button>                // Full width, disabled
 * 
 * =============================================================================
 */

import React from 'react';

/**
 * Reusable Button component with multiple style variants
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button text/content
 * @param {function} props.onClick - Click event handler
 * @param {string} props.variant - Button style variant
 * @param {string} props.type - HTML button type ('button', 'submit', 'reset')
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.fullWidth - Whether button takes full container width
 * @returns {JSX.Element} The button element
 */
function Button({ 
    children,           // The content inside the button (text, icons, etc.)
    onClick,            // Function to call when button is clicked
    variant = 'primary', // Style variant (default: primary/blue)
    type = 'button',    // HTML button type (default: 'button', not 'submit')
    disabled = false,   // Whether button is disabled (default: not disabled)
    fullWidth = false   // Whether button spans full width (default: no)
}) {
    // =========================================================================
    // VARIANT STYLES OBJECT
    // Maps variant names to their corresponding colors
    // =========================================================================
    const variantStyles = {
        primary: { backgroundColor: '#007bff', color: 'white' },    // Blue
        secondary: { backgroundColor: '#6c757d', color: 'white' },  // Gray
        success: { backgroundColor: '#28a745', color: 'white' },    // Green
        danger: { backgroundColor: '#dc3545', color: 'white' },     // Red
        warning: { backgroundColor: '#ffc107', color: '#000' }      // Yellow (dark text)
    };
    
    // =========================================================================
    // BASE STYLE OBJECT
    // Combines fixed styles with dynamic styles based on props
    // =========================================================================
    const baseStyle = {
        // Fixed padding for all buttons
        padding: '10px 20px',
        
        // Remove default border
        border: 'none',
        
        // Rounded corners
        borderRadius: '5px',
        
        // Cursor changes based on disabled state:
        // - disabled: show "not-allowed" cursor
        // - enabled: show pointer cursor
        cursor: disabled ? 'not-allowed' : 'pointer',
        
        // Font styling
        fontSize: '14px',
        fontWeight: 'bold',
        
        // Opacity: 60% when disabled, 100% when enabled
        opacity: disabled ? 0.6 : 1,
        
        // Conditionally add full width if fullWidth prop is true
        // The spread operator (...) adds width: '100%' only if fullWidth is true
        ...(fullWidth && { width: '100%' }),
        
        // Add the variant-specific colors (background and text color)
        ...variantStyles[variant]
    };
    
    // =========================================================================
    // RENDER THE BUTTON
    // =========================================================================
    return (
        <button
            type={type}         // HTML button type
            onClick={onClick}   // Click handler
            disabled={disabled} // Disabled state
            style={baseStyle}   // Apply all styles
        >
            {/* children contains whatever is between <Button> and </Button> */}
            {children}
        </button>
    );
}

// Export the component for use in other files
export default Button;

