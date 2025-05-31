import { fetchWrapper } from "../fetchWrapper"
import {
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    ApiResponse,
} from "./types"

export const categoryAPI = {
    // Get all categories
    getCategories: async (): Promise<ApiResponse<Category[]>> => {
        try {
            const response = await fetchWrapper.get("/api/category")
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to fetch categories" },
            }
        }
    },

    // Get category by ID
    getCategoryById: async (id: number): Promise<ApiResponse<Category>> => {
        try {
            const response = await fetchWrapper.get(`/api/category/${id}`)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to fetch category" },
            }
        }
    },

    // Create new category
    createCategory: async (
        categoryData: CreateCategoryRequest
    ): Promise<ApiResponse<Category>> => {
        try {
            const response = await fetchWrapper.post(
                "/api/category",
                categoryData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to create category" },
            }
        }
    },

    // Update category
    updateCategory: async (
        id: number,
        categoryData: UpdateCategoryRequest
    ): Promise<ApiResponse<Category>> => {
        try {
            const response = await fetchWrapper.put(
                `/api/category/${id}`,
                categoryData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to update category" },
            }
        }
    },

    // Delete category
    deleteCategory: async (id: number): Promise<ApiResponse<void>> => {
        try {
            await fetchWrapper.del(`/api/category/${id}`)
            return { data: undefined }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to delete category" },
            }
        }
    },
}
