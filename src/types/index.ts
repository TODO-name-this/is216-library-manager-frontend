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
    avatarUrl: string | null
    name: string
    birthday: Date
    biography: string
}

export interface Review {
    id: string
    date: string
    title: string
    comment: string | null
    score: number
    bookId: string
    userId: string
    user: User
}

export interface User {
    avatarUrl: any
    name: string
    email: string
    role: string
}

export interface Category {
    name: string
    description: string
}
