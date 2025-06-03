"use client"

import { transactionAPI } from "@/lib/api"
import { transactionDetailAPI } from "@/lib/api/transactionDetailAPI"
import type {
    Transaction,
    TransactionDetail,
    CreateTransactionRequest,
    CreateTransactionFromReservationRequest,
    UpdateTransactionRequest,
    CreateTransactionDetailRequest,
} from "@/lib/api/types"

export async function getAllTransactions(): Promise<Transaction[]> {
    try {
        const response = await transactionAPI.getAll()
        if ("error" in response) {
            console.error("Failed to fetch transactions:", response.error)
            return []
        }
        return response || []
    } catch (error) {
        console.error("Error fetching transactions:", error)
        throw error
    }
}

export async function getMyTransactions(): Promise<Transaction[]> {
    try {
        const response = await transactionAPI.getMy()
        if ("error" in response) {
            console.error("Failed to fetch your transactions:", response.error)
            return []
        }
        return response || []
    } catch (error) {
        console.error("Error fetching your transactions:", error)
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

export async function createTransactionFromReservation(
    transactionData: CreateTransactionFromReservationRequest
): Promise<Transaction | null> {
    try {
        const response = await transactionAPI.createTransactionFromReservation(
            transactionData
        )
        if (response.error) {
            console.error(
                "Failed to create transaction from reservation:",
                response.error
            )
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error creating transaction from reservation:", error)
        throw error
    }
}

export async function returnBook(
    id: string,
    returnData: UpdateTransactionRequest
): Promise<Transaction | null> {
    try {
        const response = await transactionAPI.returnBook(id, returnData)
        if (response.error) {
            console.error("Failed to return book:", response.error)
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error returning book:", error)
        throw error
    }
}

export async function getActiveBorrows(): Promise<Transaction[]> {
    try {
        const response = await transactionAPI.getActiveBorrows()
        if (response.error) {
            console.error("Failed to fetch active borrows:", response.error)
            return []
        }
        return response.data || []
    } catch (error) {
        console.error("Error fetching active borrows:", error)
        throw error
    }
}

export async function getOverdueTransactions(): Promise<Transaction[]> {
    try {
        const response = await transactionAPI.getOverdueTransactions()
        if (response.error) {
            console.error(
                "Failed to fetch overdue transactions:",
                response.error
            )
            return []
        }
        return response.data || []
    } catch (error) {
        console.error("Error fetching overdue transactions:", error)
        throw error
    }
}

export async function createTransactionDetail(
    detailData: CreateTransactionDetailRequest
): Promise<TransactionDetail | null> {
    try {
        const response = await transactionDetailAPI.create(detailData)
        if (response.error) {
            console.error(
                "Failed to create transaction detail:",
                response.error
            )
            return null
        }
        return response.data || null
    } catch (error) {
        console.error("Error creating transaction detail:", error)
        throw error
    }
}
