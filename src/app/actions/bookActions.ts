"use client"

import { bookTitleAPI, bookCopyAPI } from "@/lib/api"
import { BookTitle, BookCopy, ApiResponse } from "@/lib/api/types"

export async function getAllBooks(): Promise<BookTitle[]> {
    try {
        const response = await bookTitleAPI.getBookTitles()
        console.log("Book API response:", response)

        // The API response is now { data: BookTitle[] } or { error: any }
        if (response.error) {
            console.error("Failed to fetch books:", response.error)
            return []
        }

        const books = response.data || []
        console.log(
            "Books data:",
            books,
            "Type:",
            typeof books,
            "Is array?",
            Array.isArray(books)
        )

        // Extra validation to ensure we return an array
        if (Array.isArray(books)) {
            return books
        } else {
            console.error("Books data is not an array:", books)
            return []
        }
    } catch (error) {
        console.error("Error in getAllBooks:", error)
        return []
    }
}

export async function getBookById(id: string): Promise<BookTitle | null> {
    const response = await bookTitleAPI.getBookTitleById(id)
    if (response.error) {
        console.error("Failed to fetch book:", response.error)
        return null
    }
    return response.data || null
}

export async function createBook(bookData: {
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
}): Promise<ApiResponse<BookTitle>> {
    const response = await bookTitleAPI.createBookTitle(bookData)
    if (response.error) {
        console.error("Failed to create book:", response)
    }
    return response
}

export async function updateBook(
    id: string,
    bookData: {
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
): Promise<BookTitle | null> {
    const response = await bookTitleAPI.updateBookTitle(id, bookData)
    if (response.error) {
        console.error("Failed to update book:", response.error)
        return null
    }
    return response.data || null
}

export async function deleteBook(id: string): Promise<boolean> {
    const response = await bookTitleAPI.deleteBookTitle(id)
    if (response.error) {
        console.error("Failed to delete book:", response.error)
        return false
    }
    return true
}

export async function getAllBookCopies(): Promise<BookCopy[]> {
    const response = await bookCopyAPI.getBookCopies()
    if (response.error) {
        console.error("Failed to fetch book copies:", response.error)
        return []
    }
    return response.data || []
}

export async function getBookCopyById(id: number): Promise<BookCopy | null> {
    const response = await bookCopyAPI.getBookCopyById(id)
    if (response.error) {
        console.error("Failed to fetch book copy:", response.error)
        return null
    }
    return response.data || null
}

export async function deleteBookCopy(id: number): Promise<boolean> {
    const response = await bookCopyAPI.deleteBookCopy(id)
    if (response.error) {
        console.error("Failed to delete book copy:", response.error)
        return false
    }
    return true
}
