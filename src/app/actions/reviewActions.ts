"use client"

import { reviewAPI } from "@/lib/api"
import type {
    Review,
    CreateReviewRequest,
    UpdateReviewRequest,
    ApiError,
} from "@/lib/api/types"

export async function getReviewById(id: string): Promise<Review | null> {
    try {
        const response = await reviewAPI.getById(id)
        if ("error" in response) {
            console.error("Failed to fetch review:", response.error)
            return null
        }
        return response
    } catch (error) {
        console.error("Error fetching review:", error)
        throw error
    }
}

export async function createReview(
    reviewData: CreateReviewRequest
): Promise<Review | null> {
    try {
        const response = await reviewAPI.create(reviewData)
        if ("error" in response) {
            console.error("Failed to create review:", response.error)
            return null
        }
        return response
    } catch (error) {
        console.error("Error creating review:", error)
        throw error
    }
}

export async function updateReview(
    id: string,
    reviewData: UpdateReviewRequest
): Promise<Review | null> {
    try {
        const response = await reviewAPI.update(id, reviewData)
        if ("error" in response) {
            console.error("Failed to update review:", response.error)
            return null
        }
        return response
    } catch (error) {
        console.error("Error updating review:", error)
        throw error
    }
}

export async function deleteReview(id: string): Promise<boolean> {
    try {
        const response = await reviewAPI.delete(id)
        if (typeof response === "object" && "error" in response) {
            console.error("Failed to delete review:", response.error)
            return false
        }
        return true
    } catch (error) {
        console.error("Error deleting review:", error)
        return false
    }
}

export async function getByBookTitle(
    bookTitle: string
): Promise<Review[] | ApiError> {
    return await reviewAPI.getByBookTitle(bookTitle)
}

export async function getMyReviewForBook(
    bookTitleId: string
): Promise<Review | null> {
    try {
        const response = await reviewAPI.getMyReviewForBook(bookTitleId)
        
        // Handle null response (no review found)
        if (response === null) {
            return null
        }
        
        // Handle error response
        if (typeof response === "object" && "error" in response) {
            console.error("Failed to fetch your review:", response.error)
            return null
        }
        
        // Valid review object
        return response as Review
    } catch (error) {
        console.error("Error fetching your review:", error)
        throw error
    }
}

// Note: The following methods are not available in the current API:
// - getAllReviews
// - getReviewsByBookId
// - getReviewsByUserId
// If needed, these would require backend endpoint implementations
