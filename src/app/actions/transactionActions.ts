"use client"

import { transactionAPI } from "@/lib/api"
import type {
    Transaction,
    CreateTransactionRequest,
    UpdateTransactionRequest,
} from "@/lib/api/types"

export async function getAllTransactions(): Promise<Transaction[]> {
    try {
        const response = await transactionAPI.getTransactions()
        if (response.error) {
            console.error("Failed to fetch transactions:", response.error)
            return []
        }
        return response.data || []
    } catch (error) {
        console.error("Error fetching transactions:", error)
        throw error
    }
}

export async function getTransactionById(
    id: number
): Promise<Transaction | null> {
    try {
        const response = await transactionAPI.getTransactionById(id)
        if (response.error) {
            console.error("Failed to fetch transaction:", response.error)
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error fetching transaction:", error)
        throw error
    }
}

export async function createTransaction(
    transactionData: CreateTransactionRequest
): Promise<Transaction | null> {
    try {
        const response = await transactionAPI.createTransaction(transactionData)
        if (response.error) {
            console.error("Failed to create transaction:", response.error)
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error creating transaction:", error)
        throw error
    }
}

export async function updateTransaction(
    id: number,
    transactionData: UpdateTransactionRequest
): Promise<Transaction | null> {
    try {
        const response = await transactionAPI.updateTransaction(
            id,
            transactionData
        )
        if (response.error) {
            console.error("Failed to update transaction:", response.error)
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error updating transaction:", error)
        throw error
    }
}

export async function deleteTransaction(id: number): Promise<boolean> {
    try {
        const response = await transactionAPI.deleteTransaction(id)
        if (response.error) {
            console.error("Failed to delete transaction:", response.error)
            return false
        }
        return true
    } catch (error) {
        console.error("Error deleting transaction:", error)
        throw error
    }
}

// Note: The following methods are not available in the current API:
// - getTransactionsByUserId
// - getTransactionsByBookCopyId
// - updateTransactionStatus
// If needed, these would require backend endpoint implementations
