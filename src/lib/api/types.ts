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
    publishedDate: string
    publisherId: string
    authorIds: string[] | null
    categoryIds: string[] | null
    authorNames: string[]
    categoryNames: string[]
    reviews?: Review[]
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
}

export interface Category {
    id: string
    name: string
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
    bookId: string
    status: "PENDING" | "APPROVED" | "CANCELLED"
}

export interface Transaction {
    id: string
    userId: string
    status: "PENDING" | "COMPLETED" | "CANCELLED"
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
    token: string
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
    title: string
    author: string
    publisher: string
}

export interface UpdateBookTitleRequest {
    title?: string
    author?: string
    publisher?: string
}

export interface CreateAuthorRequest {
    name: string
}

export interface UpdateAuthorRequest {
    name: string
}

export interface CreatePublisherRequest {
    name: string
}

export interface UpdatePublisherRequest {
    name: string
}

export interface CreateCategoryRequest {
    name: string
}

export interface UpdateCategoryRequest {
    name: string
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
    bookId: string
}

export interface UpdateReservationRequest {
    status: "PENDING" | "APPROVED" | "CANCELLED"
}

export interface CreateBookCopyRequest {
    bookTitleId: string
}

export interface CreateTransactionRequest {
    userId: string
    bookCopyId: string
}

export interface UpdateTransactionRequest {
    status: "PENDING" | "COMPLETED" | "CANCELLED"
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

export interface Transaction {
    id: string
    userId: string
    bookCopyId?: string
    status: "PENDING" | "COMPLETED" | "CANCELLED"
}

export interface AuthResponse {
    token: string
}

export interface LoginRequest {
    cccd: string
    password: string
}

export interface ApiError {
    error: string
}

export interface ApiResponse<T> {
    data?: T
    error?: ApiError
}
