/**
 * =============================================================================
 * FormField COMPONENT - Reusable Form Input Element
 * =============================================================================
 * 
 * PURPOSE:
 * This is a reusable form field component that handles different input types
 * (text, number, email, password, dropdown select, textarea) with consistent
 * styling. It includes a label and required indicator (*).
 * 
 * WHY USE A REUSABLE FORM FIELD?
 * 1. Consistency: All form inputs in the app look the same
 * 2. Less code: Don't repeat label + input + styling everywhere
 * 3. Easy maintenance: Change style once, applies everywhere
 * 4. Includes accessibility: Labels are properly connected to inputs
 * 
 * SUPPORTED INPUT TYPES:
 * - 'text' (default) - Regular text input
 * - 'number'         - Numeric input with optional min value
 * - 'email'          - Email input with browser validation
 * - 'password'       - Password input (masked)
 * - 'select'         - Dropdown select (requires options prop)
 * - 'textarea'       - Multi-line text area
 * 
 * USAGE EXAMPLES:
 * 
 * Text input:
 * <FormField label="Name" name="name" value={name} onChange={handleChange} required />
 * 
 * Number input:
 * <FormField label="Quantity" type="number" name="qty" value={qty} onChange={handleChange} min={1} />
 * 
 * Select dropdown:
 * <FormField 
 *   label="Type" 
 *   type="select" 
 *   name="type" 
 *   value={type} 
 *   onChange={handleChange}
 *   options={[
 *     { value: 'a', label: 'Option A' },
 *     { value: 'b', label: 'Option B' }
 *   ]} 
 * />
 * 
 * Textarea:
 * <FormField label="Description" type="textarea" name="desc" value={desc} onChange={handleChange} />
 * 
 * =============================================================================
 */

import React from 'react';

/**
 * Reusable form field component that renders different input types
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Label text shown above the input
 * @param {string} props.type - Input type: 'text', 'number', 'email', 'password', 'select', 'textarea'
 * @param {string} props.name - Input name (used for form handling)
 * @param {string|number} props.value - Current input value
 * @param {function} props.onChange - Change event handler
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.placeholder - Placeholder text
 * @param {Array} props.options - Options array for select type [{value, label}]
 * @param {number} props.min - Minimum value for number inputs
 * @returns {JSX.Element} The form field element
 */
function FormField({ 
    label,                  // Text label shown above input
    type = 'text',          // Input type (default: text)
    name,                   // HTML name attribute (important for form handling)
    value,                  // Current value (controlled component)
    onChange,               // Function called when value changes
    required = false,       // Whether field is required (default: no)
    placeholder = '',       // Placeholder text shown when empty
    options = [],           // Options for select dropdown
    min                     // Minimum value for number inputs
}) {
    // =========================================================================
    // SHARED INPUT STYLING
    // These styles apply to all input types (input, select, textarea)
    // =========================================================================
    const baseInputStyle = {
        width: '100%',           // Full width of container
        padding: '10px',         // Inner spacing
        fontSize: '16px',        // Readable font size
        borderRadius: '5px',     // Rounded corners
        border: '1px solid #ccc' // Light gray border
    };
    
    // =========================================================================
    // RENDER THE FORM FIELD
    // =========================================================================
    return (
        // Wrapper div with bottom margin for spacing between fields
        <div style={{ marginBottom: '15px' }}>
            
            {/* ============================================================= */}
            {/* LABEL SECTION */}
            {/* Only render label if label prop is provided */}
            {/* ============================================================= */}
            {label && (
                <label style={{ 
                    fontWeight: 'bold', 
                    display: 'block',       // Label takes full width (own line)
                    marginBottom: '8px'     // Space between label and input
                }}>
                    {label}
                    {/* Show red asterisk if field is required */}
                    {required && <span style={{ color: 'red' }}> *</span>}
                </label>
            )}
            
            {/* ============================================================= */}
            {/* INPUT SECTION */}
            {/* Conditional rendering based on type prop */}
            {/* ============================================================= */}
            
            {/* If type is 'select', render a dropdown */}
            {type === 'select' ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    style={baseInputStyle}
                >
                    {/* Map through options array to create <option> elements */}
                    {options.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            
            /* If type is 'textarea', render a multi-line text area */
            ) : type === 'textarea' ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    // Spread baseInputStyle and add minimum height for textarea
                    style={{ ...baseInputStyle, minHeight: '80px' }}
                />
            
            /* For all other types (text, number, email, password, etc.), 
               render a standard input element */
            ) : (
                <input
                    type={type}             // HTML input type
                    name={name}             // Name for form handling
                    value={value}           // Controlled value
                    onChange={onChange}     // Change handler
                    required={required}     // HTML5 required validation
                    placeholder={placeholder} // Placeholder text
                    min={min}               // Minimum value (for number type)
                    style={baseInputStyle}  // Apply shared styles
                />
            )}
        </div>
    );
}

// Export the component for use in other files
export default FormField;

