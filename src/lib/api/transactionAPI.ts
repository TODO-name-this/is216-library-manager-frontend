import { fetchWrapper } from "../fetchWrapper"
import {
    Transaction,
    CreateTransactionRequest,
    CreateTransactionFromReservationRequest,
    UpdateTransactionRequest,
    ApiResponse,
    ApiError,
    TransactionDetail,
    CreateTransactionDetailRequest,
    CreateReturnRequest,
    CreateTransactionDto,
    ReturnBookDto,
    ReturnBookResponseDto,
} from "./types"

// Helper function to calculate transaction status and penalty
const enrichTransaction = (transaction: any): Transaction => {
    const now = new Date()
    const dueDate = new Date(transaction.dueDate)

    let status: "BORROWED" | "OVERDUE" | "COMPLETED"
    let penaltyFee = 0

    if (transaction.returnedDate) {
        status = "COMPLETED"
    } else if (dueDate < now) {
        status = "OVERDUE"
    } else {
        status = "BORROWED"
    }

    // Extract penalty fee from transactionDetail if available
    if (transaction.transactionDetail?.penaltyFee) {
        penaltyFee = transaction.transactionDetail.penaltyFee
    }

    return {
        ...transaction,
        status,
        penaltyFee,
    }
}

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
            // Enrich each transaction with calculated status and penalty
            const enrichedTransactions = response.map(enrichTransaction)
            return enrichedTransactions
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
            // Enrich each transaction with calculated status and penalty
            const enrichedTransactions = response.map(enrichTransaction)
            return enrichedTransactions
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
    }, // Create new transaction
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
    },

    // Create transaction from reservation
    createTransactionFromReservation: async (
        requestData: CreateTransactionFromReservationRequest
    ): Promise<ApiResponse<Transaction>> => {
        try {
            const response = await fetchWrapper.post(
                "/transaction/from-reservation",
                requestData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error:
                        error.message ||
                        "Failed to create transaction from reservation",
                },
            }
        }
    }, // Return a book (update returnedDate)
    returnBook: async (
        id: string,
        returnData: UpdateTransactionRequest
    ): Promise<ApiResponse<Transaction>> => {
        try {
            const response = await fetchWrapper.put(
                `/transaction/${id}`,
                returnData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: { error: error.message || "Failed to return book" },
            }
        }
    }, // RETURN WORKFLOW FUNCTIONS

    // Get active transactions (borrowed books)
    getActiveBorrows: async (): Promise<ApiResponse<Transaction[]>> => {
        try {
            const response = await fetchWrapper.get("/transaction/active")
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to fetch active borrows",
                },
            }
        }
    },

    // Get overdue transactions
    getOverdueTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
        try {
            const response = await fetchWrapper.get("/transaction/overdue")
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error:
                        error.message || "Failed to fetch overdue transactions",
                },
            }
        }
    },

    createTransactionDetail: async (
        transactionDetailData: CreateTransactionDetailRequest
    ): Promise<ApiResponse<TransactionDetail>> => {
        try {
            const response = await fetchWrapper.post(
                "/transaction-detail",
                transactionDetailData
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

    // Approve return workflow
    approveReturn: async (
        transactionId: string,
        bookCopyId: string,
        returnData: CreateReturnRequest
    ): Promise<ApiResponse<Transaction>> => {
        try {
            const response = await fetchWrapper.post(
                `/transaction/${transactionId}/return/${bookCopyId}`,
                returnData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to approve return",
                },
            }
        }
    },

    // NEW: Borrow book (create transaction with new DTO)
    borrowBook: async (
        borrowData: CreateTransactionDto
    ): Promise<ApiResponse<Transaction>> => {
        try {
            const response = await fetchWrapper.post("/transaction", borrowData)
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to borrow book",
                },
            }
        }
    },

    // NEW: Return book with new DTO
    returnBookWithCondition: async (
        transactionId: string,
        returnData: ReturnBookDto
    ): Promise<ApiResponse<ReturnBookResponseDto>> => {
        try {
            const response = await fetchWrapper.put(
                `/transaction/${transactionId}/return`,
                returnData
            )
            return { data: response }
        } catch (error: any) {
            return {
                error: {
                    error: error.message || "Failed to return book",
                },
            }
        }
    },
}
