# Library Manager Frontend - API Integration

This Next.js frontend application is integrated with a Spring Boot backend API with MySQL database and JWT authentication.

## API Integration Status

✅ **Completed API Integrations:**

-   User API (`userAPI`)
-   Book Title API (`bookTitleAPI`)
-   Review API (`reviewAPI`)
-   Reservation API (`reservationAPI`)
-   Publisher API (`publisherAPI`)
-   Category API (`categoryAPI`)
-   Book Copy API (`bookCopyAPI`)
-   Transaction API (`transactionAPI`)
-   Author API (`authorAPI`)
-   Authentication API (`authAPI`)

## Architecture

### API Layer (`src/lib/api/`)

-   **`fetchWrapper.ts`**: Core HTTP client with JWT token handling
-   **`types.ts`**: TypeScript type definitions matching backend API
-   **`authAPI.ts`**: Authentication (login, logout, token management)
-   **`userAPI.ts`**: User CRUD operations
-   **`bookTitleAPI.ts`**: Book title CRUD operations
-   **`authorAPI.ts`**: Author CRUD operations
-   **`reviewAPI.ts`**: Review CRUD operations
-   **`reservationAPI.ts`**: Reservation CRUD operations + partial updates
-   **`publisherAPI.ts`**: Publisher CRUD operations
-   **`categoryAPI.ts`**: Category CRUD operations
-   **`bookCopyAPI.ts`**: Book copy create/read/delete operations
-   **`transactionAPI.ts`**: Transaction CRUD operations
-   **`index.ts`**: Central export file for all APIs

### Action Layer (`src/app/actions/`)

-   **`authorActions.ts`**: Wrapper functions for author API calls
-   **`bookActions.ts`**: Wrapper functions for book and book copy API calls
-   More action files to be updated...

### Authentication

-   **JWT token storage**: localStorage-based
-   **Auth context**: `src/lib/AuthContext.tsx`
-   **Login page**: `src/app/login/page.tsx`
-   **Protected routes**: Implement as needed

## Usage Examples

### Import APIs

```typescript
import { authorAPI, bookTitleAPI, userAPI } from "@/lib/api"
```

### Using API functions

```typescript
// Get all authors
const response = await authorAPI.getAuthors()
if (response.data) {
    setAuthors(response.data)
} else {
    console.error("Error:", response.error)
}

// Create new author
const newAuthor = await authorAPI.createAuthor({ name: "John Doe" })
```

### Using Action functions

```typescript
import { getAllAuthors, createAuthor } from "@/app/actions/authorActions"

// These handle error logging automatically
const authors = await getAllAuthors() // Returns Author[] or []
const newAuthor = await createAuthor({ name: "Jane Doe" }) // Returns Author or null
```

## Environment Configuration

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_JWT_SECRET=your_jwt_secret_here
```

## Backend API Endpoints

All endpoints are documented in `API-DOCUMENT.md`. The frontend is configured to work with:

-   **Base URL**: `http://localhost:8080`
-   **Authentication**: JWT tokens via `Authorization: Bearer <token>` header
-   **Content-Type**: `application/json`

## Next Steps

1. **Update remaining action files** to use new API structure
2. **Update page components** to use action functions instead of mock data
3. **Implement proper error handling** UI components
4. **Add loading states** and user feedback
5. **Create protected route wrapper** for authenticated pages
6. **Test integration** with running Spring Boot backend
7. **Add input validation** and form handling
8. **Implement proper user role management**

## API Response Structure

All API functions return a standardized response:

```typescript
interface ApiResponse<T> {
    data?: T
    error?: { error: string }
}
```

Success responses have `data`, error responses have `error`.
