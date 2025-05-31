import { fetchWrapper } from "../fetchWrapper"
import type { LoginRequest, LoginResponse, ApiError } from "./types"

export const authAPI = {
    // Login
    login: async (
        credentials: LoginRequest
    ): Promise<LoginResponse | ApiError> => {
        try {
            const response = await fetchWrapper.post(
                "/api/auth/login",
                credentials,
                false
            )
            if (response.error) {
                return { error: response.error.message || "Login failed" }
            }

            // Store JWT token in localStorage
            if (response.token) {
                localStorage.setItem("jwt_token", response.token)
            }

            return response
        } catch (error) {
            return { error: "Network error during login" }
        }
    },

    // Test authentication (requires JWT)
    testAuth: async (): Promise<string | ApiError> => {
        try {
            const response = await fetchWrapper.get("/api/auth/test")
            if (response.error) {
                return { error: response.error.message || "Auth test failed" }
            }
            return response
        } catch (error) {
            return { error: "Network error during auth test" }
        }
    },

    // Logout (client-side token removal)
    logout: () => {
        localStorage.removeItem("jwt_token")
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return localStorage.getItem("jwt_token") !== null
    },

    // Get current token
    getToken: (): string | null => {
        return localStorage.getItem("jwt_token")
    },
}
