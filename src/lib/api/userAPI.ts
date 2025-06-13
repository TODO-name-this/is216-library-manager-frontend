import { fetchWrapper } from "../fetchWrapper"
import {
    User,
    CreateUserRequest,
    UpdateUserRequest,
    SelfUpdateUserRequest,
    LibrarianUpdateUserRequest,
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
    getUserById: async (id: string): Promise<ApiResponse<User>> => {
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

    // Update user (legacy - for backward compatibility)
    updateUser: async (
        id: string,
        userData: UpdateUserRequest
    ): Promise<ApiResponse<User>> => {
        try {
            const response = await fetchWrapper.patch(`/user/${id}`, userData)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to update user" },
            }
        }
    },

    // Self-update endpoint - users update their own profile
    updateSelf: async (
        userData: SelfUpdateUserRequest
    ): Promise<ApiResponse<User>> => {
        try {
            const response = await fetchWrapper.patch(`/user/self`, userData)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to update profile" },
            }
        }
    },

    // Role-based update endpoint - admins/librarians update other users
    updateUserByRole: async (
        id: string,
        userData: LibrarianUpdateUserRequest
    ): Promise<ApiResponse<User>> => {
        try {
            const response = await fetchWrapper.patch(`/user/${id}`, userData)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to update user" },
            }
        }
    },

    // Delete user
    deleteUser: async (id: string): Promise<ApiResponse<void>> => {
        try {
            await fetchWrapper.del(`/user/${id}`)
            return { data: undefined }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to delete user" },
            }
        }
    },    
    
    // Search users by query for general search
    searchUser: async (query: string): Promise<ApiResponse<User[]>> => {
        try {
            const response = await fetchWrapper.get(`/user/search?q=${encodeURIComponent(query)}`)
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to search users" },
            }
        }
    },

    // Reset user password (ADMIN, LIBRARIAN)
    resetPassword: async (
        id: string,
        newPassword: string
    ): Promise<ApiResponse<User>> => {
        try {
            const response = await fetchWrapper.patch(`/user/${id}`, {
                password: newPassword
            })
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to reset password" },
            }
        }
    },
}
