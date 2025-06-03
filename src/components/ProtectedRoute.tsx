"use client"

import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, ReactNode } from "react"

interface ProtectedRouteProps {
    children: ReactNode
    requiredRole?: "ADMIN" | "LIBRARIAN" | "USER" | string[]
    fallbackPath?: string
}

export default function ProtectedRoute({
    children,
    requiredRole,
    fallbackPath = "/login",
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user, hasRole } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push(fallbackPath)
                return
            }

            // Check role requirements
            if (requiredRole) {
                if (!hasRole(requiredRole)) {
                    router.push("/") // Redirect to home if insufficient permissions
                    return
                }
            }
        }
    }, [
        isAuthenticated,
        isLoading,
        user,
        requiredRole,
        router,
        hasRole,
        fallbackPath,
    ])

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-lg">Loading...</div>
            </div>
        )
    }

    // Show nothing while redirecting
    if (!isAuthenticated) {
        return null
    }

    // Check role requirements
    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">
                        Access Denied
                    </h1>
                    <p className="text-gray-300">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
