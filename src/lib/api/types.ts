// API Types for the Library Management System

export interface User {
    id: string
    name: string
    email: string
    role: "ADMIN" | "LIBRARIAN" | "USER"
    balance: number
    cccd: string
    phoneNumber: string
    address: string
}

export interface BookTitle {
    id: string
    imageUrl: string
    title: string
    isbn: string
    canBorrow: boolean
    price: number
    publishedDate: string
    publisherId: string
    authorIds: string[] | null
    categoryIds: string[] | null
    authorNames: string[]
    categoryNames: string[]
    reviews?: Review[]
    totalCopies: number
    availableCopies: number
    onlineReservations: number
    maxOnlineReservations: number
    userReservationsForThisBook: number | null
    maxUserReservations: number | null
}

export interface BookCopy {
    id: string
    bookTitleId: string
    status: "AVAILABLE" | "BORROWED" | "RESERVED" | "MAINTENANCE" | "LOST"
    condition: "NEW" | "GOOD" | "WORN" | "DAMAGED"
    // Enhanced fields from new API
    bookTitle: string
    bookPhotoUrl: string
    bookPrice: number
    borrowerCccd: string | null
    borrowerName: string | null
    borrowerId: string | null
}

export interface Author {
    id: string
    name: string
    avatarUrl?: string | null
    birthday?: string | null
    biography?: string | null
}

export interface Publisher {
    id: string
    name: string
    address?: string | null
    logoUrl?: string | null
    email?: string | null
    phone?: string | null
}

export interface Category {
    id: string
    name: string
    description?: string | null
}

export interface Review {
    id: string
    date: string
    comment: string
    star: number
    bookTitleId: string
    userId: string
}

export interface Reservation {
    id: string
    userId: string
    bookTitleId: string
    bookCopyId: string | null
    reservationDate: string
    expirationDate: string
    deposit: number
    bookTitle: string
    bookImageUrl: string
    bookAuthors: string[]
}

export interface Transaction {
    id: string
    userId: string
    bookCopyId: string
    borrowDate: string
    dueDate: string
    returnedDate: string | null
    status: "BORROWED" | "OVERDUE" | "COMPLETED"
    totalFee: number
    penaltyFee: number
    note: string | null
    // Enhanced fields for display
    userName?: string
    bookTitle?: string
    bookPhotoUrl?: string
    transactionDetail?: TransactionDetail | null
}

export interface TransactionDetail {
    transactionId: string
    penaltyFee: number
    description: string | null
}

export interface Question {
    id: string
    question: string
    askedBy: string
    askedDate: string
    answer?: string
    answeredBy?: string
    answeredDate?: string
}

// Auth Types
export interface LoginRequest {
    cccd: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
}

export interface DecodedToken {
    sub: string // User ID
    role: "ADMIN" | "LIBRARIAN" | "USER"
    type: "access" | "refresh"
    iat: number
    exp: number
}

// Generic API Response Types
export interface ApiResponse<T> {
    data?: T
    error?: ApiError
}

export interface ApiError {
    error: string
}

// Request Types for Create/Update operations
export interface CreateUserRequest {
    cccd: string
    name: string
    password: string
    role: "ADMIN" | "LIBRARIAN" | "USER"
}

export interface UpdateUserRequest {
    name?: string
    password?: string
    role?: "ADMIN" | "LIBRARIAN" | "USER"
}

export interface CreateBookTitleRequest {
    imageUrl: string
    title: string
    isbn: string
    canBorrow: boolean
    price: number
    publishedDate: string
    publisherId: string
    totalCopies: number
    maxOnlineReservations: number
    authorIds: string[]
    categoryIds: string[]
}

export interface UpdateBookTitleRequest {
    imageUrl?: string
    title?: string
    isbn?: string
    canBorrow?: boolean
    price?: number
    publishedDate?: string
    publisherId?: string
    totalCopies?: number
    maxOnlineReservations?: number
    authorIds?: string[]
    categoryIds?: string[]
}

export interface CreateAuthorRequest {
    name: string
    avatarUrl?: string
    birthday?: string // ISO date string
    biography?: string
}

export interface UpdateAuthorRequest {
    name?: string
    avatarUrl?: string
    birthday?: string // ISO date string
    biography?: string
}

export interface CreatePublisherRequest {
    name: string
    address: string
    logoUrl?: string
    email?: string
    phone?: string
}

export interface UpdatePublisherRequest {
    name?: string
    address?: string
    logoUrl?: string
    email?: string
    phone?: string
}

export interface CreateCategoryRequest {
    name: string
    description: string
}

export interface UpdateCategoryRequest {
    name?: string
    description?: string
}

export interface CreateReviewRequest {
    bookId: string
    rating: number
    comment: string
}

export interface UpdateReviewRequest {
    rating?: number
    comment?: string
}

export interface CreateReservationRequest {
    bookTitleId: string
}

export interface UpdateReservationRequest {
    bookCopyId?: string
    expirationDate?: string
}

export interface AssignCopyToReservationRequest {
    bookCopyId: string
}

export interface CreateBookCopyRequest {
    bookTitleId: string
    condition?: "NEW" | "GOOD" | "WORN" | "DAMAGED"
}

export interface UpdateBookCopyRequest {
    status?: "AVAILABLE" | "BORROWED" | "RESERVED" | "MAINTENANCE" | "LOST"
    condition?: "NEW" | "GOOD" | "WORN" | "DAMAGED"
}

export interface CreateTransactionRequest {
    userId: string
    bookCopyId: string
}

export interface CreateTransactionFromReservationRequest {
    reservationId: string
    bookCopyId: string
}

export interface UpdateTransactionRequest {
    returnedDate?: string
}

export interface CreateTransactionDetailRequest {
    transactionId: string
    penaltyFee: number
    description: string
}

export interface UpdateTransactionDetailRequest {
    penaltyFee?: number
    description?: string
}

export interface CreateQuestionRequest {
    question: string
    askedBy: string
}

export interface UpdateQuestionRequest {
    answer?: string
    answeredBy?: string
    answeredDate?: string
}
