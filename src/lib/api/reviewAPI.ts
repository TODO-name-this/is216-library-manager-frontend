import { fetchWrapper } from "../fetchWrapper"
import type {
    Review,
    ApiError,
    CreateReviewRequest,
    UpdateReviewRequest,
} from "./types"

export const reviewAPI = {
    // Get review by ID
    getById: async (id: string): Promise<Review | ApiError> => {
        try {
            const response = await fetchWrapper.get(`/api/review/${id}`)
            if (response.error) {
                return {
                    error: response.error.message || "Failed to fetch review",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while fetching review" }
        }
    },

    // Create new review (ADMIN, LIBRARIAN, USER)
    create: async (
        reviewData: CreateReviewRequest
    ): Promise<Review | ApiError> => {
        try {
            const response = await fetchWrapper.post("/api/review", reviewData)
            if (response.error) {
                return {
                    error: response.error.message || "Failed to create review",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while creating review" }
        }
    },

    // Update review (ADMIN, LIBRARIAN, USER)
    update: async (
        id: string,
        reviewData: UpdateReviewRequest
    ): Promise<Review | ApiError> => {
        try {
            const response = await fetchWrapper.put(
                `/api/review/${id}`,
                reviewData
            )
            if (response.error) {
                return {
                    error: response.error.message || "Failed to update review",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while updating review" }
        }
    },

    // Delete review (ADMIN, LIBRARIAN, USER)
    delete: async (id: string): Promise<string | ApiError> => {
        try {
            const response = await fetchWrapper.del(`/api/review/${id}`)
            if (response.error) {
                return {
                    error: response.error.message || "Failed to delete review",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while deleting review" }
        }
    },

    // Get reviews by book title
    getByBookTitle: async (bookTitle: string): Promise<Review[] | ApiError> => {
        try {
            const response = await fetchWrapper.get(
                `/api/reviews?bookTitle=${encodeURIComponent(bookTitle)}`
            )
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to fetch reviews by book title",
                }
            }
            return response.data || []
        } catch (error) {
            return {
                error: "Network error while fetching reviews by book title",
            }
        }
    },
}
