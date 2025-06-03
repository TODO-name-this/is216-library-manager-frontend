"use client"

import { authorAPI } from "@/lib/api"
import { getAllBooks } from "./bookActions"
import { Author } from "@/types"
import { Author as ApiAuthor } from "@/lib/api/types"

// Helper function to convert API author to local author type
function convertApiAuthorToLocal(apiAuthor: ApiAuthor): Author {
    return {
        id: apiAuthor.id, // Keep string ID as-is (e.g., "a1" stays "a1")
        name: apiAuthor.name,
        avatarUrl: apiAuthor.avatarUrl || undefined,
        birthday: apiAuthor.birthday ? new Date(apiAuthor.birthday) : undefined,
        biography: apiAuthor.biography || undefined,
    }
}

// Helper function to convert local author to API author type
function convertLocalAuthorToApi(localAuthor: Author): ApiAuthor {
    return {
        id: localAuthor.id, // Keep string ID as-is (e.g., "a1" stays "a1")
        name: localAuthor.name,
    }
}

export async function getAllAuthors(): Promise<Author[]> {
    try {
        const response = await authorAPI.getAll()
        if ("error" in response) {
            console.error("Failed to fetch authors:", response.error)
            return []
        }
        // Convert API authors to local author format
        return response.map(convertApiAuthorToLocal)
    } catch (error) {
        console.error("Failed to get authors:", error)
        return []
    }
}

export async function getAuthorById(id: string): Promise<Author | null> {
    const response = await authorAPI.getById(id) // Use string ID directly
    if ("error" in response) {
        console.error("Failed to fetch author:", response.error)
        return null
    }
    return convertApiAuthorToLocal(response)
}

export async function createAuthor(authorData: {
    name: string
}): Promise<Author | null> {
    const response = await authorAPI.create(authorData)
    if ("error" in response) {
        console.error("Failed to create author:", response.error)
        return null
    }
    return convertApiAuthorToLocal(response)
}

export async function updateAuthor(
    id: string,
    authorData: { name: string }
): Promise<Author | null> {
    const response = await authorAPI.update(id, authorData) // Use string ID directly
    if ("error" in response) {
        console.error("Failed to update author:", response.error)
        return null
    }
    return convertApiAuthorToLocal(response)
}

export async function deleteAuthor(id: string): Promise<boolean> {
    const response = await authorAPI.delete(id) // Use string ID directly
    if (typeof response === "object" && "error" in response) {
        console.error("Failed to delete author:", response.error)
        return false
    }
    return true
}

export async function getAuthorByIdApi(id: string): Promise<ApiAuthor | null> {
    const response = await authorAPI.getById(id)
    if ("error" in response) {
        console.error("Failed to fetch author:", response.error)
        return null
    }
    return response
}
