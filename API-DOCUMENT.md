# API Documentation

This document describes all backend API endpoints for the Library Management System, including HTTP methods, paths, required roles, and example request/response bodies. The system features a comprehensive CRUD operations for all entities, hybrid inventory management, financial validation, and booking/reservation functionality.

## Key Features

-   **Hybrid Inventory Management**: Combines physical book copies with online reservation limits
-   **Financial Validation**: Users must have sufficient balance to borrow books (Vietnamese VND currency)
-   **Automated Book Copy Generation**: Creating BookTitles automatically generates physical copies
-   **Pool-based Borrowing**: Users reserve book titles, not specific copies
-   **User Balance Management**: Automatic deduction and refund system
-   **Role-based Access Control**: Different permissions for USER, LIBRARIAN, and ADMIN roles
-   **Comprehensive CRUD Operations**: Full create, read, update, delete support for all entities
-   **Real-time Availability**: Dynamic calculation of book availability and reservation status
-   **Vietnamese Language Support**: Sample data and error messages in Vietnamese

---

## Hybrid Inventory Management System

The library system uses a sophisticated hybrid inventory management approach that combines physical book copies with online reservation limits.

### Key Concepts

**BookTitle**: Represents a unique book with metadata (title, author, price, etc.)

-   `totalCopies`: Total number of physical copies owned by the library
-   `maxOnlineReservations`: Maximum number of online reservations allowed simultaneously

**BookCopy**: Represents individual physical copies of a BookTitle

-   Each copy has a unique ID following the pattern: `{BookTitleId}-{number}` (e.g., BT001-001)
-   Tracks status: AVAILABLE, BORROWED, MAINTENANCE, LOST
-   Tracks condition: NEW, GOOD, WORN, DAMAGED
-   Tracks physical location in the library

### How It Works

1. **Creating Books**: When a BookTitle is created with `totalCopies: 5`, the system automatically generates 5 BookCopy entities
2. **Online Reservations**: Users can reserve books online up to the `maxOnlineReservations` limit
3. **Pool-based Borrowing**: Users reserve BookTitles, not specific copies. Librarians assign specific copies when users arrive
4. **Availability Calculation**: Available copies = Total copies - Borrowed copies - Reserved copies

### Inventory Reconciliation

The system provides endpoints to reconcile inventory discrepancies:

**POST** `/api/bookTitle/{id}/reconcile`

This ensures that BookTitle counters match actual BookCopy records and resolves any inconsistencies.

### Financial Integration

-   Each book has a `price` field in Vietnamese VND
-   Users must have sufficient balance to borrow books
-   Balance is automatically deducted when borrowing and refunded when returning
-   Penalty fees can be applied for late returns

---

## User API

### Get All Users

**GET** `/api/user`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Retrieve all users in the system
-   **Response Example:**

```json
[
    {
        "id": "U001",
        "name": "Nguyễn Văn An",
        "email": "an.nguyen@example.com",
        "role": "USER",
        "balance": 5000000,
        "cccd": "123456789012",
        "phoneNumber": "0912345678",
        "address": "123 Nguyễn Huệ, Quận 1, TP.HCM"
    },
    {
        "id": "U002",
        "name": "Trần Thị Bình",
        "email": "binh.tran@example.com",
        "role": "USER",
        "balance": 7500000,
        "cccd": "123456789013",
        "phoneNumber": "0987654321",
        "address": "456 Lê Lợi, Quận 3, TP.HCM"
    }
]
```

### Get User by ID

**GET** `/api/user/{id}`

-   **Roles:** User (self), ADMIN, LIBRARIAN
-   **Description:** Retrieve a specific user by ID
-   **Response Example:**

```json
{
    "id": "U001",
    "name": "Nguyễn Văn An",
    "email": "an.nguyen@example.com",
    "role": "USER",
    "balance": 5000000,
    "cccd": "123456789012",
    "phoneNumber": "0912345678",
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM"
}
```

### Create User

**POST** `/api/user`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Create a new user account
-   **Request Example:**

```json
{
    "name": "Lê Văn Cường",
    "email": "cuong.le@example.com",
    "password": "password123",
    "role": "USER",
    "balance": 10000000,
    "cccd": "123456789014",
    "phoneNumber": "0901234567",
    "address": "789 Võ Văn Tần, Quận 3, TP.HCM"
}
```

-   **Response Example:**

```json
{
    "id": "U003",
    "name": "Lê Văn Cường",
    "email": "cuong.le@example.com",
    "role": "USER",
    "balance": 10000000,
    "cccd": "123456789014",
    "phoneNumber": "0901234567",
    "address": "789 Võ Văn Tần, Quận 3, TP.HCM"
}
```

### Update User (Partial)

**PATCH** `/api/user/{id}`

-   **Roles:** User (self), ADMIN, LIBRARIAN
-   **Description:** Partially update user information
-   **Request Example:**

```json
{
    "email": "newemail@example.com",
    "phoneNumber": "0909876543",
    "balance": 8000000
}
```

-   **Response Example:**

```json
{
    "id": "U001",
    "name": "Nguyễn Văn An",
    "email": "newemail@example.com",
    "role": "USER",
    "balance": 8000000,
    "cccd": "123456789012",
    "phoneNumber": "0909876543",
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM"
}
```

### Delete User

**DELETE** `/api/user/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Delete a user account (only if no active reservations/transactions)
-   **Response Example:**

```json
"User deleted successfully"
```

---

## Book Title API

### Get All Book Titles

**GET** `/api/bookTitle`

-   **Description:** Retrieve all book titles with basic information
-   **Response Example:**

```json
[
    {
        "id": "BT001",
        "imageUrl": "https://example.com/effective-java.jpg",
        "title": "Effective Java",
        "isbn": "978-0134685991",
        "canBorrow": true,
        "price": 450000,
        "publishedDate": "2017-12-27",
        "publisherId": "PUB001",
        "totalCopies": 3,
        "maxOnlineReservations": 2,
        "authorIds": ["A001"],
        "categoryIds": ["CAT001"]
    },
    {
        "id": "BT002",
        "imageUrl": "https://example.com/clean-code.jpg",
        "title": "Clean Code",
        "isbn": "978-0132350884",
        "canBorrow": true,
        "price": 380000,
        "publishedDate": "2008-08-01",
        "publisherId": "PUB002",
        "totalCopies": 5,
        "maxOnlineReservations": 4,
        "authorIds": ["A002"],
        "categoryIds": ["CAT001", "CAT002"]
    }
]
```

### Get All Book Titles with Names

**GET** `/api/bookTitle/with-names`

-   **Description:** Retrieve all book titles with author and category names resolved
-   **Response Example:**

```json
[
    {
        "id": "BT001",
        "imageUrl": "https://example.com/effective-java.jpg",
        "title": "Effective Java",
        "isbn": "978-0134685991",
        "canBorrow": true,
        "price": 450000,
        "publishedDate": "2017-12-27",
        "publisherId": "PUB001",
        "totalCopies": 3,
        "maxOnlineReservations": 2,
        "authorIds": ["A001"],
        "categoryIds": ["CAT001"],
        "authorNames": ["Joshua Bloch"],
        "categoryNames": ["Lập trình Java"],
        "reviews": []
    }
]
```

### Get Book Title by ID

**GET** `/api/bookTitle/{id}`

-   **Description:** Retrieve detailed information about a specific book title
-   **Response Example:**

```json
{
    "id": "BT001",
    "imageUrl": "https://example.com/effective-java.jpg",
    "title": "Effective Java",
    "isbn": "978-0134685991",
    "canBorrow": true,
    "price": 450000,
    "publishedDate": "2017-12-27",
    "publisherId": "PUB001",
    "totalCopies": 3,
    "maxOnlineReservations": 2,
    "authorIds": ["A001"],
    "categoryIds": ["CAT001"],
    "authorNames": ["Joshua Bloch"],
    "categoryNames": ["Lập trình Java"],
    "reviews": [
        {
            "id": "R001",
            "date": "2025-05-30",
            "comment": "Cuốn sách tuyệt vời cho lập trình viên Java!",
            "star": 5,
            "bookTitleId": "BT001",
            "userId": "U001"
        }
    ]
}
```

### Get Book Title with Availability

**GET** `/api/bookTitle/{id}/availability`

-   **Description:** Get book title with real-time availability information (for authenticated users)
-   **Query Parameters:**
    -   `currentUserId` (string): ID of the current user (optional)
    -   `isUserRole` (boolean): Whether the user has USER role (optional)
-   **Response Example:**

```json
{
    "id": "BT001",
    "imageUrl": "https://example.com/effective-java.jpg",
    "title": "Effective Java",
    "isbn": "978-0134685991",
    "canBorrow": true,
    "price": 450000,
    "publishedDate": "2017-12-27",
    "publisherId": "PUB001",
    "totalCopies": 3,
    "maxOnlineReservations": 2,
    "authorIds": ["A001"],
    "categoryIds": ["CAT001"],
    "authorNames": ["Joshua Bloch"],
    "categoryNames": ["Lập trình Java"],
    "reviews": [],
    "availableCopies": 2,
    "onlineReservations": 1,
    "userReservationsForThisBook": 0,
    "maxUserReservations": 5
}
```

### Create Book Title

**POST** `/api/bookTitle`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Create a new book title and automatically generate book copies
-   **Business Logic:**
    -   Automatically generates `totalCopies` number of BookCopy entities
    -   Each BookCopy gets a human-readable ID (e.g., BT001-001, BT001-002)
    -   Sets default location based on category and shelf allocation
    -   Validates `maxOnlineReservations` <= `totalCopies`
    -   Price must be in Vietnamese VND (integer format)
-   **Request Example:**

```json
{
    "imageUrl": "https://example.com/spring-boot.jpg",
    "title": "Spring Boot in Action",
    "isbn": "978-1617292545",
    "canBorrow": true,
    "price": 520000,
    "publishedDate": "2015-12-15",
    "publisherId": "PUB003",
    "totalCopies": 4,
    "maxOnlineReservations": 3,
    "authorIds": ["A003"],
    "categoryIds": ["CAT001", "CAT003"]
}
```

-   **Response Example:**

```json
{
    "id": "BT003",
    "imageUrl": "https://example.com/spring-boot.jpg",
    "title": "Spring Boot in Action",
    "isbn": "978-1617292545",
    "canBorrow": true,
    "price": 520000,
    "publishedDate": "2015-12-15",
    "publisherId": "PUB003",
    "totalCopies": 4,
    "maxOnlineReservations": 3,
    "authorIds": ["A003"],
    "categoryIds": ["CAT001", "CAT003"]
}
```

-   **Note:** This operation also creates 4 BookCopy entities with IDs: BT003-001, BT003-002, BT003-003, BT003-004

### Update Book Title

**PUT** `/api/bookTitle/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Update book title information and automatically adjust book copies if totalCopies changed
-   **Business Logic:**
    -   If `totalCopies` increases: automatically creates new BookCopy entities
    -   If `totalCopies` decreases: removes excess BookCopy entities (only if not borrowed/reserved)
    -   Updates inventory counters and reconciles with actual copies
    -   Validates `maxOnlineReservations` <= `totalCopies`
    -   Price updates affect future transactions only
-   **Request Example:**

```json
{
    "imageUrl": "https://example.com/spring-boot-updated.jpg",
    "title": "Spring Boot in Action (2nd Edition)",
    "isbn": "978-1617292545",
    "canBorrow": true,
    "price": 580000,
    "publishedDate": "2015-12-15",
    "publisherId": "PUB003",
    "totalCopies": 6,
    "maxOnlineReservations": 4,
    "authorIds": ["A003"],
    "categoryIds": ["CAT001", "CAT003"]
}
```

-   **Response Example:**

```json
{
    "id": "BT003",
    "imageUrl": "https://example.com/spring-boot-updated.jpg",
    "title": "Spring Boot in Action (2nd Edition)",
    "isbn": "978-1617292545",
    "canBorrow": true,
    "price": 580000,
    "publishedDate": "2015-12-15",
    "publisherId": "PUB003",
    "totalCopies": 6,
    "maxOnlineReservations": 4,
    "authorIds": ["A003"],
    "categoryIds": ["CAT001", "CAT003"]
}
```

-   **Note:** This operation creates 2 additional BookCopy entities: BT003-005, BT003-006

### Delete Book Title

**DELETE** `/api/bookTitle/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Delete a book title (only if no copies are borrowed or reserved)
-   **Response Example:**

```json
"Book title deleted successfully"
```

### Reconcile Inventory

**POST** `/api/bookTitle/{id}/reconcile`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Reconcile inventory between BookTitle counters and actual BookCopy records
-   **Response Example:**

```json
{
    "bookTitleId": "BT001",
    "actualCopies": 3,
    "recordedCopies": 3,
    "availableCopies": 2,
    "pendingReservations": 1,
    "status": "RECONCILED"
}
```

### Check Availability

**GET** `/api/bookTitle/{id}/check-availability`

-   **Description:** Check detailed availability information for a book title
-   **Response Example:**

```json
{
    "bookTitleId": "BT001",
    "totalCopies": 3,
    "availableCopies": 2,
    "pendingReservations": 1,
    "maxOnlineReservations": 2,
    "canReserve": true,
    "reservationStatus": "AVAILABLE"
}
```

---

## Review API

### Get All Reviews

**GET** `/api/review`

-   **Description:** Retrieve all reviews in the system
-   **Response Example:**

```json
[
    {
        "id": "R001",
        "date": "2025-05-30",
        "comment": "Cuốn sách tuyệt vời cho lập trình viên Java!",
        "star": 5,
        "bookTitleId": "BT001",
        "userId": "U001"
    },
    {
        "id": "R002",
        "date": "2025-05-28",
        "comment": "Rất hữu ích cho việc viết code sạch.",
        "star": 4,
        "bookTitleId": "BT002",
        "userId": "U002"
    }
]
```

### Get Review by ID

**GET** `/api/review/{id}`

-   **Description:** Retrieve detailed information about a specific review
-   **Response Example:**

```json
{
    "id": "R001",
    "date": "2025-05-30",
    "comment": "Cuốn sách tuyệt vời cho lập trình viên Java!",
    "star": 5,
    "bookTitleId": "BT001",
    "userId": "U001"
}
```

### Create Review

**POST** `/api/review`

-   **Roles:** ADMIN, LIBRARIAN, USER
-   **Description:** Create a new review for a book
-   **Request Example:**

```json
{
    "bookTitleId": "BT001",
    "star": 4,
    "comment": "Cuốn sách rất hữu ích cho developer Java."
}
```

-   **Response Example:**

```json
{
    "id": "R003",
    "date": "2025-06-02",
    "comment": "Cuốn sách rất hữu ích cho developer Java.",
    "star": 4,
    "bookTitleId": "BT001",
    "userId": "U001"
}
```

### Update Review

**PUT** `/api/review/{id}`

-   **Roles:** ADMIN, LIBRARIAN, USER (own reviews only)
-   **Description:** Update review information
-   **Request Example:**

```json
{
    "star": 5,
    "comment": "Thay đổi ý kiến - cuốn sách xuất sắc!"
}
```

-   **Response Example:**

```json
{
    "id": "R003",
    "date": "2025-06-02",
    "comment": "Thay đổi ý kiến - cuốn sách xuất sắc!",
    "star": 5,
    "bookTitleId": "BT001",
    "userId": "U001"
}
```

### Delete Review

**DELETE** `/api/review/{id}`

-   **Roles:** ADMIN, LIBRARIAN, USER (own reviews only)
-   **Description:** Delete a review
-   **Response Example:**

```json
"Review deleted successfully"
```

---

## Reservation API

### Get All Reservations

**GET** `/api/reservation`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Retrieve all reservations in the system
-   **Response Example:**

```json
[
    {
        "id": "RES001",
        "userId": "U001",
        "bookTitleId": "BT001",
        "bookCopyId": null,
        "status": "PENDING",
        "reservationDate": "2025-06-01T10:00:00",
        "expirationDate": "2025-06-08T10:00:00",
        "deposit": 450000,
        "bookTitle": "Effective Java",
        "userName": "Nguyễn Văn An",
        "authorNames": ["Joshua Bloch"],
        "categoryNames": ["Lập trình Java"],
        "availableCopies": 2,
        "totalCopies": 3
    },
    {
        "id": "RES002",
        "userId": "U002",
        "bookTitleId": "BT002",
        "bookCopyId": "BC005",
        "status": "READY_FOR_PICKUP",
        "reservationDate": "2025-06-01T14:30:00",
        "expirationDate": "2025-06-08T14:30:00",
        "deposit": 380000,
        "bookTitle": "Clean Code",
        "userName": "Trần Thị Bình",
        "authorNames": ["Robert C. Martin"],
        "categoryNames": ["Lập trình", "Kỹ thuật phần mềm"],
        "availableCopies": 3,
        "totalCopies": 5
    }
]
```

### Get User's Reservations

**GET** `/api/reservation/my`

-   **Roles:** USER
-   **Description:** Get all reservations for the authenticated user
-   **Response Example:**

```json
[
    {
        "id": "RES001",
        "userId": "U001",
        "bookTitleId": "BT001",
        "bookCopyId": null,
        "status": "PENDING",
        "reservationDate": "2025-06-01T10:00:00",
        "expirationDate": "2025-06-08T10:00:00",
        "deposit": 450000,
        "bookTitle": "Effective Java",
        "userName": "Nguyễn Văn An",
        "authorNames": ["Joshua Bloch"],
        "categoryNames": ["Lập trình Java"],
        "availableCopies": 2,
        "totalCopies": 3
    }
]
```

### Get Reservation by ID

**GET** `/api/reservation/{id}`

-   **Roles:** ADMIN, LIBRARIAN, USER (own reservations only)
-   **Description:** Retrieve detailed information about a specific reservation
-   **Response Example:**

```json
{
    "id": "RES001",
    "userId": "U001",
    "bookTitleId": "BT001",
    "bookCopyId": null,
    "status": "PENDING",
    "reservationDate": "2025-06-01T10:00:00",
    "expirationDate": "2025-06-08T10:00:00",
    "deposit": 450000,
    "bookTitle": "Effective Java",
    "userName": "Nguyễn Văn An",
    "authorNames": ["Joshua Bloch"],
    "categoryNames": ["Lập trình Java"],
    "availableCopies": 2,
    "totalCopies": 3
}
```

### Create Reservation

**POST** `/api/reservation`

-   **Roles:** USER
-   **Description:** Create a new reservation using the pool-based system
-   **Business Logic:**
    -   Automatically sets expiration date to 1 week from creation
    -   Sets deposit amount equal to book price
    -   Checks maxOnlineReservations limit
    -   Users cannot set their own expiration dates or deposits (security)
    -   Validates user hasn't exceeded personal reservation limits
-   **Request Example:**

```json
{
    "bookTitleId": "BT001"
}
```

-   **Response Example (Success):**

```json
{
    "id": "RES003",
    "userId": "U001",
    "bookTitleId": "BT001",
    "bookCopyId": null,
    "status": "PENDING",
    "reservationDate": "2025-06-02T09:15:00",
    "expirationDate": "2025-06-09T09:15:00",
    "deposit": 450000,
    "bookTitle": "Effective Java",
    "userName": "Nguyễn Văn An",
    "authorNames": ["Joshua Bloch"],
    "categoryNames": ["Lập trình Java"],
    "availableCopies": 1,
    "totalCopies": 3
}
```

-   **Response Example (Reservation Limit Exceeded):**

```json
{
    "error": "Số lượng đặt chỗ trực tuyến đã đạt giới hạn cho cuốn sách này"
}
```

### Assign Book Copy to Reservation

**POST** `/api/reservation/{id}/assign-copy`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Assign a specific book copy to a pending reservation (when user comes to pick up)
-   **Response Example:**

```json
{
    "id": "RES001",
    "userId": "U001",
    "bookTitleId": "BT001",
    "bookCopyId": "BC001",
    "status": "READY_FOR_PICKUP",
    "reservationDate": "2025-06-01T10:00:00",
    "expirationDate": "2025-06-08T10:00:00",
    "deposit": 450000,
    "bookTitle": "Effective Java",
    "userName": "Nguyễn Văn An",
    "authorNames": ["Joshua Bloch"],
    "categoryNames": ["Lập trình Java"],
    "availableCopies": 2,
    "totalCopies": 3
}
```

### Update Reservation Status

**PUT** `/api/reservation/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Update reservation status (approve, reject, complete, etc.)
-   **Request Example:**

```json
{
    "status": "COMPLETED"
}
```

-   **Response Example:**

```json
{
    "id": "RES001",
    "userId": "U001",
    "bookTitleId": "BT001",
    "bookCopyId": "BC001",
    "status": "COMPLETED",
    "reservationDate": "2025-06-01T10:00:00",
    "expirationDate": "2025-06-08T10:00:00",
    "deposit": 450000,
    "bookTitle": "Effective Java",
    "userName": "Nguyễn Văn An",
    "authorNames": ["Joshua Bloch"],
    "categoryNames": ["Lập trình Java"],
    "availableCopies": 3,
    "totalCopies": 3
}
```

### Partial Update Reservation

**PATCH** `/api/reservation/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Partially update reservation information
-   **Request Example:**

```json
{
    "status": "CANCELLED"
}
```

-   **Response Example:**

```json
{
    "id": "RES001",
    "userId": "U001",
    "bookTitleId": "BT001",
    "bookCopyId": null,
    "status": "CANCELLED",
    "reservationDate": "2025-06-01T10:00:00",
    "expirationDate": "2025-06-08T10:00:00",
    "deposit": 0,
    "bookTitle": "Effective Java",
    "userName": "Nguyễn Văn An",
    "authorNames": ["Joshua Bloch"],
    "categoryNames": ["Lập trình Java"],
    "availableCopies": 3,
    "totalCopies": 3
}
```

### Delete Reservation

**DELETE** `/api/reservation/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Delete a reservation (refunds deposit if applicable)
-   **Response Example:**

```json
"Reservation deleted successfully"
```

---

## Publisher API

### Get All Publishers

**GET** `/api/publisher`

-   **Description:** Retrieve all publishers in the system
-   **Response Example:**

```json
[
    {
        "id": "PUB001",
        "name": "Addison-Wesley"
    },
    {
        "id": "PUB002",
        "name": "O'Reilly Media"
    },
    {
        "id": "PUB003",
        "name": "Manning Publications"
    }
]
```

### Get Publisher by ID

**GET** `/api/publisher/{id}`

-   **Description:** Retrieve detailed information about a specific publisher
-   **Response Example:**

```json
{
    "id": "PUB001",
    "name": "Addison-Wesley"
}
```

### Create Publisher

**POST** `/api/publisher`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Create a new publisher
-   **Request Example:**

```json
{
    "name": "Packt Publishing"
}
```

-   **Response Example:**

```json
{
    "id": "PUB004",
    "name": "Packt Publishing"
}
```

### Update Publisher

**PUT** `/api/publisher/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Update publisher information
-   **Request Example:**

```json
{
    "name": "O'Reilly Media (Updated)"
}
```

-   **Response Example:**

```json
{
    "id": "PUB002",
    "name": "O'Reilly Media (Updated)"
}
```

### Delete Publisher

**DELETE** `/api/publisher/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Delete a publisher (only if no books are associated)
-   **Response Example:**

```json
"Publisher deleted successfully"
```

---

## Category API

### Get All Categories

**GET** `/api/category`

-   **Description:** Retrieve all categories in the system
-   **Response Example:**

```json
[
    {
        "id": "CAT001",
        "name": "Lập trình Java"
    },
    {
        "id": "CAT002",
        "name": "Kỹ thuật phần mềm"
    },
    {
        "id": "CAT003",
        "name": "Spring Framework"
    }
]
```

### Get Category by ID

**GET** `/api/category/{id}`

-   **Description:** Retrieve detailed information about a specific category
-   **Response Example:**

```json
{
    "id": "CAT001",
    "name": "Lập trình Java"
}
```

### Create Category

**POST** `/api/category`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Create a new category
-   **Request Example:**

```json
{
    "name": "Cơ sở dữ liệu"
}
```

-   **Response Example:**

```json
{
    "id": "CAT004",
    "name": "Cơ sở dữ liệu"
}
```

### Update Category

**PUT** `/api/category/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Update category information
-   **Request Example:**

```json
{
    "name": "Cơ sở dữ liệu (Nâng cao)"
}
```

-   **Response Example:**

```json
{
    "id": "CAT004",
    "name": "Cơ sở dữ liệu (Nâng cao)"
}
```

### Delete Category

**DELETE** `/api/category/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Delete a category (only if no books are associated)
-   **Response Example:**

```json
"Category deleted successfully"
```

---

## Book Copy API

### Get All Book Copies

**GET** `/api/bookCopy`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Retrieve all book copies in the system
-   **Response Example:**

```json
[
    {
        "id": "BC001",
        "bookTitleId": "BT001",
        "status": "AVAILABLE",
        "condition": "GOOD",
        "location": "A1-001",
        "bookCopyIds": ["BC001"]
    },
    {
        "id": "BC002",
        "bookTitleId": "BT001",
        "status": "BORROWED",
        "condition": "GOOD",
        "location": "A1-002",
        "bookCopyIds": ["BC002"]
    }
]
```

### Get Book Copy by ID

**GET** `/api/bookCopy/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Retrieve detailed information about a specific book copy
-   **Response Example:**

```json
{
    "id": "BC001",
    "bookTitleId": "BT001",
    "status": "AVAILABLE",
    "condition": "GOOD",
    "location": "A1-001",
    "bookCopyIds": ["BC001"]
}
```

### Create Book Copy

**POST** `/api/bookCopy`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Create a new book copy (manual creation, usually done automatically via BookTitle)
-   **Request Example:**

```json
{
    "bookTitleId": "BT001",
    "condition": "NEW",
    "location": "A1-004"
}
```

-   **Response Example:**

```json
{
    "id": "BC004",
    "bookTitleId": "BT001",
    "status": "AVAILABLE",
    "condition": "NEW",
    "location": "A1-004",
    "bookCopyIds": ["BC004"]
}
```

### Update Book Copy

**PUT** `/api/bookCopy/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Update book copy information
-   **Request Example:**

```json
{
    "status": "MAINTENANCE",
    "condition": "WORN",
    "location": "MAINTENANCE-ROOM"
}
```

-   **Response Example:**

```json
{
    "id": "BC001",
    "bookTitleId": "BT001",
    "status": "MAINTENANCE",
    "condition": "WORN",
    "location": "MAINTENANCE-ROOM",
    "bookCopyIds": ["BC001"]
}
```

### Delete Book Copy

**DELETE** `/api/bookCopy/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Delete a book copy (only if not borrowed or reserved)
-   **Response Example:**

```json
"Book copy deleted successfully"
```

---

## Transaction API

### Get All Transactions

**GET** `/api/transaction`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Retrieve all transactions in the system
-   **Response Example:**

```json
[
    {
        "id": "TXN001",
        "userId": "U001",
        "librarianId": "L001",
        "issueDate": "2025-06-01T10:00:00",
        "dueDate": "2025-06-15T10:00:00",
        "returnDate": null,
        "status": "BORROWED",
        "totalFee": 450000,
        "penaltyFee": 0,
        "note": "Borrowed via reservation RES001"
    },
    {
        "id": "TXN002",
        "userId": "U002",
        "librarianId": "L001",
        "issueDate": "2025-05-20T14:30:00",
        "dueDate": "2025-06-03T14:30:00",
        "returnDate": "2025-06-01T09:15:00",
        "status": "RETURNED",
        "totalFee": 380000,
        "penaltyFee": 0,
        "note": "Returned on time"
    }
]
```

### Get User's Transactions

**GET** `/api/transaction/my`

-   **Roles:** USER
-   **Description:** Get all transactions for the authenticated user
-   **Response Example:**

```json
[
    {
        "id": "TXN001",
        "userId": "U001",
        "librarianId": "L001",
        "issueDate": "2025-06-01T10:00:00",
        "dueDate": "2025-06-15T10:00:00",
        "returnDate": null,
        "status": "BORROWED",
        "totalFee": 450000,
        "penaltyFee": 0,
        "note": "Borrowed via reservation RES001"
    }
]
```

### Get Transaction by ID

**GET** `/api/transaction/{id}`

-   **Roles:** ADMIN, LIBRARIAN, USER (own transactions only)
-   **Description:** Retrieve detailed information about a specific transaction
-   **Response Example:**

```json
{
    "id": "TXN001",
    "userId": "U001",
    "librarianId": "L001",
    "issueDate": "2025-06-01T10:00:00",
    "dueDate": "2025-06-15T10:00:00",
    "returnDate": null,
    "status": "BORROWED",
    "totalFee": 450000,
    "penaltyFee": 0,
    "note": "Borrowed via reservation RES001"
}
```

### Create Transaction

**POST** `/api/transaction`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Create a new transaction (borrow books) with automatic balance validation and deduction
-   **Business Logic:**
    -   Validates user has sufficient balance (total book prices)
    -   Automatically deducts total cost from user balance
    -   Updates book copy status to "BORROWED"
    -   Creates transaction details for each book copy
    -   Returns error if insufficient balance with Vietnamese formatting
-   **Request Example:**

```json
{
    "userId": "U001",
    "bookCopyIds": ["BC001", "BC005"],
    "note": "Borrowed multiple books"
}
```

-   **Response Example (Success):**

```json
{
    "id": "TXN003",
    "userId": "U001",
    "librarianId": "L001",
    "issueDate": "2025-06-02T11:30:00",
    "dueDate": "2025-06-16T11:30:00",
    "returnDate": null,
    "status": "BORROWED",
    "totalFee": 830000,
    "penaltyFee": 0,
    "note": "Borrowed multiple books"
}
```

-   **Response Example (Insufficient Balance):**

```json
{
    "error": "Số dư không đủ. Số dư hiện tại: 400,000 VND, cần: 830,000 VND"
}
```

### Update Transaction

**PUT** `/api/transaction/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Update transaction information (e.g., return books, apply penalties) with automatic balance refund
-   **Business Logic:**
    -   When status changes to "RETURNED", refunds total fee to user balance
    -   Updates book copy status back to "AVAILABLE"
    -   Handles penalty fee calculations
    -   Automatic balance management ensures financial integrity
-   **Request Example:**

```json
{
    "status": "RETURNED",
    "returnDate": "2025-06-10T15:00:00",
    "penaltyFee": 0,
    "note": "Returned all books on time"
}
```

-   **Response Example:**

```json
{
    "id": "TXN001",
    "userId": "U001",
    "librarianId": "L001",
    "issueDate": "2025-06-01T10:00:00",
    "dueDate": "2025-06-15T10:00:00",
    "returnDate": "2025-06-10T15:00:00",
    "status": "RETURNED",
    "totalFee": 450000,
    "penaltyFee": 0,
    "note": "Returned all books on time"
}
```

## Transaction Detail API

### Get All Transaction Details

**GET** `/api/transactionDetail`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
[
    {
        "transactionId": "t1",
        "bookCopyId": "bc1",
        "returnedDate": "2025-05-30",
        "penaltyFee": 0
    }
]
```

### Get Transaction Detail by ID

**GET** `/api/transactionDetail/{transactionId}/{bookCopyId}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
{
    "transactionId": "t1",
    "bookCopyId": "bc1",
    "returnedDate": "2025-05-30",
    "penaltyFee": 0
}
```

### Create Transaction Detail

**POST** `/api/transactionDetail`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "transactionId": "t1",
    "bookCopyId": "bc1",
    "returnedDate": "2025-05-30",
    "penaltyFee": 0
}
```

-   **Response Example:**

```json
{
    "transactionId": "t1",
    "bookCopyId": "bc1",
    "returnedDate": "2025-05-30",
    "penaltyFee": 0
}
```

### Update Transaction Detail

**PUT** `/api/transactionDetail/{transactionId}/{bookCopyId}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "returnedDate": "2025-06-01",
    "penaltyFee": 10
}
```

-   **Response Example:**

```json
{
    "transactionId": "t1",
    "bookCopyId": "bc1",
    "returnedDate": "2025-06-01",
    "penaltyFee": 10
}
```

### Delete Transaction Detail

**DELETE** `/api/transactionDetail/{transactionId}/{bookCopyId}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
"Transaction detail deleted successfully"
```

---

## Author API

### Get All Authors

**GET** `/api/author`

-   **Description:** Retrieve all authors in the system
-   **Response Example:**

```json
[
    {
        "id": "A001",
        "name": "Joshua Bloch",
        "bio": "Nhà thiết kế ngôn ngữ Java và tác giả của nhiều API quan trọng",
        "birthday": "1961-08-28"
    },
    {
        "id": "A002",
        "name": "Robert C. Martin",
        "bio": "Kỹ sư phần mềm nổi tiếng với biệt danh Uncle Bob",
        "birthday": "1952-12-05"
    }
]
```

### Get All Authors with Book Information

**GET** `/api/author/with-books`

-   **Description:** Retrieve all authors with their book information
-   **Response Example:**

```json
[
    {
        "id": "A001",
        "name": "Joshua Bloch",
        "bio": "Nhà thiết kế ngôn ngữ Java và tác giả của nhiều API quan trọng",
        "birthday": "1961-08-28",
        "bookIds": ["BT001", "BT004"],
        "bookTitles": ["Effective Java", "Java Concurrency in Practice"],
        "bookImageUrls": [
            "https://example.com/effective-java.jpg",
            "https://example.com/java-concurrency.jpg"
        ],
        "publisherInformation": [
            {
                "bookId": "BT001",
                "publisherId": "PUB001",
                "publisherName": "Addison-Wesley"
            },
            {
                "bookId": "BT004",
                "publisherId": "PUB001",
                "publisherName": "Addison-Wesley"
            }
        ]
    }
]
```

### Get Author by ID

**GET** `/api/author/{id}`

-   **Description:** Retrieve detailed information about a specific author
-   **Response Example:**

```json
{
    "id": "A001",
    "name": "Joshua Bloch",
    "bio": "Nhà thiết kế ngôn ngữ Java và tác giả của nhiều API quan trọng",
    "birthday": "1961-08-28"
}
```

### Get Author with Book Information

**GET** `/api/author/{id}/with-books`

-   **Description:** Get author with detailed book information
-   **Response Example:**

```json
{
    "id": "A001",
    "name": "Joshua Bloch",
    "bio": "Nhà thiết kế ngôn ngữ Java và tác giả của nhiều API quan trọng",
    "birthday": "1961-08-28",
    "bookIds": ["BT001", "BT004"],
    "bookTitles": ["Effective Java", "Java Concurrency in Practice"],
    "bookImageUrls": [
        "https://example.com/effective-java.jpg",
        "https://example.com/java-concurrency.jpg"
    ],
    "publisherInformation": [
        {
            "bookId": "BT001",
            "publisherId": "PUB001",
            "publisherName": "Addison-Wesley"
        },
        {
            "bookId": "BT004",
            "publisherId": "PUB001",
            "publisherName": "Addison-Wesley"
        }
    ]
}
```

### Create Author

**POST** `/api/author`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Create a new author
-   **Request Example:**

```json
{
    "name": "Martin Fowler",
    "bio": "Nhà phát triển phần mềm và tác giả nổi tiếng về kiến trúc phần mềm",
    "birthday": "1963-12-18"
}
```

-   **Response Example:**

```json
{
    "id": "A005",
    "name": "Martin Fowler",
    "bio": "Nhà phát triển phần mềm và tác giả nổi tiếng về kiến trúc phần mềm",
    "birthday": "1963-12-18"
}
```

### Update Author

**PUT** `/api/author/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Update author information
-   **Request Example:**

```json
{
    "name": "Martin Fowler",
    "bio": "Nhà phát triển phần mềm và tác giả nổi tiếng về kiến trúc phần mềm và refactoring",
    "birthday": "1963-12-18"
}
```

-   **Response Example:**

```json
{
    "id": "A005",
    "name": "Martin Fowler",
    "bio": "Nhà phát triển phần mềm và tác giả nổi tiếng về kiến trúc phần mềm và refactoring",
    "birthday": "1963-12-18"
}
```

### Delete Author

**DELETE** `/api/author/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Description:** Delete an author (only if no books are associated)
-   **Response Example:**

```json
"Author deleted successfully"
```

---

## Authentication API

### Test Auth

**GET** `/api/auth/test`

-   **Roles:** LIBRARIAN, ADMIN
-   **Response Example:**

```json
"123"
```

### Login

**POST** `/api/auth/login`

-   **Request Example:**

```json
{
    "cccd": "user_cccd",
    "password": "user_password"
}
```

-   **Response Example:**

```json
{
    "token": "<jwt_token>"
}
```

---

## Error Handling

All API endpoints follow consistent error response patterns. Here are the common HTTP status codes and error formats:

### HTTP Status Codes

-   **200 OK**: Successful GET, PUT, PATCH requests
-   **201 Created**: Successful POST requests
-   **204 No Content**: Successful DELETE requests
-   **400 Bad Request**: Invalid request data or business logic violations
-   **401 Unauthorized**: Missing or invalid authentication token
-   **403 Forbidden**: Insufficient permissions for the requested action
-   **404 Not Found**: Requested resource does not exist
-   **409 Conflict**: Resource conflict (e.g., duplicate ISBN, insufficient balance)
-   **500 Internal Server Error**: Unexpected server errors

### Error Response Format

All error responses follow this consistent format:

```json
{
    "error": "Detailed error message in Vietnamese",
    "code": "ERROR_CODE",
    "timestamp": "2025-06-02T10:30:00Z"
}
```

### Common Error Examples

**Insufficient Balance (409 Conflict):**

```json
{
    "error": "Số dư không đủ. Số dư hiện tại: 400,000 VND, cần: 830,000 VND",
    "code": "INSUFFICIENT_BALANCE"
}
```

**Reservation Limit Exceeded (400 Bad Request):**

```json
{
    "error": "Số lượng đặt chỗ trực tuyến đã đạt giới hạn cho cuốn sách này",
    "code": "RESERVATION_LIMIT_EXCEEDED"
}
```

**Book Not Available (409 Conflict):**

```json
{
    "error": "Sách không có sẵn để mượn",
    "code": "BOOK_NOT_AVAILABLE"
}
```

**Unauthorized Access (401 Unauthorized):**

```json
{
    "error": "Token không hợp lệ hoặc đã hết hạn",
    "code": "INVALID_TOKEN"
}
```

**Forbidden Access (403 Forbidden):**

```json
{
    "error": "Không có quyền truy cập tài nguyên này",
    "code": "INSUFFICIENT_PERMISSIONS"
}
```

---

## Authentication & Authorization

### JWT Token Authentication

Most endpoints require JWT token authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Role-based Access Control

The system supports three user roles with different permissions:

-   **USER**: Can view books, create reservations, view own transactions/reservations
-   **LIBRARIAN**: All USER permissions plus manage reservations, transactions, and book operations
-   **ADMIN**: All LIBRARIAN permissions plus user management and system configuration

### Getting Authentication Token

Use the login endpoint to obtain a JWT token:

**POST** `/api/auth/login`

```json
{
    "cccd": "123456789012",
    "password": "your_password"
}
```

Response:

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "userRole": "USER"
}
```

---

> **Note:** All endpoints may return error responses in the format described above. Financial amounts are always displayed in Vietnamese VND format with comma separators (e.g., "450,000 VND").

---

This documentation is auto-generated for frontend mocking and integration. For any questions or clarifications, please contact the development team.
