"use client"

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react"
import { authAPI } from "@/lib/api"
import { User } from "@/lib/api/types"

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (cccd: string, password: string) => Promise<boolean>
    logout: () => void
    checkAuthStatus: () => Promise<void>
    hasRole: (role: string | string[]) => boolean
    isAdmin: () => boolean
    isLibrarian: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const isAuthenticated = !!user

    const checkAuthStatus = async () => {
        setIsLoading(true)
        try {
            if (!authAPI.isAuthenticated()) {
                setUser(null)
                return
            }

            // Get user info from localStorage or decode from token
            const userInfo = localStorage.getItem("user_info")
            const currentUser = authAPI.getCurrentUser()

            if (userInfo && currentUser) {
                const parsedUser = JSON.parse(userInfo)
                setUser({
                    id: currentUser.sub,
                    cccd: parsedUser.cccd,
                    name: parsedUser.name,
                    role: currentUser.role,
                    email: parsedUser.email || "",
                    balance: parsedUser.balance || 0,
                })
            } else {
                // Token invalid or expired
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
            if (typeof response !== "string" && "accessToken" in response) {
                // Successfully logged in, check auth status to update user state
                await checkAuthStatus()
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

    // Role checking utilities
    const hasRole = (role: string | string[]): boolean => {
        if (!user) return false
        if (Array.isArray(role)) {
            return role.includes(user.role)
        }
        return user.role === role
    }

    const isAdmin = (): boolean => {
        return hasRole("ADMIN")
    }

    const isLibrarian = (): boolean => {
        return hasRole(["ADMIN", "LIBRARIAN"])
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
        hasRole,
        isAdmin,
        isLibrarian,
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
