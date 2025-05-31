export interface Root<T> {
    _embedded: T[]
    page: Page
}

export interface Page {
    size: number
    totalElements: number
    totalPages: number
    number: number
}

export interface User {
    id: string
    cccd: string
    name: string
    password: string
    role: "ADMIN" | "LIBRARIAN" | "USER"
}

export interface BookTitle {
    id: string
    title: string
    author: string
    publisher: string
}

export interface Book {
    id: string
    imageUrl: string
    title: string
    isbn: string
    publishedDate: string
    publisherId: string
}

export interface Author {
    id: string
    name: string
    avatarUrl?: string | null
    birthday?: Date
    biography?: string
}

export interface Review {
    id: string
    userId: string
    bookId: string
    rating: number
    comment: string
}

export interface Reservation {
    id: string
    userId: string
    bookId: string
    status: "PENDING" | "APPROVED" | "CANCELLED"
}

export interface Publisher {
    id: string
    name: string
}

export interface Category {
    id: string
    name: string
}

export interface BookCopy {
    id: string
    bookTitleId: string
    status: "AVAILABLE" | "BORROWED" | "RESERVED" | "DAMAGED"
}

export interface Transaction {
    id: string
    userId: string
    status: "PENDING" | "COMPLETED" | "CANCELLED"
}

// Auth Types
export interface LoginRequest {
    cccd: string
    password: string
}

export interface LoginResponse {
    token: string
}

export interface ApiError {
    error: string
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

export interface Comment {
    user: string
    date: string
    rating: number
    text: string
}
