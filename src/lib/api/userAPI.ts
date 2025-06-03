import { fetchWrapper } from "../fetchWrapper"
import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    ApiResponse,
} from "./types"

export const userAPI = {
    // Get all users
    getUsers: async (): Promise<ApiResponse<User[]>> => {
        try {
            const response = await fetchWrapper.get("/user")
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to fetch users" },
            }
        }
    }, // Get user by ID
    getUserById: async (id: number): Promise<ApiResponse<User>> => {
        try {
            const response = await fetchWrapper.get(`/user/${id}`)
            return { data: response }
        } catch (error: any) {
            return { error: { error: error.message || "Failed to fetch user" } }
        }
    },

    // Create new user
    createUser: async (
        userData: CreateUserRequest
    ): Promise<ApiResponse<User>> => {
        try {
            const response = await fetchWrapper.post("/user", userData)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to create user" },
            }
        }
    },

    // Update user
    updateUser: async (
        id: number,
        userData: UpdateUserRequest
    ): Promise<ApiResponse<User>> => {
        try {
            const response = await fetchWrapper.put(`/user/${id}`, userData)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to update user" },
            }
        }
    },

    // Delete user
    deleteUser: async (id: number): Promise<ApiResponse<void>> => {
        try {
            await fetchWrapper.del(`/user/${id}`)
            return { data: undefined }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to delete user" },
            }
        }
    },    // Search users by CCCD for librarian workflow
    searchUserByCCCD: async (cccd: string): Promise<ApiResponse<User[]>> => {
        try {
            const response = await fetchWrapper.get(`/user/search?cccd=${encodeURIComponent(cccd)}`)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to search users by CCCD" },
            }
        }
    },
}
