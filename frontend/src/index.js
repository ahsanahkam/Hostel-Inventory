/**
 * =============================================================================
 * INDEX.JS - Application Entry Point
 * =============================================================================
 * 
 * PURPOSE:
 * This is the FIRST JavaScript file that runs when the application starts.
 * It connects our React application to the HTML page (public/index.html).
 * 
 * WHAT IT DOES:
 * 1. Finds the HTML element with id="root" in public/index.html
 * 2. Creates a React "root" - the starting point for React to manage
 * 3. Renders our App component inside that root element
 * 
 * REACT.STRICTMODE:
 * - This is a development helper that doesn't affect production
 * - It helps find potential problems in your code
 * - Runs certain checks twice to detect side effects
 * 
 * THE RENDERING PROCESS:
 * Browser loads index.html → index.html loads index.js → 
 * index.js renders App.js → App.js renders the current route's page
 * 
 * =============================================================================
 */

// Import React library - needed for JSX and React features
import React from 'react';

// Import ReactDOM for rendering React components to the browser DOM
// createRoot is the React 18 way of rendering (replaces old ReactDOM.render)
import ReactDOM from 'react-dom/client';

// Import global CSS styles that apply to the entire application
// This includes things like fonts, colors, and basic layout
import './index.css';

// Import the main App component that contains all our routes and pages
import App from './App';

// Find the DOM element where React will render our application
// This element is defined in public/index.html as <div id="root"></div>
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render our React application inside the root element
// React.StrictMode is a wrapper that enables additional development checks
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
