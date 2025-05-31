"use client"

import { bookTitleAPI, bookCopyAPI } from "@/lib/api"
import { BookTitle, BookCopy } from "@/lib/api/types"

export async function getAllBooks(): Promise<BookTitle[]> {
    const response = await bookTitleAPI.getBookTitles()
    if (response.error) {
        console.error("Failed to fetch books:", response.error)
        return []
    }
    return response.data || []
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
    title: string
    author: string
    publisher: string
}): Promise<BookTitle | null> {
    const response = await bookTitleAPI.createBookTitle(bookData)
    if (response.error) {
        console.error("Failed to create book:", response.error)
        return null
    }
    return response.data || null
}

export async function updateBook(
    id: string,
    bookData: {
        title?: string
        author?: string
        publisher?: string
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

export async function createBookCopy(
    bookTitleId: number
): Promise<BookCopy | null> {
    const response = await bookCopyAPI.createBookCopy({
        bookTitleId: bookTitleId.toString(),
    })
    if (response.error) {
        console.error("Failed to create book copy:", response.error)
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
