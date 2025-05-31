# API Documentation

This document describes all backend API endpoints, including HTTP methods, paths, required roles, and example request/response bodies. Use this as a reference for frontend mocking and integration.

---

## User API

### Get All Users

**GET** `/api/user`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
[
    {
        "id": "123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER"
    },
    {
        "id": "124",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "USER"
    }
]
```

### Get User by ID

**GET** `/api/user/{id}`

-   **Roles:** User (self), ADMIN, LIBRARIAN
-   **Response Example:**

```json
{
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
}
```

### Create User

**POST** `/api/user`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "USER"
}
```

-   **Response Example:**

```json
{
    "id": "124",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER"
}
```

### Update User (Partial)

**PATCH** `/api/user/{id}`

-   **Roles:** User (self), ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "email": "newemail@example.com"
}
```

-   **Response Example:**

```json
{
    "id": "123",
    "name": "John Doe",
    "email": "newemail@example.com",
    "role": "USER"
}
```

### Delete User

**DELETE** `/api/user/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
"User deleted successfully"
```

---

## Book Title API

### Get All Book Titles

**GET** `/api/bookTitle`

-   **Response Example:**

```json
[
    {
        "id": "bt1",
        "title": "Effective Java",
        "author": "Joshua Bloch",
        "publisher": "Addison-Wesley"
    },
    {
        "id": "bt2",
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "publisher": "Prentice Hall"
    }
]
```

### Get Book Title by ID

**GET** `/api/bookTitle/{id}`

-   **Response Example:**

```json
{
    "id": "bt1",
    "title": "Effective Java",
    "author": "Joshua Bloch",
    "publisher": "Addison-Wesley"
}
```

### Create Book Title

**POST** `/api/bookTitle`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "publisher": "Prentice Hall"
}
```

-   **Response Example:**

```json
{
    "id": "bt2",
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "publisher": "Prentice Hall"
}
```

### Update Book Title

**PUT** `/api/bookTitle/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "title": "Clean Code (2nd Edition)",
    "author": "Robert C. Martin",
    "publisher": "Prentice Hall"
}
```

-   **Response Example:**

```json
{
    "id": "bt2",
    "title": "Clean Code (2nd Edition)",
    "author": "Robert C. Martin",
    "publisher": "Prentice Hall"
}
```

### Delete Book Title

**DELETE** `/api/bookTitle/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
"Book title deleted successfully"
```

---

## Review API

### Get All Reviews

**GET** `/api/review`

-   **Response Example:**

```json
[
    {
        "id": "r1",
        "userId": "123",
        "bookId": "bt1",
        "rating": 5,
        "comment": "Great book!"
    },
    {
        "id": "r2",
        "userId": "124",
        "bookId": "bt1",
        "rating": 4,
        "comment": "Very useful."
    }
]
```

### Get Review by ID

**GET** `/api/review/{id}`

-   **Response Example:**

```json
{
    "id": "r1",
    "userId": "123",
    "bookId": "bt1",
    "rating": 5,
    "comment": "Great book!"
}
```

### Create Review

**POST** `/api/review`

-   **Roles:** ADMIN, LIBRARIAN, USER
-   **Request Example:**

```json
{
    "bookId": "bt1",
    "rating": 4,
    "comment": "Very useful."
}
```

-   **Response Example:**

```json
{
    "id": "r2",
    "userId": "124",
    "bookId": "bt1",
    "rating": 4,
    "comment": "Very useful."
}
```

### Update Review

**PUT** `/api/review/{id}`

-   **Roles:** ADMIN, LIBRARIAN, USER
-   **Request Example:**

```json
{
    "rating": 3,
    "comment": "Changed my mind."
}
```

-   **Response Example:**

```json
{
    "id": "r2",
    "userId": "124",
    "bookId": "bt1",
    "rating": 3,
    "comment": "Changed my mind."
}
```

### Delete Review

**DELETE** `/api/review/{id}`

-   **Roles:** ADMIN, LIBRARIAN, USER
-   **Response Example:**

```json
"Review deleted successfully"
```

---

## Reservation API

### Get All Reservations

**GET** `/api/reservation`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
[
    {
        "id": "res1",
        "userId": "123",
        "bookId": "bt1",
        "status": "PENDING"
    },
    {
        "id": "res2",
        "userId": "124",
        "bookId": "bt2",
        "status": "APPROVED"
    }
]
```

### Get Reservation by ID

**GET** `/api/reservation/{id}`

-   **Roles:** ADMIN, LIBRARIAN, USER
-   **Response Example:**

```json
{
    "id": "res1",
    "userId": "123",
    "bookId": "bt1",
    "status": "PENDING"
}
```

### Create Reservation

**POST** `/api/reservation`

-   **Roles:** USER
-   **Request Example:**

```json
{
    "bookId": "bt1"
}
```

-   **Response Example:**

```json
{
    "id": "res2",
    "userId": "124",
    "bookId": "bt1",
    "status": "PENDING"
}
```

### Update Reservation

**PUT** `/api/reservation/{id}`

-   **Roles:** ADMIN, LIBRARIAN, USER
-   **Request Example:**

```json
{
    "status": "APPROVED"
}
```

-   **Response Example:**

```json
{
    "id": "res2",
    "userId": "124",
    "bookId": "bt1",
    "status": "APPROVED"
}
```

### Partial Update Reservation

**PATCH** `/api/reservation/{id}`

-   **Roles:** ADMIN, LIBRARIAN, USER
-   **Request Example:**

```json
{
    "status": "CANCELLED"
}
```

-   **Response Example:**

```json
{
    "id": "res2",
    "userId": "124",
    "bookId": "bt1",
    "status": "CANCELLED"
}
```

### Delete Reservation

**DELETE** `/api/reservation/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
"Reservation deleted successfully"
```

---

## Publisher API

### Get All Publishers

**GET** `/api/publisher`

-   **Response Example:**

```json
[
    {
        "id": "pub1",
        "name": "Addison-Wesley"
    },
    {
        "id": "pub2",
        "name": "O'Reilly Media"
    }
]
```

### Get Publisher by ID

**GET** `/api/publisher/{id}`

-   **Response Example:**

```json
{
    "id": "pub1",
    "name": "Addison-Wesley"
}
```

### Create Publisher

**POST** `/api/publisher`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "name": "O'Reilly Media"
}
```

-   **Response Example:**

```json
{
    "id": "pub2",
    "name": "O'Reilly Media"
}
```

### Update Publisher

**PUT** `/api/publisher/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "name": "O'Reilly Media (Updated)"
}
```

-   **Response Example:**

```json
{
    "id": "pub2",
    "name": "O'Reilly Media (Updated)"
}
```

### Delete Publisher

**DELETE** `/api/publisher/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
"Publisher deleted successfully"
```

---

## Category API

### Get All Categories

**GET** `/api/category`

-   **Response Example:**

```json
[
    {
        "id": "cat1",
        "name": "Programming"
    },
    {
        "id": "cat2",
        "name": "Databases"
    }
]
```

### Get Category by ID

**GET** `/api/category/{id}`

-   **Response Example:**

```json
{
    "id": "cat1",
    "name": "Programming"
}
```

### Create Category

**POST** `/api/category`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "name": "Databases"
}
```

-   **Response Example:**

```json
{
    "id": "cat2",
    "name": "Databases"
}
```

### Update Category

**PUT** `/api/category/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "name": "Databases (Updated)"
}
```

-   **Response Example:**

```json
{
    "id": "cat2",
    "name": "Databases (Updated)"
}
```

### Delete Category

**DELETE** `/api/category/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
"Category deleted successfully"
```

---

## Book Copy API

### Get All Book Copies

**GET** `/api/bookCopy`

-   **Response Example:**

```json
[
    {
        "id": "bc1",
        "bookTitleId": "bt1",
        "status": "AVAILABLE"
    },
    {
        "id": "bc2",
        "bookTitleId": "bt1",
        "status": "AVAILABLE"
    }
]
```

### Get Book Copy by ID

**GET** `/api/bookCopy/{id}`

-   **Response Example:**

```json
{
    "id": "bc1",
    "bookTitleId": "bt1",
    "status": "AVAILABLE"
}
```

### Create Book Copy

**POST** `/api/bookCopy`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "bookTitleId": "bt1"
}
```

-   **Response Example:**

```json
{
    "id": "bc2",
    "bookTitleId": "bt1",
    "status": "AVAILABLE"
}
```

### Delete Book Copy

**DELETE** `/api/bookCopy/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
"Book copy deleted successfully"
```

---

## Transaction API

### Get All Transactions

**GET** `/api/transaction`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
[
    {
        "id": "t1",
        "userId": "123",
        "status": "COMPLETED"
    },
    {
        "id": "t2",
        "userId": "124",
        "status": "PENDING"
    }
]
```

### Get Transaction by ID

**GET** `/api/transaction/{id}`

-   **Response Example:**

```json
{
    "id": "t1",
    "userId": "123",
    "status": "COMPLETED"
}
```

### Create Transaction

**POST** `/api/transaction`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "userId": "123",
    "bookCopyId": "bc1"
}
```

-   **Response Example:**

```json
{
    "id": "t2",
    "userId": "123",
    "status": "PENDING"
}
```

### Update Transaction

**PUT** `/api/transaction/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "status": "COMPLETED"
}
```

-   **Response Example:**

```json
{
    "id": "t2",
    "userId": "123",
    "status": "COMPLETED"
}
```

### Delete Transaction

**DELETE** `/api/transaction/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Response Example:**

```json
"Transaction deleted successfully"
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

-   **Response Example:**

```json
[
    {
        "id": "a1",
        "name": "Joshua Bloch"
    },
    {
        "id": "a2",
        "name": "Robert C. Martin"
    }
]
```

### Get Author by ID

**GET** `/api/author/{id}`

-   **Response Example:**

```json
{
    "id": "a1",
    "name": "Joshua Bloch"
}
```

### Create Author

**POST** `/api/author`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "name": "Robert C. Martin"
}
```

-   **Response Example:**

```json
{
    "id": "a2",
    "name": "Robert C. Martin"
}
```

### Update Author

**PUT** `/api/author/{id}`

-   **Roles:** ADMIN, LIBRARIAN
-   **Request Example:**

```json
{
    "name": "Robert C. Martin (Uncle Bob)"
}
```

-   **Response Example:**

```json
{
    "id": "a2",
    "name": "Robert C. Martin (Uncle Bob)"
}
```

### Delete Author

**DELETE** `/api/author/{id}`

-   **Roles:** ADMIN, LIBRARIAN
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

> **Note:** All endpoints may return error responses in the following format:
>
> ```json
> { "error": "Error message here" }
> ```

---

This documentation is auto-generated for frontend mocking and integration.