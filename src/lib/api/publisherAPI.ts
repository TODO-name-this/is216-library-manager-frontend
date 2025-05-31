import { fetchWrapper } from "../fetchWrapper"
import {
    Publisher,
    CreatePublisherRequest,
    UpdatePublisherRequest,
    ApiResponse,
} from "./types"

export const publisherAPI = {
    // Get all publishers
    getPublishers: async (): Promise<ApiResponse<Publisher[]>> => {
        try {
            const response = await fetchWrapper.get("/api/publisher")
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to fetch publishers" },
            }
        }
    },

    // Get publisher by ID
    getPublisherById: async (id: number): Promise<ApiResponse<Publisher>> => {
        try {
            const response = await fetchWrapper.get(`/api/publisher/${id}`)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to fetch publisher" },
            }
        }
    },

    // Create new publisher
    createPublisher: async (
        publisherData: CreatePublisherRequest
    ): Promise<ApiResponse<Publisher>> => {
        try {
            const response = await fetchWrapper.post(
                "/api/publisher",
                publisherData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to create publisher" },
            }
        }
    },

    // Update publisher
    updatePublisher: async (
        id: number,
        publisherData: UpdatePublisherRequest
    ): Promise<ApiResponse<Publisher>> => {
        try {
            const response = await fetchWrapper.put(
                `/api/publisher/${id}`,
                publisherData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to update publisher" },
            }
        }
    },

    // Delete publisher
    deletePublisher: async (id: number): Promise<ApiResponse<void>> => {
        try {
            await fetchWrapper.del(`/api/publisher/${id}`)
            return { data: undefined }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to delete publisher" },
            }
        }
    },
}
