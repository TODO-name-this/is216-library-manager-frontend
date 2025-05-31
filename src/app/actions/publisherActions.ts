"use client"

import { publisherAPI } from "@/lib/api"
import type {
    Publisher,
    CreatePublisherRequest,
    UpdatePublisherRequest,
} from "@/lib/api/types"

export async function getAllPublishers(): Promise<Publisher[]> {
    try {
        const response = await publisherAPI.getPublishers()
        if (response.error) {
            console.error("Failed to fetch publishers:", response.error)
            return []
        }
        return response.data || []
    } catch (error) {
        console.error("Error fetching publishers:", error)
        throw error
    }
}

export async function getPublisherById(id: number): Promise<Publisher | null> {
    try {
        const response = await publisherAPI.getPublisherById(id)
        if (response.error) {
            console.error("Failed to fetch publisher:", response.error)
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error fetching publisher:", error)
        throw error
    }
}

export async function createPublisher(
    publisherData: CreatePublisherRequest
): Promise<Publisher | null> {
    try {
        const response = await publisherAPI.createPublisher(publisherData)
        if (response.error) {
            console.error("Failed to create publisher:", response.error)
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error creating publisher:", error)
        throw error
    }
}

export async function updatePublisher(
    id: number,
    publisherData: UpdatePublisherRequest
): Promise<Publisher | null> {
    try {
        const response = await publisherAPI.updatePublisher(id, publisherData)
        if (response.error) {
            console.error("Failed to update publisher:", response.error)
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error updating publisher:", error)
        throw error
    }
}

export async function deletePublisher(id: number): Promise<boolean> {
    try {
        const response = await publisherAPI.deletePublisher(id)
        if (response.error) {
            console.error("Failed to delete publisher:", response.error)
            return false
        }
        return true
    } catch (error) {
        console.error("Error deleting publisher:", error)
        throw error
    }
}
