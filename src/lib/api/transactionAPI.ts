import { fetchWrapper } from "../fetchWrapper"
import {
    Transaction,
    CreateTransactionRequest,
    UpdateTransactionRequest,
    ApiResponse,
    ApiError,
} from "./types"

export const transactionAPI = {
    // Get all transactions (ADMIN, LIBRARIAN only)
    getAll: async (): Promise<Transaction[] | ApiError> => {
        try {
            const response = await fetchWrapper.get("/transaction")
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to fetch transactions",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while fetching transactions" }
        }
    },

    // Get current user's transactions (authenticated users)
    getMy: async (): Promise<Transaction[] | ApiError> => {
        try {
            const response = await fetchWrapper.get("/transaction/my")
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to fetch your transactions",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while fetching your transactions" }
        }
    }, // Get transaction by ID
    getTransactionById: async (
        id: number
    ): Promise<ApiResponse<Transaction>> => {
        try {
            const response = await fetchWrapper.get(`/transaction/${id}`)
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
                "/transaction",
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
    }, // Update transaction
    updateTransaction: async (
        id: number,
        transactionData: UpdateTransactionRequest
    ): Promise<ApiResponse<Transaction>> => {
        try {
            const response = await fetchWrapper.put(
                `/transaction/${id}`,
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
            await fetchWrapper.del(`/transaction/${id}`)
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
