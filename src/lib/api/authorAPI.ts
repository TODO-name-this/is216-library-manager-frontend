import { fetchWrapper } from "../fetchWrapper"
import type {
    Author,
    ApiError,
    CreateAuthorRequest,
    UpdateAuthorRequest,
} from "./types"

export const authorAPI = {
    // Get all authors
    getAll: async (): Promise<Author[] | ApiError> => {
        try {
            const response = await fetchWrapper.get("/api/author")
            if (response.error) {
                return {
                    error: response.error.message || "Failed to fetch authors",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while fetching authors" }
        }
    },

    // Get author by ID
    getById: async (id: string): Promise<Author | ApiError> => {
        try {
            const response = await fetchWrapper.get(`/api/author/${id}`)
            if (response.error) {
                return {
                    error: response.error.message || "Failed to fetch author",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while fetching author" }
        }
    },

    // Create new author (ADMIN, LIBRARIAN)
    create: async (
        authorData: CreateAuthorRequest
    ): Promise<Author | ApiError> => {
        try {
            const response = await fetchWrapper.post("/api/author", authorData)
            if (response.error) {
                return {
                    error: response.error.message || "Failed to create author",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while creating author" }
        }
    },

    // Update author (ADMIN, LIBRARIAN)
    update: async (
        id: string,
        authorData: UpdateAuthorRequest
    ): Promise<Author | ApiError> => {
        try {
            const response = await fetchWrapper.put(
                `/api/author/${id}`,
                authorData
            )
            if (response.error) {
                return {
                    error: response.error.message || "Failed to update author",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while updating author" }
        }
    },
    // Delete author (ADMIN, LIBRARIAN)
    delete: async (id: string): Promise<string | ApiError> => {
        try {
            const response = await fetchWrapper.del(`/api/author/${id}`)
            if (response.error) {
                return {
                    error: response.error.message || "Failed to delete author",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while deleting author" }
        }
    },
}
