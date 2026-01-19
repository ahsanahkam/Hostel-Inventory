/**
 * =============================================================================
 * APP.JS - Main Application Router
 * =============================================================================
 * 
 * PURPOSE:
 * This is the main entry point for the React application's routing.
 * It defines ALL the pages/routes that exist in our application and 
 * controls which component renders based on the URL.
 * 
 * WHAT IS ROUTING?
 * Routing allows users to navigate between different "pages" without 
 * actually reloading the browser. When you click a link, React Router 
 * changes the URL and renders the appropriate component.
 * 
 * HOW IT WORKS:
 * - BrowserRouter: Wraps our app to enable routing functionality
 * - Routes: Container for all our route definitions
 * - Route: Maps a URL path to a component
 * - Navigate: Redirects users to a different path
 * 
 * EXAMPLE:
 * When user visits "/dashboard", React Router renders the <Dashboard /> component
 * 
 * =============================================================================
 */

// React library - required for all React components
import React from 'react';

// React Router components for handling navigation
// BrowserRouter: Uses HTML5 history API for clean URLs (no # symbols)
// Routes: Groups all Route components together
// Route: Defines a single URL-to-component mapping
// Navigate: Redirects users to another route
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all page components from the pages folder
// Each page is a complete screen in our application
import SignIn from './pages/SignIn';           // Login page
import SignUp from './pages/SignUp';           // Registration page
import ForgotPassword from './pages/ForgotPassword'; // Password reset page
import Dashboard from './pages/Dashboard';     // Main dashboard with summary stats
import Assets from './pages/Assets';           // Asset management page
import Rooms from './pages/Rooms';             // Room management page
import Profile from './pages/Profile';         // User profile page
import UserManagement from './pages/UserManagement'; // Warden-only user management
import DamageTracking from './pages/DamageTracking'; // Damage reports page

/**
 * Main App Component
 * 
 * This is the root component of our application.
 * It sets up the router and defines all available routes.
 * 
 * @returns {JSX.Element} The complete application with routing
 */
function App() {
    return (
        // Router wrapper - enables routing throughout the app
        <Router>
            {/* Routes container - only one route matches at a time */}
            <Routes>
                {/* 
                 * Default route - redirects root URL to signin page
                 * When user visits http://localhost:3000/, they go to /signin
                 */}
                <Route path="/" element={<Navigate to="/signin" />} />
                
                {/* 
                 * Authentication routes - public pages anyone can access
                 */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* 
                 * Protected routes - should only be accessed when logged in
                 * Note: Authentication check is done inside each component
                 */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/damage-tracking" element={<DamageTracking />} />
                
                {/* 
                 * Admin route - only accessible by Warden role
                 * Role check is done inside the component
                 */}
                <Route path="/user-management" element={<UserManagement />} />
            </Routes>
        </Router>
    );
}

// Export the App component so index.js can use it
export default App;
