# System Flow Documentation

This document outlines the primary workflows and processes within the Candil E-Gov digital library application.

## User Workflows

### 1. Authentication Flow

**Registration Process:**
1. User accesses the registration screen
2. User provides required information (email, password, display name)
3. System validates the input data
4. System creates a new user account in Firebase Authentication
5. System creates a corresponding user document in Firestore
6. User is redirected to the home screen or onboarding flow

**Login Process:**
1. User accesses the login screen
2. User enters email and password
3. System authenticates credentials against Firebase Authentication
4. If successful, user session is created
5. User preferences and data are loaded
6. User is redirected to the home screen

### 2. Book Discovery Flow

**Browse Categories:**
1. User navigates to the Categories tab
2. System loads and displays available book categories
3. User selects a specific category
4. System queries books filtered by the selected category
5. Results are displayed with pagination

**Search Process:**
1. User enters a search term in the search bar
2. System performs a search query against book titles, categories, and descriptions
3. Results are ranked by relevance
4. Results are displayed with pagination
5. User can refine the search with additional filters (language, format, availability)
6. User can select a book to view details

### 3. Book Access Flow

**Book Borrowing:**
1. User selects a book to borrow
2. System checks book availability and user borrowing limits
3. If available, system displays a confirmation screen
4. User confirms borrowing request
5. System creates a borrow record with due date
6. System updates book availability status
7. Confirmation is displayed to the user
8. Book is added to user's library

**Book Return:**
1. User navigates to "Borrowed" tab
2. User selects a book to return
3. System displays a return confirmation
4. User confirms the return
5. System updates the borrow record with return date
6. System updates book availability status
7. Confirmation is displayed to the user
8. Book is removed from user's borrowed books

**Reading Experience:**
1. User selects a book to read from their library
2. System loads the book file (PDF)
3. System restores the user's last reading position
4. Reading progress is automatically tracked and saved
5. When user exits, the position is saved for future sessions

**Listening Experience:**
1. User selects an audiobook to listen
2. System loads the audio file and player interface
3. User listens with ability to:
   - Play/pause audio
   - Skip forward/backward
   - Adjust playback speed
   - Set sleep timer

### 4. Administrative Flow

**Book Management:**
1. Admin logs in and accesses the admin dashboard
2. Admin can:
   - Add new books (metadata and files)
   - Edit existing book details
   - Delete books from the system
   - Manage book categories
3. Changes are immediately reflected in the system

**Reporting:**
1. Admin accesses the reports section
2. Admin can view:
   - Borrowing statistics

## System Processes

### 1. Data Synchronization

1. The application maintains offline capability by:
   - Caching essential data in local storage
2. When connection is restored:
   - Local changes are synchronized with Firestore
   - Conflicts are resolved based on timestamp
   - User is notified of any synchronization issues

### 2. File Management

1. Book file upload process:
   - Admin uploads a book file (PDF)
   - System validates the file format and size
   - File is uploaded to Cloudinary
   - Reference URL is stored in the book document

## Error Handling Flows

### 1. Network Error Flow

1. System detects network connectivity issue
2. Application switches to offline mode
3. User can continue with limited functionality
4. System periodically checks for connection restoration
5. When connection is restored, sync process is initiated

### 2. Authentication Error Flow

1. System detects invalid login attempt
2. Error message is displayed to the user

### 3. Book Access Error Flow

1. User attempts to access unavailable book
2. System identifies the specific access issue:
   - Book currently borrowed by another user
   - User has reached borrowing limit
   - Permission issue
   - File corruption or missing
3. User is shown appropriate error message
4. Alternative suggestions are provided when applicable

## Integration Flows

### 1. Firebase Integration

1. Authentication:
   - User credentials are verified against Firebase Auth
   - User sessions are managed using Firebase tokens
2. Database:
   - CRUD operations are performed against Firestore
   - Real-time updates are received via Firestore listeners

### 2. Cloudinary Integration

1. Storage:
   - Book pdf files and audio file are stored in Cloudinary Storage

## Performance Optimizations

1. Data fetching:
   - Pagination for large lists
   - Lazy loading of images
   - Prefetching of likely next items
2. Caching strategy:
   - Frequently accessed data cached locally
   - Cache expiration policies
3. UI rendering:
   - Virtualized lists for smooth scrolling
   - Optimized image loading and rendering
   - Progressive web capabilities

This document provides a high-level overview of the system flows in the Candil E-Gov application. These workflows can be further illustrated with sequence diagrams, activity diagrams, and user journey maps as needed. 