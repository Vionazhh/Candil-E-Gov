# Entity Relationship Diagram (ERD)

This document describes the entity relationships in the Candil E-Gov application. It provides a detailed overview of the database schema and can be used to create a formal Entity Relationship Diagram.

## Entity Descriptions

### Book
Represents a digital book in the library system.

| Attribute      | Type      | Description                            | Constraints      |
|----------------|-----------|----------------------------------------|-----------------|
| id             | String    | Unique identifier                      | Primary Key     |
| title          | String    | Book title                             | Not Null        |
| description    | String    | Book description                       |                 |
| coverImage     | String    | URL to book cover image                |                 |
| authorId       | String    | Reference to author                    | Foreign Key     |
| publisherId    | String    | Reference to publisher                 | Foreign Key     |
| categoryId     | String    | Reference to category                  | Foreign Key     |
| language       | String    | Book language code                     |                 |
| publishYear    | Number    | Year of publication                    |                 |
| pageCount          | Number    | Number of pages                        |                 |
| isbn           | String    | ISBN number                            |                 |
| pdfUrl        | String    | URL to book file                       |                 |
| audioUrl       | String    | URL to audiobook file (if available)   |                 |
| availability   | String    | Availability status                    |                 |
| rating         | Number    | Average rating (0-5)                   |                 |
| createdAt      | Timestamp | Creation timestamp                     | Default: now    |
| updatedAt      | Timestamp | Last update timestamp                  | Default: now    |

### Author
Represents a book author.

| Attribute      | Type      | Description                           | Constraints      |
|----------------|-----------|---------------------------------------|-----------------|
| id             | String    | Unique identifier                     | Primary Key     |
| name           | String    | Author's full name                    | Not Null        |
| biography            | String    | Author biography                      |                 |
| imageUrl          | String    | URL to author photo                   |                 |
| createdAt      | Timestamp | Creation timestamp                    | Default: now    |
| updatedAt      | Timestamp | Last update timestamp                 | Default: now    |

### Publisher
Represents a book publisher.

| Attribute      | Type      | Description                           | Constraints      |
|----------------|-----------|---------------------------------------|-----------------|
| id             | String    | Unique identifier                     | Primary Key     |
| name           | String    | Publisher name                        | Not Null        |
| description    | String    | Publisher description                 |                 |
| website        | String    | Publisher website URL                 |                 |
| location       | String    | Publisher location/address            |                 |
| createdAt      | Timestamp | Creation timestamp                    | Default: now    |
| updatedAt      | Timestamp | Last update timestamp                 | Default: now    |

### Category
Represents a book category or genre.

| Attribute      | Type      | Description                           | Constraints      |
|----------------|-----------|---------------------------------------|-----------------|
| id             | String    | Unique identifier                     | Primary Key     |
| title          | String    | Category name                         | Not Null        |
| description    | String    | Category description                  |                 |
| icon           | String    | Icon name for the category            |                 |
| featured       | Boolean   | Whether category is featured          | Default: false  |
| createdAt      | Timestamp | Creation timestamp                    | Default: now    |
| updatedAt      | Timestamp | Last update timestamp                 | Default: now    |

### User
Represents an application user.

| Attribute      | Type      | Description                           | Constraints      |
|----------------|-----------|---------------------------------------|-----------------|
| id             | String    | Unique identifier                     | Primary Key     |
| email          | String    | User email address                    | Unique, Not Null|
| displayName    | String    | User display name                     | Not Null        |
| photoURL       | String    | Profile photo URL                     |                 |
| createdAt      | Timestamp | Account creation date                 | Default: now    |
| lastLogin      | Timestamp | Last login timestamp                  |                 |

### Borrow
Represents a book borrowing record.

| Attribute      | Type      | Description                           | Constraints      |
|----------------|-----------|---------------------------------------|-----------------|
| id             | String    | Unique identifier                     | Primary Key     |
| userId         | String    | User who borrowed                     | Foreign Key     |
| bookId         | String    | Borrowed book                         | Foreign Key     |
| borrowDate     | Timestamp | Date when borrowed                    | Default: now    |
| dueDate        | Timestamp | Due date for return                   | Not Null        |
| returnDate     | Timestamp | Actual return date                    |                 |
| status         | String    | Status (active, returned, overdue)    | Default: "active"|
| createdAt      | Timestamp | Record creation timestamp             | Default: now    |
| updatedAt      | Timestamp | Last update timestamp                 | Default: now    |

## Relationships

1. **Book to Author** (Many-to-One):
   - A book belongs to one author
   - An author can have many books
   - Relationship through `authorId` field in Book entity

2. **Book to Publisher** (Many-to-One):
   - A book belongs to one publisher
   - A publisher can have many books
   - Relationship through `publisherId` field in Book entity

3. **Book to Category** (Many-to-One):
   - A book belongs to one category
   - A category can have many books
   - Relationship through `categoryId` field in Book entity

4. **User to Borrow** (One-to-Many):
   - A user can have many borrows
   - A borrow belongs to one user
   - Relationship through `userId` field in Borrow entity

## Primary and Foreign Keys

### Primary Keys:
- Book: `id`
- Author: `id`
- Publisher: `id`
- Category: `id`
- User: `id`
- Borrow: `id`

### Foreign Keys:
- Book.authorId → Author.id
- Book.publisherId → Publisher.id
- Book.categoryId → Category.id
- Borrow.userId → User.id
- Borrow.bookId → Book.id

## Cardinality

| Relationship                  | Cardinality |
|-------------------------------|-------------|
| Book to Author                | N:1         |
| Book to Publisher             | N:1         |
| Book to Category              | N:1         |
| User to Borrow                | 1:N         |
| Book to Borrow                | 1:N         |

## ERD Diagram (ASCII Representation)

```
┌──────────────┐     ┌────────────┐     ┌──────────────┐
│    Author    │◄────┤    Book    │────►│  Publisher   │
└──────────────┘ 1:N └─────┬──────┘ N:1 └──────────────┘
                        N:1│
                           │
                           │
                      ┌────▼───────┐
                      │  Category  │
                      └────────────┘
                     
                         
                             
                             
┌──────────────┐     ┌────────────┐
│     User     │────►│   Borrow   │◄─── Book
└──────────────┘  1:N└────────────┘  N:1


## Notes on Firebase Firestore Implementation

Since this application uses Firebase Firestore, a NoSQL document database, there are some implementation considerations:

1. **Document References**: Foreign key relationships are implemented as document references or direct IDs.
2. **Denormalization**: Some data might be denormalized for performance (e.g., storing author name in Book document).
3. **Subcollections**: Some relationships might be implemented as Firestore subcollections:
   - User's borrows as a subcollection of User document
4. **Composite Keys**: For ReadingProgress, the actual implementation might use a composite key of userId_bookId.

This ERD serves as a logical data model, while the actual Firestore implementation might differ in structure to optimize for specific access patterns and query performance. 