/**
 * =============================================================================
 * Toast COMPONENT - Notification Display
 * =============================================================================
 * 
 * PURPOSE:
 * This is a reusable UI component for showing notification messages to users.
 * It displays a small popup (toast) in the top-right corner of the screen
 * that automatically appears when triggered and can be dismissed.
 * 
 * WHAT IS A TOAST?
 * A toast is a small message that pops up temporarily to give feedback.
 * Named after "toast" popping up from a toaster!
 * Examples: "Saved successfully!", "Error: Please try again"
 * 
 * FEATURES:
 * - Fixed position (stays in place when scrolling)
 * - Two types: success (green) and error (red)
 * - Smooth slide-in animation
 * - High z-index (appears above other content)
 * 
 * USAGE EXAMPLE:
 * <Toast show={showToast} message="Saved!" type="success" />
 * <Toast show={showToast} message="Error!" type="error" />
 * 
 * PROPS:
 * @param {boolean} show - Whether to display the toast (true/false)
 * @param {string} message - The message to display in the toast
 * @param {string} type - 'success' (green) or 'error' (red), default is 'success'
 * 
 * =============================================================================
 */

import React from 'react';

/**
 * Toast notification component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Controls visibility of toast
 * @param {string} props.message - Text to display
 * @param {string} props.type - 'success' or 'error' for styling
 * @returns {JSX.Element|null} The toast element or null if hidden
 */
function Toast({ show, message, type = 'success' }) {
    // If show is false, don't render anything (return null)
    // This is called "conditional rendering" in React
    if (!show) return null;
    
    // =========================================================================
    // RENDER THE TOAST
    // =========================================================================
    return (
        <div style={{
            // Fixed position keeps it in the same spot even when scrolling
            position: 'fixed',
            
            // Position in top-right corner
            top: '20px',
            right: '20px',
            
            // Inner spacing
            padding: '15px 20px',
            
            // Background color changes based on type:
            // - error: red (#dc3545)
            // - success: green (#28a745)
            backgroundColor: type === 'error' ? '#dc3545' : '#28a745',
            
            // White text for contrast
            color: 'white',
            
            // Rounded corners
            borderRadius: '5px',
            
            // Shadow effect for depth
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            
            // High z-index ensures toast appears above other elements
            zIndex: 1000,
            
            // Bold text
            fontWeight: 'bold',
            
            // CSS animation for smooth slide-in effect
            // Note: The 'slideIn' animation must be defined in CSS
            animation: 'slideIn 0.3s ease-out'
        }}>
            {/* Display the message text */}
            {message}
        </div>
    );
}

// Export the component so other files can import and use it
export default Toast;

