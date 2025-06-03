import { fetchWrapper } from "../fetchWrapper"
import type {
    LoginRequest,
    LoginResponse,
    ApiError,
    DecodedToken,
} from "./types"

// JWT decoding utility
const decodeJWT = (token: string): DecodedToken | null => {
    try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(function (c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                })
                .join("")
        )
        return JSON.parse(jsonPayload)
    } catch (error) {
        console.error("Error decoding JWT:", error)
        return null
    }
}

export const authAPI = {
    // Login
    login: async (
        credentials: LoginRequest
    ): Promise<LoginResponse | ApiError> => {
        try {
            const response = await fetchWrapper.post(
                "/auth/login",
                credentials,
                false
            )
            if (response.error) {
                return { error: response.error.message || "Login failed" }
            }

            // Store both tokens in localStorage
            if (response.accessToken && response.refreshToken) {
                localStorage.setItem("access_token", response.accessToken)
                localStorage.setItem("refresh_token", response.refreshToken)

                // Decode and store user info
                const decodedToken = decodeJWT(response.accessToken)
                if (decodedToken) {
                    const userInfo = {
                        id: decodedToken.sub,
                        cccd: credentials.cccd,
                        role: decodedToken.role,
                        name: credentials.cccd, // You might want to fetch full name from another endpoint
                    }
                    localStorage.setItem("user_info", JSON.stringify(userInfo))
                }
            }

            return response
        } catch (error) {
            return { error: "Network error during login" }
        }
    }, // Test authentication (requires JWT)
    testAuth: async (): Promise<string | ApiError> => {
        try {
            const response = await fetchWrapper.get("/auth/test")
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
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user_info")
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem("access_token")
        if (!token) return false

        const decoded = decodeJWT(token)
        if (!decoded) return false

        // Check if token is expired
        return decoded.exp * 1000 > Date.now()
    },

    // Get current access token
    getToken: (): string | null => {
        return localStorage.getItem("access_token")
    },

    // Get refresh token
    getRefreshToken: (): string | null => {
        return localStorage.getItem("refresh_token")
    },

    // Decode current token
    getCurrentUser: (): DecodedToken | null => {
        const token = localStorage.getItem("access_token")
        if (!token) return null
        return decodeJWT(token)
    },

    // Check if token needs refresh (expires within 5 minutes)
    needsRefresh: (): boolean => {
        const token = localStorage.getItem("access_token")
        if (!token) return false

        const decoded = decodeJWT(token)
        if (!decoded) return false

        // Refresh if token expires within 5 minutes
        return decoded.exp * 1000 - Date.now() < 5 * 60 * 1000
    },
}

