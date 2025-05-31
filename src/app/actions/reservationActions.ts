"use client"

import { reservationAPI } from "@/lib/api"
import type {
    Reservation,
    CreateReservationRequest,
    UpdateReservationRequest,
} from "@/lib/api/types"

export async function getAllReservations(): Promise<Reservation[]> {
    try {
        const response = await reservationAPI.getReservations()
        if ("error" in response) {
            console.error("Failed to fetch reservations:", response.error)
            return []
        }
        return response
    } catch (error) {
        console.error("Error fetching reservations:", error)
        throw error
    }
}

export async function getReservationById(
    id: number
): Promise<Reservation | null> {
    try {
        const response = await reservationAPI.getReservationById(id.toString())
        if ("error" in response) {
            console.error("Failed to fetch reservation:", response.error)
            return null
        }
        return response
    } catch (error) {
        console.error("Error fetching reservation by ID:", error)
        throw error
    }
}

export async function getReservationsByUserId(
    userId: number
): Promise<Reservation[]> {
    try {
        const response = await reservationAPI.getReservationsByUserId(
            userId.toString()
        )
        if ("error" in response) {
            console.error("Failed to fetch user reservations:", response.error)
            return []
        }
        return response
    } catch (error) {
        console.error("Error fetching reservations for user:", error)
        throw error
    }
}

export async function createReservation(
    reservationData: CreateReservationRequest
): Promise<Reservation | null> {
    try {
        const response = await reservationAPI.createReservation(reservationData)
        if ("error" in response) {
            console.error("Failed to create reservation:", response.error)
            return null
        }
        return response
    } catch (error) {
        console.error("Error creating reservation:", error)
        throw error
    }
}

export async function updateReservation(
    id: number,
    reservationData: UpdateReservationRequest
): Promise<Reservation | null> {
    try {
        const response = await reservationAPI.updateReservation(
            id.toString(),
            reservationData
        )
        if ("error" in response) {
            console.error("Failed to update reservation:", response.error)
            return null
        }
        return response
    } catch (error) {
        console.error("Error updating reservation:", error)
        throw error
    }
}

export async function updateReservationStatus(
    id: number,
    status: string
): Promise<Reservation | null> {
    try {
        const response = await reservationAPI.updateReservationStatus(
            id.toString(),
            status
        )
        if ("error" in response) {
            console.error(
                "Failed to update reservation status:",
                response.error
            )
            return null
        }
        return response
    } catch (error) {
        console.error("Error updating reservation status:", error)
        throw error
    }
}

export async function deleteReservation(id: number): Promise<boolean> {
    try {
        const response = await reservationAPI.deleteReservation(id.toString())
        if (typeof response === "object" && "error" in response) {
            console.error("Failed to delete reservation:", response.error)
            return false
        }
        return true
    } catch (error) {
        console.error("Error deleting reservation:", error)
        throw error
    }
}

// Note: getReservationsByBookCopyId is not available in the current API
// If needed, this would require a backend endpoint implementation
