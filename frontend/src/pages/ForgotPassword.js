/**
 * =============================================================================
 * FORGOT PASSWORD PAGE - Password Reset Flow
 * =============================================================================
 * 
 * PURPOSE:
 * This page allows users to reset their password if they forgot it.
 * It uses a 3-step email verification process for security.
 * 
 * THE 3-STEP PROCESS:
 * 1. STEP 1 - Enter Email: User provides their registered email address
 * 2. STEP 2 - Enter Code: User enters the 6-digit code sent to their email
 * 3. STEP 3 - New Password: User creates a new password
 * 
 * SECURITY FEATURES:
 * - Email verification ensures only the account owner can reset
 * - 6-digit code expires after 15 minutes
 * - Minimum password length requirement
 * - Password confirmation to prevent typos
 * 
 * =============================================================================
 */

// useState hook for managing multi-step form state
import React, { useState } from 'react';

// Navigation hook for redirecting after successful reset
import { useNavigate } from 'react-router-dom';

// API functions for the password reset process
import { requestPasswordReset, verifyResetCode, resetPasswordWithCode } from '../services/api';

// Reusable UI components
import Button from '../components/Button';
import Toast from '../components/Toast';

/**
 * ForgotPassword Component
 * 
 * Multi-step form for password reset via email verification.
 * 
 * @returns {JSX.Element} The forgot password page
 */
function ForgotPassword() {
    // =========================================================================
    // STATE VARIABLES
    // =========================================================================
    
    // Current step in the reset process (1, 2, or 3)
    const [step, setStep] = useState(1);
    
    // User's email address - used across all steps
    const [email, setEmail] = useState('');
    
    // 6-digit verification code from email
    const [code, setCode] = useState('');
    
    // New password fields
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Loading state for form submissions
    const [loading, setLoading] = useState(false);
    
    // Toast notification state
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // Navigation function
    const navigate = useNavigate();
    
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
    // STEP 1: REQUEST CODE
    // Sends a verification code to the user's email
    // =========================================================================
    
    /**
     * Handle Step 1 form submission
     * Requests a reset code to be sent to the user's email
     */
    const handleRequestCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Call API to send reset code to email
            await requestPasswordReset(email);
            showToast('Reset code sent to your email!', 'success');
            // Move to Step 2
            setStep(2);
        } catch (err) {
            // Show error message from API or default message
            showToast(err.response?.data?.error || 'Failed to send reset code', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    // =========================================================================
    // STEP 2: VERIFY CODE
    // Validates the code entered by the user
    // =========================================================================
    
    /**
     * Handle Step 2 form submission
     * Verifies the reset code is valid and not expired
     */
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Call API to verify the code
            await verifyResetCode(email, code);
            showToast('Code verified! Enter your new password', 'success');
            // Move to Step 3
            setStep(3);
        } catch (err) {
            showToast(err.response?.data?.error || 'Invalid or expired code', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    // =========================================================================
    // STEP 3: RESET PASSWORD
    // Sets the new password
    // =========================================================================
    
    /**
     * Handle Step 3 form submission
     * Validates and sets the new password
     */
    const handleResetPassword = async (e) => {
        e.preventDefault();
        
        // Client-side validation: passwords must match
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        // Client-side validation: minimum password length
        if (newPassword.length < 4) {
            showToast('Password must be at least 4 characters', 'error');
            return;
        }
        
        setLoading(true);
        
        try {
            // Call API to reset the password
            await resetPasswordWithCode(email, code, newPassword);
            showToast('Password reset successfully! Redirecting to login...', 'success');
            // Redirect to login page after 2 seconds
            setTimeout(() => navigate('/signin'), 2000);
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to reset password', 'error');
        } finally {
            setLoading(false);
        }
    };
    
    // =========================================================================
    // MAIN RENDER
    // Conditionally renders based on current step
    // =========================================================================
    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '5px' }}>
            {/* Toast notification */}
            <Toast show={toast.show} message={toast.message} type={toast.type} />
            
            {/* Page title */}
            <h2>🔒 Reset Password</h2>
            
            {/* ============================================================
                STEP 1: EMAIL INPUT FORM
                User enters their email to receive a reset code
                ============================================================ */}
            {step === 1 && (
                <form onSubmit={handleRequestCode}>
                    {/* Info box explaining the process */}
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: '#0c5460' }}>
                            Enter your email address and we'll send you a 6-digit reset code.
                        </p>
                    </div>
                    
                    {/* Email input */}
                    <div style={{ marginBottom: '15px' }}>
                        <label>Email Address:</label><br />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                        />
                    </div>
                    
                    {/* Submit button */}
                    <Button variant="primary" type="submit" disabled={loading} fullWidth={true}>
                        {loading ? 'Sending...' : 'Send Reset Code'}
                    </Button>
                    
                    {/* Back to login link */}
                    <p style={{ marginTop: '15px', textAlign: 'center' }}>
                        <a href="/signin">Back to Sign In</a>
                    </p>
                </form>
            )}
            
            {/* ============================================================
                STEP 2: CODE VERIFICATION FORM
                User enters the 6-digit code from their email
                ============================================================ */}
            {step === 2 && (
                <form onSubmit={handleVerifyCode}>
                    {/* Info box showing which email received the code */}
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: '#856404' }}>
                            A 6-digit code has been sent to <strong>{email}</strong>. Enter it below.
                        </p>
                    </div>
                    
                    {/* Code input - styled for easy code entry */}
                    <div style={{ marginBottom: '15px' }}>
                        <label>Reset Code:</label><br />
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            required
                            style={{ width: '100%', padding: '10px', marginTop: '5px', fontSize: '18px', letterSpacing: '3px', textAlign: 'center' }}
                        />
                    </div>
                    
                    {/* Verify button */}
                    <Button variant="primary" type="submit" disabled={loading} fullWidth={true}>
                        {loading ? 'Verifying...' : 'Verify Code'}
                    </Button>
                    
                    {/* Option to change email if entered wrong one */}
                    <p style={{ marginTop: '15px', textAlign: 'center' }}>
                        <Button variant="secondary" onClick={() => setStep(1)}>
                            Change Email
                        </Button>
                    </p>
                </form>
            )}
            
            {/* ============================================================
                STEP 3: NEW PASSWORD FORM
                User enters and confirms their new password
                ============================================================ */}
            {step === 3 && (
                <form onSubmit={handleResetPassword}>
                    {/* Success info box */}
                    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
                        <p style={{ margin: 0, color: '#155724' }}>
                            Code verified! Enter your new password below.
                        </p>
                    </div>
                    
                    {/* New password input */}
                    <div style={{ marginBottom: '15px' }}>
                        <label>New Password:</label><br />
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password (min 4 characters)"
                            required
                            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                        />
                    </div>
                    
                    {/* Confirm password input */}
                    <div style={{ marginBottom: '15px' }}>
                        <label>Confirm Password:</label><br />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            required
                            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                        />
                    </div>
                    
                    {/* Reset button - green for positive action */}
                    <Button variant="success" type="submit" disabled={loading} fullWidth={true}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            )}
        </div>
    );
}

// Export the component
export default ForgotPassword;
