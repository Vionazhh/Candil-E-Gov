# 📚 Candil E-Gov - Digital Library Application

## 🌟 Overview
Candil E-Gov is a cutting-edge digital library application designed to revolutionize how government institutions and public libraries manage and distribute digital content. Built with modern technologies, it offers a seamless, user-friendly experience for accessing e-books and digital resources.

## ✨ Core Features
- 📖 **Digital Book Repository**: Comprehensive book browsing and search
- 🔐 **Secure Authentication**: Role-based access control
- 🎧 **Multimedia Reading**: In-app PDF/EPUB reader and audiobook player
- 📅 **Smart Borrowing System**: Advanced book lending management
- 🖥️ **Admin Dashboard**: Powerful content and user management

## 🚀 Tech Stack
| Category | Technology |
|----------|------------|
| **Frontend** | React Native with Expo |
| **Navigation** | Expo Router (file-based routing) |
| **State Management** | Context API, React Query |
| **Backend** | Firebase Authentication |
| **Storage** | Cloudinary |

## 🛠 Prerequisites

### Hardware Requirements
- 💻 **Computer**:
  - Minimum 8GB RAM
  - 20GB free disk space
  - Intel i5 or equivalent processor

### Software Requirements
- 🔧 **Development Tools**:
  - Node.js (v16+)
  - npm (v8+) or Yarn
  - Git
  - Expo CLI

### Mobile Development Setup
- 🤖 **For Android**:
  - Android Studio
  - Android SDK
  - Android Virtual Device (AVD) or physical device
  
- 🍎 **For iOS**:
  - Xcode (macOS only)
  - Simulator or physical iOS device

## 📦 Installation

### 1. Clone Repository
```bash
git clone https://github.com/your-organization/candil-e-gov.git
cd candil-e-gov
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env` file with the following variables:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_AUDIO_UPLOAD_PRESET=your_audio_preset
CLOUDINARY_PDF_UPLOAD_PRESET=your_pdf_preset
```

## Project Structure
```
/app                - Screens and routes (file-based routing)
  /(tabs)           - Tab-based navigation screens
  /auth             - Authentication screens
  /books            - Book-related screens
  /admin            - Admin screens
/components         - UI components (Atomic Design)
  /atoms            - Basic UI components
  /molecules        - Composite components
  /organisms        - Complex UI sections
  /admin            - Admin-specific components
/config             - App configuration
/constants          - App constants (colors, typography)
/context            - React Context providers
/hooks              - Custom React hooks
/providers          - App providers
/services           - API and service layer
/types              - TypeScript type definitions
/utils              - Utility functions
```
## 🚀 Development

### Running the Application
```bash
# Start development server
npx expo start

# Run on specific platform
npx expo start --android / npx expo run:android
npx expo start --ios / npx expo run:ios
npx expo start --web
```

### Local APK Build (Android)

#### Prerequisites for Local Android Build
1. Install Android Studio
2. Set up Android SDK
3. Configure Android SDK Path
   - Open Android Studio
   - Go to Tools > SDK Manager
   - Install:
     - Android SDK Build-Tools
     - Android SDK Platform
     - Android SDK Platform-Tools

#### Build APK Locally
```bash
# Prebuild Project
npx expo prebuild

# Go to android folder
cd android

# build release apk for android
gradlew assembleRelease

```

### Emulator Setup

#### Android Emulator
1. Open Android Studio
2. Click "More Actions" > "Virtual Device Manager"
3. Click "Create Virtual Device"
4. Choose a device definition (e.g., Pixel 4)
5. Select a system image (recommended: latest stable Android version)
6. Complete setup and launch emulator

#### iOS Simulator (macOS only)
1. Install Xcode from App Store
2. Open Xcode
3. Go to Xcode > Preferences > Locations
4. Select Command Line Tools
5. Open Simulator from Xcode > Open Developer Tool > Simulator

## 🔍 Troubleshooting
- Ensure all environment variables are correctly set
- Check Node.js and npm versions
- Verify Android SDK and Xcode installations
- Clear npm/expo cache if encountering persistent issues

```bash
# Clear expo cache
npx expo start -c
# When u have change on root folder like package.json / app.json run for rebuild android & ios folder saving new code
npx expo prebuild --clean
```

## 📝 Notes
- Minimum supported Android version: 7.0
- Minimum supported iOS version: 13.0

## Documentation
For more detailed documentation, see the `/docs` directory:
- [Technical Documentation](./docs/doc.md)
- [System Flow](./docs/system_flow.md)

## 📄 License
Proprietary and Confidential. All rights reserved.

## 💬 Support
For support, contact: support@example.com
