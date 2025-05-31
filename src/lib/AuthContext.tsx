"use client"

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react"
import { authAPI } from "@/lib/api"

interface User {
    id: number
    username: string
    email: string
    role: string
    name: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (username: string, password: string) => Promise<boolean>
    logout: () => void
    checkAuthStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const isAuthenticated = !!user

    const checkAuthStatus = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem("jwt_token")
            if (!token) {
                setUser(null)
                return
            }

            // Test if token is still valid by making a test call
            const response = await authAPI.testAuth()
            if (typeof response !== "string" && "data" in response) {
                // You would typically decode the JWT token to get user info
                // For now, we'll store user info in localStorage when logging in
                const userInfo = localStorage.getItem("user_info")
                if (userInfo) {
                    setUser(JSON.parse(userInfo))
                }
            } else {
                authAPI.logout()
                setUser(null)
            }
        } catch (error) {
            console.error("Auth check failed:", error)
            authAPI.logout()
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (cccd: string, password: string): Promise<boolean> => {
        try {
            const response = await authAPI.login({ cccd, password })
            if (typeof response === "string") {
                // Handle token directly
                localStorage.setItem("jwt_token", response)
                const userInfo = {
                    id: 1, // Replace with actual user ID from decoded token
                    username: cccd,
                    email: `${cccd}@example.com`,
                    role: "USER",
                    name: cccd,
                }
                localStorage.setItem("user_info", JSON.stringify(userInfo))
                setUser(userInfo)
                return true
            }
            return false
        } catch (error) {
            console.error("Login failed:", error)
            return false
        }
    }

    const logout = () => {
        authAPI.logout()
        setUser(null)
    }

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuthStatus,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
