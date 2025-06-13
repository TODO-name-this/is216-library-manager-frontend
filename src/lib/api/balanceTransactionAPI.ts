import { fetchWrapper } from "../fetchWrapper"
import { ApiResponse, BalanceTransaction } from "./types"

export const balanceTransactionAPI = {
    // Get current user's balance transactions
    async getMyBalanceTransactions(): Promise<
        ApiResponse<BalanceTransaction[]>
    > {
        try {
            const response = await fetchWrapper.get("/balance-transactions/my")
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error:
                        error.message || "Failed to fetch balance transactions",
                },
            }
        }
    },

    // Get balance transactions for a specific user (ADMIN/LIBRARIAN only)
    async getUserBalanceTransactions(
        userId: string
    ): Promise<ApiResponse<BalanceTransaction[]>> {
        try {
            const response = await fetchWrapper.get(
                `/balance-transactions/user/${userId}`
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error:
                        error.message ||
                        "Failed to fetch user balance transactions",
                },
            }
        }
    },

    // Get all balance transactions (ADMIN only)
    async getAllBalanceTransactions(): Promise<
        ApiResponse<BalanceTransaction[]>
    > {
        try {
            const response = await fetchWrapper.get("/balance-transactions")
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error:
                        error.message ||
                        "Failed to fetch all balance transactions",
                },
            }
        }
    },

    // Create deposit for a user (ADMIN/LIBRARIAN only)
    async createDeposit(
        userId: string,
        amount: number,
        description?: string
    ): Promise<ApiResponse<BalanceTransaction>> {
        try {
            const params = new URLSearchParams({
                userId,
                amount: amount.toString(),
            })

            if (description) {
                params.append("description", description)
            }

            const response = await fetchWrapper.post(
                `/balance-transactions/deposit?${params.toString()}`,
                {}
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to create deposit",
                },
            }
        }
    },

    // Create withdrawal for a user (ADMIN/LIBRARIAN only)
    async createWithdrawal(
        userId: string,
        amount: number,
        description?: string
    ): Promise<ApiResponse<BalanceTransaction>> {
        try {
            const params = new URLSearchParams({
                userId,
                amount: amount.toString(),
            })

            if (description) {
                params.append("description", description)
            }

            const response = await fetchWrapper.post(
                `/balance-transactions/withdrawal?${params.toString()}`,
                {}
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to create withdrawal",
                },
            }
        }
    },
}
