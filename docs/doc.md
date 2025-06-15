# Candil E-Gov - Technical Documentation

## Architecture Overview

Candil E-Gov implements a modern, component-based architecture using React Native and Expo. The application follows industry best practices and design patterns to ensure maintainability, scalability, and performance.

### Architecture Principles

1. **Component-Based Architecture**: UI is composed of reusable, modular components
2. **Atomic Design Pattern**: Components are organized by complexity (atoms, molecules, organisms)
3. **Unidirectional Data Flow**: Data flows from parent to child components
4. **Service-Oriented Architecture**: Business logic is encapsulated in service classes
5. **Context-based State Management**: Global state managed through React Context

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer                           │
│   ┌─────────┐   ┌──────────┐   ┌─────────────────────┐  │
│   │  Atoms  │──▶│ Molecules│──▶│     Organisms       │  │
│   └─────────┘   └──────────┘   └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    Application Layer                    │
│   ┌─────────┐   ┌──────────┐   ┌─────────────────────┐  │
│   │ Screens │◀─▶│  Hooks   │   │     Context         │  │
│   └─────────┘   └──────────┘   └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    Service Layer                        │
│   ┌─────────┐   ┌──────────┐   ┌─────────────────────┐  │
│   │ Services│◀─▶│ Utilities│   │   Configuration     │  │
│   └─────────┘   └──────────┘   └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    Data Layer                           │
│  ┌─────────────────────┐   ┌─────────────────────────┐  │
│  │  Firebase Firestore │   │    Cloudinary Storage   │  │
│  └─────────────────────┘   └─────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Technologies
* **React Native**: Framework for building cross-platform mobile applications
* **Expo**: Development platform for React Native, simplifying builds and deployment
* **TypeScript**: Strongly-typed superset of JavaScript for improved code quality

### Navigation
* **Expo Router**: File-based routing system integrated with Expo
* **React Navigation**: Tab and stack navigation infrastructure

### State Management
* **Context API**: React's built-in state management
* **React Query**: Data fetching, caching, and state management for asynchronous data

### Backend & Data Storage
* **Firebase Authentication**: User authentication and management
* **Firebase Firestore**: NoSQL document database for app data
* **Cloudinary Storage**: File storage for books and audio assets

### UI/UX
* **Custom Component Library**: In-house component library following Atomic Design principles
* **Reanimated**: Advanced animations and transitions
* **Expo Vector Icons**: Icon library

### Development Tools
* **ESLint**: Code linting and style enforcement
* **TypeScript**: Static type checking
* **Expo Development Client**: Development environment for testing

## Project Structure

### Directory Organization

```
/app                - Screens and routes (file-based routing)
  /_layout.tsx      - Root layout configuration
  /+not-found.tsx   - 404 page
  /search.tsx       - Search screen
  /(tabs)           - Tab-based navigation screens
    /index.tsx      - Home tab screen
    /book.tsx       - Book tab screen
    /_layout.tsx    - Tab navigation layout
    /borrowings.tsx - Borrowings tab screen
    /profile.tsx    - User profile tab screen
  /auth             - Authentication screens
    /login.tsx      - Login screen
    /register.tsx   - Registration screen
  /books            - Book-related screens
    /[id].tsx       - Individual book view
    /read/          - Book reading screens
    /listen/        - Audiobook listening screens
    /category/      - Book category screens
    /borrow/        - Book borrowing screens
  /admin            - Admin screens

/components         - UI components 
  /atoms            - Basic UI components
  /molecules        - Composite components
  /organisms        - Complex UI sections
  /readers          - Book reader components
  /admin            - Admin-specific components
  /ui/              - UI components
  /screens/         - Screen-specific components
  /CustomSplashScreen.tsx - Splash screen component
  /AudioWaveform.tsx      - Audio visualization
  /PlayPauseButton.tsx    - Media control component
  /CustomInput.tsx        - Custom input component
  /CustomButton.tsx       - Custom button component
  /ReadingOptionsButton.tsx - Reading options UI
  /ReadingProgress.tsx      - Reading progress UI
  /ThemedText.tsx           - Themed text component
  /ThemedView.tsx           - Themed view component

/assets             - Application assets
  /animations/      - Animation files
  /images/          - Image assets
  /fonts/           - Font files
  /audio/           - Audio assets
  /bulk upload/     - Bulk upload assets

/config             - App configuration
  /theme.ts         - Theme configuration
  /firebase.ts      - Firebase configuration
  /app.ts           - App-wide configuration
  /navigation.ts    - Navigation configuration
  /firestore.ts     - Firestore configuration
  /reader.ts        - E-reader configuration
  /index.ts         - Configuration exports

/constants          - App constants
  /Colors.ts        - Color definitions
  /Typography.ts    - Typography styles
  /Spacing.ts       - Spacing constants
  /Layout.ts        - Layout constants
  /Search.ts        - Search-related constants

/context            - React Context providers
  /AuthContext.tsx  - Authentication context
  /ThemeContext.tsx - Theme context

/hooks              - Custom React hooks
  /useAuth.ts               - Authentication hooks
  /useBook.ts               - Book-related hooks
  /useCategories.ts         - Category hooks
  /useAuthors.ts            - Author hooks
  /useBorrows.ts            - Borrowing hooks
  /usePublishers.ts         - Publisher hooks
  /useHomeScreen.ts         - Home screen hooks
  /useFileDownload.ts       - File download hooks
  /useSearchBooks.ts        - Book search hooks
  /useBookProgress.ts       - Book progress hooks
  /useDebugFirestore.ts     - Firestore debugging
  /useLibrary.ts            - Library functions
  /useNavigationTabs.ts     - Navigation tab hooks
  /usePermissions.ts        - Permission hooks
  /useReaderSettings.ts     - Reader settings hooks
  /useReadingProgress.ts    - Reading progress hooks
  /index.ts                 - Hook exports

/providers          - App providers
  /AppProvider.tsx     - Root provider component
  /ErrorBoundary.tsx   - Error handling

/services           - API and service layer
  /BookService.ts      - Book-related operations
  /AuthorService.ts    - Author-related operations
  /BorrowService.ts    - Borrowing operations
  /BaseService.ts      - Base service class
  /CategoryService.ts  - Category operations
  /PublisherService.ts - Publisher operations
  /index.ts            - Service exports

/types              - TypeScript type definitions
  /Book.ts          - Book-related types
  /Reader.ts        - Reader-related types
  /Category.ts      - Category types
  /api/             - API-related types
  /errors/          - Error types

/utils              - Utility functions
  /validation.ts         - Form validation
  /permissions.ts        - Permission handling
  /alert.ts              - Alert utilities
  /firestoreHelper.ts    - Firestore helper functions
  /firestoreInitializer.ts - Firestore initialization
  /firestoreVerifier.ts  - Firestore verification
  /logger.ts             - Logging utilities
```

## Component Architecture

### Atomic Design Implementation

The project implements the Atomic Design pattern for organizing UI components:

1. **Atoms**: Basic, single-responsibility components like `Button`, `Text`, and `Input`
2. **Molecules**: Combinations of atoms forming simple UI patterns like `CategoryItem`, `FormField`
3. **Organisms**: Complex UI components composed of molecules and atoms like `PromoBanner`, `BookGrid`

### Component Communication

Components communicate through:
* **Props**: For parent-to-child communication
* **Context**: For global state management
* **Custom Events**: For specific cross-component communication
* **Custom Hooks**: For shared behavior and data access

## State Management

The application uses a combination of state management approaches:

1. **Local Component State**: For UI-specific state
2. **React Context**: For global application state
3. **React Query**: For server state management

### Key Contexts

* **AuthContext**: Manages user authentication state and operations
* **ThemeContext**: Handles theme preferences and switching

## Service Layer

The service layer follows a repository pattern to abstract Firestore operations:

* **BaseService**: Abstract base class providing common CRUD operations
* **Specialized Services**: (BookService, AuthorService, etc.) extending the base service

## Error Handling

The application implements a comprehensive error handling strategy:

1. **Error Boundaries**: Catch and handle React rendering errors
2. **Service Error Handling**: Standardized error handling in the service layer
3. **API Error Handling**: Consistent API error parsing and presentation
4. **Validation Errors**: Form validation with specific error messaging

## Security Considerations

1. **Authentication**: Firebase Authentication for user identity management
2. **Data Validation**: Input validation on both client and server

## Performance Optimizations

1. **Component Memoization**: Using React.memo for performance-critical components
2. **Virtualized Lists**: Implementation of FlatList for efficient rendering of large lists
3. **Image Optimization**: Proper image sizing and caching
4. **Code Splitting**: Component lazy loading where appropriate
5. **Firebase Query Optimization**: Efficient querying with proper indexing

## Build & Deployment

### Development Workflow

1. Local development with Expo Go
2. Testing on physical devices
3. Build using EAS prebuild (Expo Application Services)

### CI/CD Integration

Future improvements planned for continuous integration and deployment.

## Conclusion

The Candil E-Gov application follows a modern, maintainable architecture designed for scalability and performance. The combination of React Native, Expo, and Firebase provides a robust foundation for the digital library platform. 