import { fetchWrapper } from "../fetchWrapper"
import {
    TransactionDetail,
    CreateTransactionDetailRequest,
    UpdateTransactionDetailRequest,
    ApiResponse,
} from "./types"

export const transactionDetailAPI = {
    // Get transaction detail by transaction ID
    getByTransactionId: async (
        transactionId: string
    ): Promise<ApiResponse<TransactionDetail>> => {
        try {
            const response = await fetchWrapper.get(
                `/transaction-detail/${transactionId}`
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error:
                        error.message || "Failed to fetch transaction detail",
                },
            }
        }
    },

    // Create transaction detail (penalty)
    create: async (
        detailData: CreateTransactionDetailRequest
    ): Promise<ApiResponse<TransactionDetail>> => {
        try {
            const response = await fetchWrapper.post(
                "/transaction-detail",
                detailData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error:
                        error.message || "Failed to create transaction detail",
                },
            }
        }
    },

    // Update transaction detail
    update: async (
        transactionId: string,
        updateData: UpdateTransactionDetailRequest
    ): Promise<ApiResponse<TransactionDetail>> => {
        try {
            const response = await fetchWrapper.put(
                `/transaction-detail/${transactionId}`,
                updateData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error:
                        error.message || "Failed to update transaction detail",
                },
            }
        }
    },

    // Delete transaction detail
    delete: async (transactionId: string): Promise<ApiResponse<void>> => {
        try {
            await fetchWrapper.del(`/transaction-detail/${transactionId}`)
            return { data: undefined }
        } catch (error: any) {
            return {
                error: {
                    error:
                        error.message || "Failed to delete transaction detail",
                },
            }
        }
    },
}
