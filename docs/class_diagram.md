# Class Diagram Documentation

This document describes the key classes and their relationships in the Candil E-Gov application. This serves as a basis for creating a formal class diagram.

## Core Domain Classes

### `Book`
**Description**: Represents a digital book in the library.
**Properties**:
- `id`: string - Unique identifier
- `title`: string - Book title
- `description`: string - Book description
- `coverImage`: string - URL to cover image
- `authorId`: string - Reference to Author
- `publisherId`: string - Reference to Publisher
- `categoryId`: string - Reference to Category
- `language`: string - Book language
- `publishYear`: number - Year of publication
- `pageCount`: number - Number of pages
- `isbn`: string - ISBN number
- `pdfUrl`: string - URL to the book file
- `audioUrl`: string - URL to audiobook file (optional)
- `availability`: string - Availability status
- `rating`: number - Average rating

**Methods**:
- `isBorrowable()`: boolean - Checks if book can be borrowed

**Relationships**:
- Has one `Author`
- Has one `Publisher`
- Has one `Category`
- Has many `Borrow`

### `Author`
**Description**: Represents a book author.
**Properties**:
- `id`: string - Unique identifier
- `name`: string - Author's name
- `biography`: string - Author biography
- `imageUrl`: string - URL to author photo
- `website`: string - URL to author website

**Relationships**:
- Has many `Book`

### `Publisher`
**Description**: Represents a book publisher.
**Properties**:
- `id`: string - Unique identifier
- `name`: string - Publisher name
- `description`: string - Publisher description
- `website`: string - Publisher website
- `location`: string - Publisher location

**Relationships**:
- Has many `Book`

### `Category`
**Description**: Represents a book category.
**Properties**:
- `id`: string - Unique identifier
- `title`: string - Category name
- `description`: string - Category description
- `icon`: string - Icon name for the category
- `featured`: boolean - Whether category is featured

**Relationships**:
- Has many `Book`
- Can have one parent `Category`
- Can have many child `Category`

### `User`
**Description**: Represents an application user.
**Properties**:
- `id`: string - Unique identifier
- `email`: string - User email
- `displayName`: string - User display name
- `photoURL`: string - Profile photo URL
- `createdAt`: Date - Account creation date

**Relationships**:
- Has many `Borrow`
- Has one `ReadingProgress` per book

### `Borrow`
**Description**: Represents a book borrowing record.
**Properties**:
- `id`: string - Unique identifier
- `userId`: string - User who borrowed the book
- `bookId`: string - Borrowed book ID
- `borrowDate`: Date - Date when borrowed
- `dueDate`: Date - Due date for return
- `returnDate`: Date - Actual return date (optional)
- `status`: string - Status (active, returned, overdue)

**Relationships**:
- Belongs to one `User`
- Belongs to one `Book`

## Service Classes

### `BaseService<T>`
**Description**: Abstract base service with common CRUD operations.
**Methods**:
- `getAll(options)`: ListResponse<T> - Get all items with pagination
- `getById(id)`: T - Get item by ID
- `create(item)`: T - Create new item
- `update(id, data)`: T - Update existing item
- `delete(id)`: boolean - Delete item by ID

### `BookService`
**Description**: Service for book-related operations.
**Extends**: `BaseService<Book>`
**Methods**:
- `getAllBooks(page, pageSize)`: ListResponse<Book> - Get all books with pagination
- `getBookById(id)`: Book - Get book by ID
- `searchBooks(query, options)`: ListResponse<Book> - Search books
- `getBooksByCategory(categoryId)`: ListResponse<Book> - Get books by category
- `getBooksByAuthor(authorId)`: ListResponse<Book> - Get books by author
- `getBooksByPublisher(publisherId)`: ListResponse<Book> - Get books by publisher

### `AuthorService`
**Description**: Service for author-related operations.
**Extends**: `BaseService<Author>`
**Methods**:
- `getAllAuthors()`: ListResponse<Author> - Get all authors
- `getAuthorById(id)`: Author - Get author by ID
- `getAuthorWithBooks(id)`: Author - Get author with their books

### `BorrowService`
**Description**: Service for borrowing operations.
**Extends**: `BaseService<Borrow>`
**Methods**:
- `getUserBorrows(userId)`: ListResponse<Borrow> - Get user's borrows
- `borrowBook(userId, bookId)`: Borrow - Create a new borrow record
- `returnBook(borrowId)`: Borrow - Mark book as returned
- `extendBorrowPeriod(borrowId)`: Borrow - Extend borrow period
- `getOverdueBorrows()`: ListResponse<Borrow> - Get overdue borrows

### `PublisherService`
**Description**: Service for publisher-related operations.
**Extends**: `BaseService<Publisher>`
**Methods**:
- `getAllPublishers()`: ListResponse<Publisher> - Get all publishers
- `getPublisherById(id)`: Publisher - Get publisher by ID
- `getPublisherWithBooks(id)`: Publisher - Get publisher with their books

## Context Classes

### `AuthContext`
**Description**: Manages authentication state across the app.
**Properties**:
- `user`: User - Current authenticated user
- `isLoading`: boolean - Loading state
- `error`: Error - Authentication error

**Methods**:
- `login(email, password)`: Promise<User> - User login
- `register(email, password, data)`: Promise<User> - User registration
- `logout()`: Promise<void> - User logout
- `resetPassword(email)`: Promise<void> - Password reset

### `ThemeContext`
**Description**: Manages theme preferences.
**Properties**:
- `theme`: Theme - Current theme object
- `isDarkMode`: boolean - Dark mode flag

**Methods**:
- `toggleTheme()`: void - Toggle between light/dark mode
- `setTheme(theme)`: void - Set specific theme

## Class Relationships Diagram

```
┌─────────────┐      ┌─────────────┐
│    Book     │1    *│   Borrow    │
│             ├──────┤             │
└─────┬───┬───┘      └──────┬──────┘
      │   │                 │
      │   │                 │
1     │   │1               *│
┌─────▼───┘      1     ┌────▼─────┐
│  Author   ◄───────────┤   User   │
└───────────┘           │          │
                        └────┬─────┘
1                           │*
┌──────────┐                │
│ Publisher◄────────────────┘
└─────┬────┘
      │1
      │
      │*
┌─────▼─────┐
│  Category  │
└───────────┘
```

## Service Class Hierarchy

```
┌───────────────────┐
│  BaseService<T>   │
└─────────┬─────────┘
          │
          │
 ┌────────┴─────────────────────────────────────┐
 │                                              │
 │                                              │
┌▼───────────┐  ┌────────────┐  ┌─────────────┐ │  ┌───────────────┐
│BookService │  │AuthorService│  │BorrowService│ │  │PublisherService│
└────────────┘  └────────────┘  └─────────────┘ │  └───────────────┘
                                               ▼
```

## Context Providers Hierarchy

```
┌───────────────┐
│  AppProvider  │
└───────┬───────┘
        │
        │
┌───────▼───────┐
│ ErrorBoundary │
└───────┬───────┘
        │
        │
┌───────▼───────┐    ┌───────────────┐
│  AuthContext  │───▶│ ThemeContext  │
└───────────────┘    └───────────────┘
```

This class diagram documentation provides a solid basis for creating a formal UML class diagram. The descriptions include properties, methods, and relationships between the key classes in the Candil E-Gov application. 