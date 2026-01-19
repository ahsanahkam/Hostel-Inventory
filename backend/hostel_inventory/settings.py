"""
================================================================================
DJANGO SETTINGS - Project Configuration
================================================================================

PURPOSE:
This file contains all configuration settings for the Django project.
Django uses these settings to configure various components like:
- Database connection
- Installed apps
- Security settings
- Email configuration
- Session management
- CORS (Cross-Origin Resource Sharing)

IMPORTANT NOTES:
- In production, change DEBUG to False
- In production, change SECRET_KEY to a real secret
- In production, restrict ALLOWED_HOSTS
- Database credentials should use environment variables in production

================================================================================
"""

from pathlib import Path

# =============================================================================
# MYSQL DATABASE ADAPTER
# PyMySQL allows Django to connect to MySQL databases
# =============================================================================
import pymysql
pymysql.install_as_MySQLdb()  # Makes pymysql work as MySQLdb

# =============================================================================
# BASE DIRECTORY
# The project root directory (one level up from this file's folder)
# =============================================================================
BASE_DIR = Path(__file__).resolve().parent.parent

# =============================================================================
# SECURITY SETTINGS
# =============================================================================

# SECRET_KEY: Used for cryptographic signing (sessions, passwords, etc.)
# WARNING: Change this in production! Use a long random string.
SECRET_KEY = 'django-insecure-your-secret-key-change-this-in-production'

# DEBUG: Enable detailed error pages and logging
# WARNING: Set to False in production!
DEBUG = True

# ALLOWED_HOSTS: List of host/domain names this site can serve
# '*' allows all hosts - restrict this in production
ALLOWED_HOSTS = ['*']

# =============================================================================
# INSTALLED APPS
# List of all Django apps enabled in this project
# =============================================================================
INSTALLED_APPS = [
    # Django built-in apps (only what we need)
    'django.contrib.contenttypes',   # For content types framework
    'django.contrib.sessions',       # For session management
    'django.contrib.staticfiles',    # For serving static files
    
    # Third-party apps
    'rest_framework',                # Django REST Framework for building APIs
    'corsheaders',                   # Handle Cross-Origin requests from React
    
    # Our custom apps
    'users',                         # User authentication and management
    'assets',                        # Asset and damage report management
    'rooms',                         # Room management
    'dashboard',                     # Dashboard statistics
]

# =============================================================================
# MIDDLEWARE
# List of middleware classes that process requests/responses
# Order matters! Requests go top-to-bottom, responses bottom-to-top
# =============================================================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',        # Security headers
    'django.contrib.sessions.middleware.SessionMiddleware', # Session handling
    'corsheaders.middleware.CorsMiddleware',               # CORS headers (before CommonMiddleware!)
    'django.middleware.common.CommonMiddleware',           # Common operations
    'django.middleware.csrf.CsrfViewMiddleware',           # CSRF protection
    'django.middleware.clickjacking.XFrameOptionsMiddleware', # Clickjacking protection
]

# =============================================================================
# URL CONFIGURATION
# Points to the main URL configuration file
# =============================================================================
ROOT_URLCONF = 'hostel_inventory.urls'

# =============================================================================
# TEMPLATES (Not heavily used since we're an API-only backend)
# =============================================================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
            ],
        },
    },
]

# WSGI application path
WSGI_APPLICATION = 'hostel_inventory.wsgi.application'

# =============================================================================
# DATABASE CONFIGURATION
# Using MySQL database through Laragon
# =============================================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',  # Database backend
        'NAME': 'hostel_inventory_db',          # Database name
        'USER': 'root',                         # Database user
        'PASSWORD': '',                         # Database password (empty for Laragon default)
        'HOST': 'localhost',                    # Database host
        'PORT': '3306',                         # MySQL default port
    }
}

# =============================================================================
# PASSWORD VALIDATION
# Rules for password strength (used by Django's built-in user system)
# =============================================================================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# =============================================================================
# INTERNATIONALIZATION
# =============================================================================
LANGUAGE_CODE = 'en-us'      # Default language
TIME_ZONE = 'UTC'            # Default timezone
USE_I18N = True              # Enable internationalization
USE_TZ = True                # Use timezone-aware datetimes

# =============================================================================
# STATIC FILES (CSS, JavaScript, Images)
# =============================================================================
STATIC_URL = 'static/'       # URL prefix for static files

# Default primary key field type for models
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# =============================================================================
# DJANGO REST FRAMEWORK CONFIGURATION
# Settings for our REST API
# =============================================================================
REST_FRAMEWORK = {
    # Default permissions - AllowAny because we handle auth via sessions
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    # No DRF authentication - we use Django sessions instead
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    # Don't set a default user for unauthenticated requests
    'UNAUTHENTICATED_USER': None,
}

# =============================================================================
# CORS (Cross-Origin Resource Sharing) CONFIGURATION
# Allows the React frontend to make requests to this Django backend
# =============================================================================

# List of origins (frontend URLs) allowed to make requests
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",     # React development server
    "http://127.0.0.1:3000",
    "http://localhost:3001",     # Alternative port
    "http://127.0.0.1:3001",
]

# Allow cookies to be sent with cross-origin requests (needed for sessions)
CORS_ALLOW_CREDENTIALS = True

# Trusted origins for CSRF
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

# Allow JavaScript to access CSRF cookie
CSRF_COOKIE_HTTPONLY = False

# =============================================================================
# SESSION CONFIGURATION
# Settings for user session management
# =============================================================================

# Store sessions in the database
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# Session lifetime: 86400 seconds = 24 hours
SESSION_COOKIE_AGE = 86400

# Prevent JavaScript access to session cookie (security)
SESSION_COOKIE_HTTPONLY = True

# SameSite policy for session cookie
SESSION_COOKIE_SAMESITE = 'Lax'

# Save session on every request (keeps session alive)
SESSION_SAVE_EVERY_REQUEST = True

# =============================================================================
# EMAIL CONFIGURATION
# Settings for sending emails (password reset codes)
# Uses Gmail SMTP
# =============================================================================

# Use SMTP backend to send real emails
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Gmail SMTP server settings
EMAIL_HOST = 'smtp.gmail.com'     # Gmail SMTP server
EMAIL_PORT = 587                   # TLS port
EMAIL_USE_TLS = True              # Use TLS encryption

# Gmail credentials
# NOTE: Uses App Password, not regular Gmail password
# Generate App Password: Google Account > Security > 2FA > App Passwords
EMAIL_HOST_USER = 'preciousprotector000@gmail.com'
EMAIL_HOST_PASSWORD = 'mjmohswkpcjticva'  # This is an App Password

# Default "From" address for emails
DEFAULT_FROM_EMAIL = 'Hostel Inventory <preciousprotector000@gmail.com>'

