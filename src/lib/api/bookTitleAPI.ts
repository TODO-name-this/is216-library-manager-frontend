import { fetchWrapper } from "../fetchWrapper"
import {
    BookTitle,
    CreateBookTitleRequest,
    UpdateBookTitleRequest,
    ApiResponse,
} from "./types"

export const bookTitleAPI = {
    // Get all book titles
    getBookTitles: async (): Promise<ApiResponse<BookTitle[]>> => {
        try {
            const response = await fetchWrapper.get("/api/bookTitle/names")
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to fetch book titles",
                },
            }
        }
    },    // Get book title by ID
    getBookTitleById: async (id: string): Promise<ApiResponse<BookTitle>> => {
        try {
            const response = await fetchWrapper.get(`/api/bookTitle/${id}`)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to fetch book title" },
            }
        }
    },

    // Create new book title
    createBookTitle: async (
        bookData: CreateBookTitleRequest
    ): Promise<ApiResponse<BookTitle>> => {
        try {
            const response = await fetchWrapper.post("/api/bookTitle", bookData)
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to create book title",
                },
            }
        }
    },    // Update book title
    updateBookTitle: async (
        id: string,
        bookData: UpdateBookTitleRequest
    ): Promise<ApiResponse<BookTitle>> => {
        try {
            const response = await fetchWrapper.put(
                `/api/bookTitle/${id}`,
                bookData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to update book title",
                },
            }
        }
    },

    // Delete book title
    deleteBookTitle: async (id: string): Promise<ApiResponse<void>> => {
        try {
            await fetchWrapper.del(`/api/bookTitle/${id}`)
            return { data: undefined }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to delete book title",
                },
            }
        }
    },
}
