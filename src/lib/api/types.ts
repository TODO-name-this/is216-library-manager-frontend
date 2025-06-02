// API Types for the Library Management System

export interface User {
    id: string
    cccd: string
    name: string
    password: string
    role: "ADMIN" | "LIBRARIAN" | "USER"
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
    status: "AVAILABLE" | "BORROWED" | "RESERVED" | "DAMAGED"
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
    reservationDate: string
    expirationDate: string
    status: "PENDING" | "APPROVED" | "CANCELLED" | "COMPLETED"
    deposit: number
    bookTitleId: string
    bookCopyId: string | null
    userId: string
    bookTitle: string
    bookImageUrl: string
    bookAuthors: string[]
}

export interface TransactionDetail {
    transactionId: string
    bookCopyId: string
    returnedDate: string | null
    penaltyFee: number
    bookTitle: string
    bookImageUrl: string
    bookAuthors: string[]
}

export interface Transaction {
    id: string
    borrowDate: string
    dueDate: string
    userId: string
    details: TransactionDetail[]
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
    bookCopyId: string
}

export interface UpdateReservationRequest {
    status: "PENDING" | "APPROVED" | "CANCELLED"
}

export interface CreateBookCopyRequest {
    bookTitleId: string
}

export interface CreateTransactionRequest {
    borrowDate: string
    dueDate: string
    userId: string
}

export interface UpdateTransactionRequest {
    borrowDate?: string
    dueDate?: string
    userId?: string
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
