"use client"

import { categoryAPI } from "@/lib/api"
import type {
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from "@/lib/api/types"

export async function getAllCategories(): Promise<Category[]> {
    try {
        const response = await categoryAPI.getCategories()
        return response.data || []
    } catch (error) {
        console.error("Error fetching categories:", error)
        throw error
    }
}

export async function getCategoryById(id: number): Promise<Category | null> {
    try {
        const response = await categoryAPI.getCategoryById(id)
        return response.data || null
    } catch (error) {
        console.error("Error fetching category:", error)
        throw error
    }
}

export async function createCategory(
    categoryData: CreateCategoryRequest
): Promise<Category | null> {
    try {
        const response = await categoryAPI.createCategory(categoryData)
        return response.data || null
    } catch (error) {
        console.error("Error creating category:", error)
        throw error
    }
}

export async function updateCategory(
    id: number,
    categoryData: UpdateCategoryRequest
): Promise<Category | null> {
    try {
        const response = await categoryAPI.updateCategory(id, categoryData)
        return response.data || null
    } catch (error) {
        console.error("Error updating category:", error)
        throw error
    }
}

export async function deleteCategory(id: number): Promise<boolean> {
    try {
        await categoryAPI.deleteCategory(id)
        return true
    } catch (error) {
        console.error("Error deleting category:", error)
        throw error
    }
}

// Note: getCategoriesByBookId is not available in the current API
// If needed, this would require a backend endpoint implementation
