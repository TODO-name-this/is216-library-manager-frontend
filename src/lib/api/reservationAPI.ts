import { fetchWrapper } from "../fetchWrapper"
import type {
    Reservation,
    ApiError,
    CreateReservationRequest,
    UpdateReservationRequest,
} from "./types"

export const reservationAPI = {
    // Get all reservations (ADMIN, LIBRARIAN only)
    getAll: async (): Promise<Reservation[] | ApiError> => {
        try {
            const response = await fetchWrapper.get("/reservation")
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to fetch reservations",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while fetching reservations" }
        }
    }, // Get current user's reservations (authenticated users)
    getMy: async (): Promise<Reservation[] | ApiError> => {
        try {
            const response = await fetchWrapper.get("/reservation/my")
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to fetch your reservations",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while fetching your reservations" }
        }
    }, // Get reservation by ID (ADMIN, LIBRARIAN, USER)
    getById: async (id: string): Promise<Reservation | ApiError> => {
        try {
            const response = await fetchWrapper.get(`/reservation/${id}`)
            if (response.error) {
                return {
                    error:
                        response.error.message || "Failed to fetch reservation",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while fetching reservation" }
        }
    },

    // Get reservation by ID (ADMIN, LIBRARIAN, USER) - alias for consistency
    getReservationById: async (id: string): Promise<Reservation | ApiError> => {
        try {
            const response = await fetchWrapper.get(`/reservation/${id}`)
            if (response.error) {
                return {
                    error:
                        response.error.message || "Failed to fetch reservation",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while fetching reservation" }
        }
    },

    // Get reservations by user ID (ADMIN, LIBRARIAN, USER)
    getReservationsByUserId: async (
        userId: string
    ): Promise<Reservation[] | ApiError> => {
        try {
            const response = await fetchWrapper.get(
                `/reservation/user/${userId}`
            )
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to fetch user reservations",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while fetching user reservations" }
        }
    },

    // Get reservations by book copy ID (ADMIN, LIBRARIAN)
    getReservationsByBookCopyId: async (
        bookCopyId: string
    ): Promise<Reservation[] | ApiError> => {
        try {
            const response = await fetchWrapper.get(
                `/reservation/bookCopy/${bookCopyId}`
            )
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to fetch book copy reservations",
                }
            }
            return response
        } catch (error) {
            return {
                error: "Network error while fetching book copy reservations",
            }
        }
    },

    // Create new reservation (USER)
    create: async (
        reservationData: CreateReservationRequest
    ): Promise<Reservation | ApiError> => {
        try {
            const response = await fetchWrapper.post(
                "/reservation",
                reservationData
            )
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to create reservation",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while creating reservation" }
        }
    },

    // Create new reservation (USER) - alias for consistency
    createReservation: async (
        reservationData: CreateReservationRequest
    ): Promise<Reservation | ApiError> => {
        try {
            const response = await fetchWrapper.post(
                "/reservation",
                reservationData
            )
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to create reservation",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while creating reservation" }
        }
    }, // Update reservation (ADMIN, LIBRARIAN, USER)
    update: async (
        id: string,
        reservationData: UpdateReservationRequest
    ): Promise<Reservation | ApiError> => {
        try {
            const response = await fetchWrapper.put(
                `/reservation/${id}`,
                reservationData
            )
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to update reservation",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while updating reservation" }
        }
    }, // Update reservation (ADMIN, LIBRARIAN, USER) - alias for consistency
    updateReservation: async (
        id: string,
        reservationData: UpdateReservationRequest
    ): Promise<Reservation | ApiError> => {
        try {
            const response = await fetchWrapper.put(
                `/reservation/${id}`,
                reservationData
            )
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to update reservation",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while updating reservation" }
        }
    }, // Update reservation status (ADMIN, LIBRARIAN)
    updateReservationStatus: async (
        id: string,
        status: string
    ): Promise<Reservation | ApiError> => {
        try {
            const response = await fetchWrapper.patch(`/reservation/${id}`, {
                status,
            })
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to update reservation status",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while updating reservation status" }
        }
    },

    // Partial update reservation (ADMIN, LIBRARIAN, USER)
    partialUpdate: async (
        id: string,
        reservationData: Partial<UpdateReservationRequest>
    ): Promise<Reservation | ApiError> => {
        try {
            const response = await fetchWrapper.patch(
                `/reservation/${id}`,
                reservationData
            )
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to update reservation",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while updating reservation" }
        }
    }, // Delete reservation (ADMIN, LIBRARIAN)
    delete: async (id: string): Promise<string | ApiError> => {
        try {
            const response = await fetchWrapper.del(`/reservation/${id}`)
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to delete reservation",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while deleting reservation" }
        }
    }, // Delete reservation (ADMIN, LIBRARIAN) - alias for consistency
    deleteReservation: async (id: string): Promise<string | ApiError> => {
        try {
            const response = await fetchWrapper.del(`/reservation/${id}`)
            if (response.error) {
                return {
                    error:
                        response.error.message ||
                        "Failed to delete reservation",
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while deleting reservation" }
        }
    },    // Assign book copy to reservation (ADMIN, LIBRARIAN)
    assignCopy: async (reservationId: string, bookCopyId: string): Promise<Reservation | ApiError> => {
        try {
            const response = await fetchWrapper.post(`/reservation/${reservationId}/assign-copy`, {
                bookCopyId
            })
            if (response.error) {
                return {
                    error: response.error.message || "Failed to assign book copy to reservation"
                }
            }
            return response
        } catch (error) {
            return { error: "Network error while assigning book copy" }
        }
    },

    // Convert reservation to transaction - helper method
    convertToTransaction: async (reservationId: string, bookCopyId: string): Promise<any | ApiError> => {
        try {
            // First, assign the book copy to the reservation
            const assignResult = await reservationAPI.assignCopy(reservationId, bookCopyId)
            if ('error' in assignResult) {
                return assignResult
            }

            // Then update reservation status to COMPLETED
            const updateResult = await reservationAPI.updateReservation(reservationId, {
                status: "COMPLETED"
            })
            if ('error' in updateResult) {
                return updateResult
            }

            return { success: true, reservation: updateResult }
        } catch (error) {
            return { error: "Network error while converting reservation to transaction" }
        }
    },
}
