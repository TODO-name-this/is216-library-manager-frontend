import { fetchWrapper } from "../fetchWrapper"
import { BookCopy, CreateBookCopyRequest, ApiResponse, UpdateBookCopyRequest } from "./types"

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

    // Create new book copy
    createBookCopy: async (
        bookCopyData: CreateBookCopyRequest
    ): Promise<ApiResponse<BookCopy>> => {
        try {
            const response = await fetchWrapper.post(
                "/bookCopy",
                bookCopyData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to create book copy" },
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
}

