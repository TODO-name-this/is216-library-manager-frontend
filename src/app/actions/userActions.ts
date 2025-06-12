"use client"

import { userAPI } from "@/lib/api"
import type {
    User,
    CreateUserRequest,
    UpdateUserRequest,
} from "@/lib/api/types"

export async function getAllUsers(): Promise<User[]> {
    try {
        const response = await userAPI.getUsers()
        if (response.error) {
            console.error("Failed to fetch users:", response.error)
            return []
        }
        return response.data || []
    } catch (error) {
        console.error("Error fetching users:", error)
        throw error
    }
}

export async function getUserById(id: string): Promise<User | null> {
    try {
        const response = await userAPI.getUserById(id)
        if (response.error) {
            console.error("Failed to fetch user:", response.error)
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error fetching user:", error)
        throw error
    }
}

export async function createUser(
    userData: CreateUserRequest
): Promise<User | null> {
    try {
        const response = await userAPI.createUser(userData)
        if (response.error) {
            console.error("Failed to create user:", response.error)
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error creating user:", error)
        throw error
    }
}

export async function updateUser(
    id: string,
    userData: UpdateUserRequest
): Promise<User | null> {
    try {
        const response = await userAPI.updateUser(id, userData)
        if (response.error) {
            console.error("Failed to update user:", response.error)
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error updating user:", error)
        throw error
    }
}

export async function deleteUser(id: string): Promise<boolean> {
    try {
        const response = await userAPI.deleteUser(id)
        if (response.error) {
            console.error("Failed to delete user:", response.error)
            return false
        }
        return true
    } catch (error) {
        console.error("Error deleting user:", error)
        throw error
    }
}
