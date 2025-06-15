# Environment Variables Documentation

This document outlines the environment variables used in the Candil E-Gov application. These variables should be configured in a `.env` file in the project root directory.

## Firebase Configuration

```
# Firebase Configuration (required)
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Description:

- **FIREBASE_API_KEY**: Your Firebase API key found in the Firebase Console
- **FIREBASE_AUTH_DOMAIN**: Firebase authentication domain
- **FIREBASE_PROJECT_ID**: Your Firebase project ID
- **FIREBASE_STORAGE_BUCKET**: Firebase Storage bucket URL
- **FIREBASE_MESSAGING_SENDER_ID**: Firebase messaging sender ID
- **FIREBASE_APP_ID**: Firebase application ID
- **FIREBASE_MEASUREMENT_ID**: Google Analytics measurement ID (optional)

## File Storage Configuration

```
# File Storage Configuration
CLOUDINARY_URL=https://api.cloudinary.com/v1_1/
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name  
CLOUDINARY_AUDIO_UPLOAD_PRESET=unsigned_audio_preset 
CLOUDINARY_PDF_UPLOAD_PRESET=unsigned_pdf_preset
```

### Description:

- **MAX_UPLOAD_SIZE**: Maximum file size for uploads in bytes
- **ALLOWED_FILE_TYPES**: Comma-separated list of allowed file extensions
- **DEFAULT_CACHE_SIZE**: Default cache size for offline storage in MB

## Example .env File

Below is a complete example of a `.env` file for development:

```
# Firebase Configuration
FIREBASE_API_KEY=AIasda_ExampleAPIKey
FIREBASE_AUTH_DOMAIN=candil-egov-dev.firebaseapp.com
FIREBASE_PROJECT_ID=candil-egov-dev
FIREBASE_STORAGE_BUCKET=candil-egov-dev.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abc123def456
FIREBASE_MEASUREMENT_ID=G-ABCDEF123

# Claudinary Credentials
CLOUDINARY_URL = https://api.cloudinary.com/v1_1/
CLOUDINARY_CLOUD_NAME = testing
CLOUDINARY_AUDIO_UPLOAD_PRESET = unsigned_audio_preset
CLOUDINARY_PDF_UPLOAD_PRESET = unsigned_pdf_preset
```

## Environment-Specific Configuration

It's recommended to maintain separate `.env` files for different environments:

- `.env.development` - For development environment
- `.env.staging` - For staging/testing environment
- `.env.production` - For production environment

## Security Considerations

- Never commit `.env` files to version control
- Keep API keys and sensitive credentials secure
- Use different Firebase projects for development and production
- Restrict Firebase Security Rules appropriately
- Consider using environment variable encryption for production deployments