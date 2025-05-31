import { fetchWrapper } from "../fetchWrapper"
import {
    Transaction,
    CreateTransactionRequest,
    UpdateTransactionRequest,
    ApiResponse,
} from "./types"

export const transactionAPI = {
    // Get all transactions
    getTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
        try {
            const response = await fetchWrapper.get("/api/transaction")
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to fetch transactions",
                },
            }
        }
    },

    // Get transaction by ID
    getTransactionById: async (
        id: number
    ): Promise<ApiResponse<Transaction>> => {
        try {
            const response = await fetchWrapper.get(`/api/transaction/${id}`)
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to fetch transaction",
                },
            }
        }
    },

    // Create new transaction
    createTransaction: async (
        transactionData: CreateTransactionRequest
    ): Promise<ApiResponse<Transaction>> => {
        try {
            const response = await fetchWrapper.post(
                "/api/transaction",
                transactionData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to create transaction",
                },
            }
        }
    },

    // Update transaction
    updateTransaction: async (
        id: number,
        transactionData: UpdateTransactionRequest
    ): Promise<ApiResponse<Transaction>> => {
        try {
            const response = await fetchWrapper.put(
                `/api/transaction/${id}`,
                transactionData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to update transaction",
                },
            }
        }
    },

    // Delete transaction
    deleteTransaction: async (id: number): Promise<ApiResponse<void>> => {
        try {
            await fetchWrapper.del(`/api/transaction/${id}`)
            return { data: undefined }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to delete transaction",
                },
            }
        }
    },
}
