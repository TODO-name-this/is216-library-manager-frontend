import { fetchWrapper } from "../fetchWrapper"
import { BookCopy, BookCopyWithDueInfo, CreateBookCopyRequest, ApiResponse, UpdateBookCopyRequest } from "./types"

export const bookCopyAPI = {
    // Get all book copies
    getBookCopies: async (): Promise<ApiResponse<BookCopy[]>> => {
        try {
            const response = await fetchWrapper.get("/bookCopy")
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to fetch book copies",
                },
            }
        }
    },

    // Get book copy by ID
    getBookCopyById: async (id: number): Promise<ApiResponse<BookCopy>> => {
        try {
            const response = await fetchWrapper.get(`/api/bookCopy/${id}`)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to fetch book copy" },
            }
        }
    },

    // Create new book copies
    createBookCopy: async (
        bookCopyData: CreateBookCopyRequest
    ): Promise<ApiResponse<BookCopy[]>> => {
        try {
            const response = await fetchWrapper.post(
                "/bookCopy",
                bookCopyData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to create book copies" },
            }
        }
    },
    // Delete book copy
    deleteBookCopy: async (id: number): Promise<ApiResponse<void>> => {
        try {
            await fetchWrapper.del(`/api/bookCopy/${id}`)
            return { data: undefined }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to delete book copy" },
            }
        }
    },

    // Update book copy
    updateBookCopy: async (
        id: string,
        updateData: UpdateBookCopyRequest
    ): Promise<ApiResponse<BookCopy>> => {
        try {
            const response = await fetchWrapper.put(`/bookCopy/${id}`, updateData)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to update book copy" },
            }
        }
    },

    // Get all book copies with due information
    getAllBookCopiesWithDueInfo: async (): Promise<ApiResponse<BookCopyWithDueInfo[]>> => {
        try {
            const response = await fetchWrapper.get("/bookCopy/all")
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to fetch book copies with due info",
                },
            }
        }
    },

    // Get overdue book copies
    getOverdueBookCopies: async (): Promise<ApiResponse<BookCopyWithDueInfo[]>> => {
        try {
            const response = await fetchWrapper.get("/bookCopy/overdue")
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to fetch overdue book copies",
                },
            }
        }
    },

    // Get book copy by ID with due information
    getBookCopyWithDueInfo: async (bookCopyId: string): Promise<ApiResponse<BookCopyWithDueInfo>> => {
        try {
            const response = await fetchWrapper.get(`/bookCopy/overdue/${bookCopyId}`)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to fetch book copy with due info" },
            }
        }
    },
}

