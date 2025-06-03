"use client"

import React, { useState, useEffect } from "react"
import {
    Reservation,
    BookCopy,
    Transaction,
    CreateTransactionFromReservationRequest,
} from "@/lib/api/types"
import { reservationAPI } from "@/lib/api/reservationAPI"
import { bookCopyAPI } from "@/lib/api/bookCopyAPI"
import { transactionAPI } from "@/lib/api/transactionAPI"
import { useAuth } from "@/lib/AuthContext"
import {
    BookOpen,
    ArrowRight,
    Package,
    CheckCircle,
    AlertCircle,
    Search,
    Clock,
    User,
    Calendar,
    Tag,
    FileText,
    Settings,
} from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"

function WorkflowAndReservationsPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState("workflow") // "workflow" or "reservations"
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [allReservations, setAllReservations] = useState<Reservation[]>([])
    const [availableBookCopies, setAvailableBookCopies] = useState<BookCopy[]>(
        []
    )
    const [selectedReservation, setSelectedReservation] =
        useState<Reservation | null>(null)
    const [selectedBookCopy, setSelectedBookCopy] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [processingReservation, setProcessingReservation] = useState<
        string | null
    >(null)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        loadReservations()
        loadAvailableBookCopies()
        loadAllReservations()
    }, [])

    const loadReservations = async () => {
        try {
            const result = await reservationAPI.getAll()
            if (Array.isArray(result)) {
                // All returned reservations are active (simplified workflow - no status filtering needed)
                setReservations(result)
                setAllReservations(result) // Store all reservations for the reservations tab
            } else {
                console.error("Failed to load reservations:", result.error)
            }
        } catch (error) {
            console.error("Error loading reservations:", error)
        } finally {
            setLoading(false)
        }
    }

    const loadAllReservations = async () => {
        try {
            const result = await reservationAPI.getAll()
            if (Array.isArray(result)) {
                setAllReservations(result)
            } else {
                console.error("Failed to load all reservations:", result.error)
            }
        } catch (error) {
            console.error("Error loading all reservations:", error)
        }
    }

    const loadAvailableBookCopies = async () => {
        try {
            const result = await bookCopyAPI.getBookCopies()
            if (result.data) {
                // Filter to show only available copies
                const availableCopies = result.data.filter(
                    (copy) => copy.status === "AVAILABLE"
                )
                setAvailableBookCopies(availableCopies)
            } else {
                console.error("Failed to load book copies:", result.error)
            }
        } catch (error) {
            console.error("Error loading book copies:", error)
        }
    }

    const handleAssignCopyToReservation = async (
        reservationId: string,
        bookCopyId: string
    ) => {
        setProcessingReservation(reservationId)

        try {
            const result = await reservationAPI.assignCopy(
                reservationId,
                bookCopyId
            )
            if ("error" in result) {
                alert(`Failed to assign book copy: ${result.error}`)
                return
            }

            alert(
                "Book copy assigned successfully! The reservation is now ready for pickup."
            )
            await loadReservations()
            await loadAvailableBookCopies()
            setSelectedReservation(null)
            setSelectedBookCopy("")
        } catch (error) {
            console.error("Error assigning book copy:", error)
            alert("Failed to assign book copy")
        } finally {
            setProcessingReservation(null)
        }
    }

    const handleCreateTransaction = async (reservation: Reservation) => {
        if (!reservation.bookCopyId) {
            alert("Please assign a book copy to this reservation first")
            return
        }

        if (!user?.id) {
            alert("Librarian information not available")
            return
        }

        setProcessingReservation(reservation.id)

        try {
            // Create transaction from reservation using the new API
            const transactionResult =
                await transactionAPI.createTransactionFromReservation({
                    reservationId: reservation.id,
                    bookCopyId: reservation.bookCopyId,
                })
            if ("error" in transactionResult) {
                alert(
                    `Failed to create transaction: ${
                        transactionResult.error?.error || "Unknown error"
                    }`
                )
                return
            }

            alert(
                "Transaction created successfully! The book has been borrowed."
            )
            await loadReservations()
            await loadAvailableBookCopies()
        } catch (error) {
            console.error("Error creating transaction:", error)
            alert("Failed to create transaction")
        } finally {
            setProcessingReservation(null)
        }
    }

    const filteredReservations = reservations.filter(
        (reservation) =>
            reservation.bookTitle
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            reservation.userName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            reservation.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getAvailableCopiesForBook = (bookTitleId: string) => {
        return availableBookCopies.filter(
            (copy) => copy.bookTitleId === bookTitleId
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center mb-8">
                    <BookOpen className="w-8 h-8 mr-3 text-blue-500" />
                    <h1 className="text-3xl font-bold">
                        Reservations Management
                    </h1>
                </div>
                {/* Tab Navigation */}
                <div className="mb-6">
                    <div className="border-b border-gray-700">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab("workflow")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "workflow"
                                        ? "border-blue-500 text-blue-400"
                                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                                }`}
                            >
                                Active Workflow
                            </button>
                            <button
                                onClick={() => setActiveTab("reservations")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "reservations"
                                        ? "border-blue-500 text-blue-400"
                                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                                }`}
                            >
                                All Reservations
                            </button>
                        </nav>
                    </div>
                </div>
                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by book title, user name, or reservation ID..."
                            className="w-full pl-10 p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>{" "}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : activeTab === "workflow" ? (
                    // Workflow Tab Content
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Active Reservations */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700">
                            <div className="p-6 border-b border-gray-700">
                                <h2 className="text-xl font-semibold flex items-center">
                                    <Clock className="w-5 h-5 mr-2" />
                                    Active Reservations (
                                    {filteredReservations.length})
                                </h2>
                            </div>

                            <div className="p-6">
                                {filteredReservations.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">
                                        No active reservations
                                    </p>
                                ) : (
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {filteredReservations.map(
                                            (reservation) => (
                                                <div
                                                    key={reservation.id}
                                                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                                                        selectedReservation?.id ===
                                                        reservation.id
                                                            ? "border-blue-500 bg-blue-900/20"
                                                            : "border-gray-600 bg-gray-700 hover:bg-gray-600"
                                                    }`}
                                                    onClick={() =>
                                                        setSelectedReservation(
                                                            reservation
                                                        )
                                                    }
                                                >
                                                    {" "}
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-medium">
                                                                {
                                                                    reservation.bookTitle
                                                                }
                                                            </h3>
                                                            <p className="text-gray-400 text-sm">
                                                                User:{" "}
                                                                {
                                                                    reservation.userName
                                                                }
                                                            </p>
                                                            <p className="text-gray-400 text-sm">
                                                                ID:{" "}
                                                                {reservation.id}
                                                            </p>
                                                        </div>
                                                        <span className="px-3 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/10">
                                                            ACTIVE
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-400">
                                                                Reserved:
                                                            </span>
                                                            <span className="ml-2">
                                                                {new Date(
                                                                    reservation.reservationDate
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">
                                                                Expires:
                                                            </span>
                                                            <span className="ml-2">
                                                                {new Date(
                                                                    reservation.expirationDate
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">
                                                                Deposit:
                                                            </span>
                                                            <span className="ml-2 text-green-400">
                                                                {formatCurrency(
                                                                    reservation.deposit
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">
                                                                Available:
                                                            </span>
                                                            <span className="ml-2">
                                                                {
                                                                    reservation.availableCopies
                                                                }
                                                                /
                                                                {
                                                                    reservation.totalCopies
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {reservation.bookCopyId && (
                                                        <div className="mt-3 p-2 bg-green-900/20 rounded border border-green-700">
                                                            <div className="flex items-center">
                                                                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                                                <span className="text-sm">
                                                                    Assigned
                                                                    Copy:{" "}
                                                                    <span className="font-mono">
                                                                        {
                                                                            reservation.bookCopyId
                                                                        }
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {processingReservation ===
                                                        reservation.id && (
                                                        <div className="mt-3 flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                                            <span className="text-sm text-blue-400">
                                                                Processing...
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Workflow Actions */}
                        <div className="bg-gray-800 rounded-lg border border-gray-700">
                            <div className="p-6 border-b border-gray-700">
                                <h2 className="text-xl font-semibold flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Workflow Actions
                                </h2>
                            </div>

                            <div className="p-6">
                                {!selectedReservation ? (
                                    <div className="text-center py-8">
                                        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-400">
                                            Select a reservation to begin the
                                            workflow
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Step 1: Assign Book Copy */}
                                        {!selectedReservation.bookCopyId && (
                                            <div className="p-4 border border-yellow-600 rounded-lg bg-yellow-900/20">
                                                <h3 className="font-medium mb-3 flex items-center">
                                                    <span className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                                                        1
                                                    </span>
                                                    Assign Book Copy
                                                </h3>

                                                <p className="text-gray-300 text-sm mb-4">
                                                    Select an available book
                                                    copy to assign to this
                                                    reservation.
                                                </p>

                                                <div className="space-y-3">
                                                    <select
                                                        value={selectedBookCopy}
                                                        onChange={(e) =>
                                                            setSelectedBookCopy(
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full p-3 rounded border border-gray-600 bg-gray-700 text-white"
                                                    >
                                                        <option value="">
                                                            Select a book
                                                            copy...
                                                        </option>{" "}
                                                        {getAvailableCopiesForBook(
                                                            selectedReservation.bookTitleId
                                                        ).map((copy) => (
                                                            <option
                                                                key={copy.id}
                                                                value={copy.id}
                                                            >
                                                                {copy.id} -{" "}
                                                                {copy.condition}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    <button
                                                        onClick={() =>
                                                            handleAssignCopyToReservation(
                                                                selectedReservation.id,
                                                                selectedBookCopy
                                                            )
                                                        }
                                                        disabled={
                                                            !selectedBookCopy ||
                                                            processingReservation ===
                                                                selectedReservation.id
                                                        }
                                                        className="w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded font-medium transition-colors"
                                                    >
                                                        Assign Copy
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Step 2: Create Transaction */}
                                        {selectedReservation.bookCopyId && (
                                            <div className="p-4 border border-green-600 rounded-lg bg-green-900/20">
                                                <h3 className="font-medium mb-3 flex items-center">
                                                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                                                        2
                                                    </span>
                                                    Create Transaction
                                                </h3>

                                                <p className="text-gray-300 text-sm mb-4">
                                                    Convert this reservation to
                                                    a transaction. The user will
                                                    now have borrowed the book.
                                                </p>

                                                <div className="bg-gray-700 p-3 rounded mb-4">
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-400">
                                                                Book:
                                                            </span>
                                                            <span className="ml-2">
                                                                {
                                                                    selectedReservation.bookTitle
                                                                }
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">
                                                                User:
                                                            </span>
                                                            <span className="ml-2">
                                                                {
                                                                    selectedReservation.userId
                                                                }
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">
                                                                Copy ID:
                                                            </span>
                                                            <span className="ml-2 font-mono">
                                                                {
                                                                    selectedReservation.bookCopyId
                                                                }
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-400">
                                                                Fee:
                                                            </span>
                                                            <span className="ml-2 text-green-400">
                                                                {formatCurrency(
                                                                    selectedReservation.deposit
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        handleCreateTransaction(
                                                            selectedReservation
                                                        )
                                                    }
                                                    disabled={
                                                        processingReservation ===
                                                        selectedReservation.id
                                                    }
                                                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded font-medium transition-colors"
                                                >
                                                    Create Transaction
                                                </button>
                                            </div>
                                        )}

                                        {/* Selected Reservation Details */}
                                        <div className="p-4 border border-gray-600 rounded-lg">
                                            <h3 className="font-medium mb-3 flex items-center">
                                                <User className="w-4 h-4 mr-2" />
                                                Reservation Details
                                            </h3>

                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <span className="text-gray-400">
                                                        ID:
                                                    </span>
                                                    <span className="ml-2 font-mono">
                                                        {selectedReservation.id}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">
                                                        Book:
                                                    </span>
                                                    <span className="ml-2">
                                                        {
                                                            selectedReservation.bookTitle
                                                        }
                                                    </span>
                                                </div>{" "}
                                                <div>
                                                    <span className="text-gray-400">
                                                        Authors:
                                                    </span>
                                                    <span className="ml-2">
                                                        {selectedReservation.bookAuthors?.join(
                                                            ", "
                                                        ) || "Unknown"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">
                                                        User:
                                                    </span>
                                                    <span className="ml-2">
                                                        {
                                                            selectedReservation.userId
                                                        }
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">
                                                        Reserved:
                                                    </span>
                                                    <span className="ml-2">
                                                        {new Date(
                                                            selectedReservation.reservationDate
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">
                                                        Expires:
                                                    </span>
                                                    <span className="ml-2">
                                                        {new Date(
                                                            selectedReservation.expirationDate
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Reservations Tab Content
                    <div className="bg-gray-800 rounded-lg border border-gray-700">
                        <div className="p-6 border-b border-gray-700">
                            <h2 className="text-xl font-semibold flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                All Reservations ({allReservations.length})
                            </h2>
                        </div>

                        <div className="p-6">
                            {allReservations.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">
                                    No reservations found
                                </p>
                            ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {allReservations
                                        .filter(
                                            (reservation) =>
                                                reservation.bookTitle
                                                    .toLowerCase()
                                                    .includes(
                                                        searchTerm.toLowerCase()
                                                    ) ||
                                                reservation.userName
                                                    .toLowerCase()
                                                    .includes(
                                                        searchTerm.toLowerCase()
                                                    ) ||
                                                reservation.id
                                                    .toLowerCase()
                                                    .includes(
                                                        searchTerm.toLowerCase()
                                                    )
                                        )
                                        .map((reservation) => (
                                            <div
                                                key={reservation.id}
                                                className="p-4 rounded-lg border border-gray-600 bg-gray-700"
                                            >
                                                {" "}
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-medium">
                                                            {
                                                                reservation.bookTitle
                                                            }
                                                        </h3>
                                                        <p className="text-gray-400 text-sm">
                                                            Authors:{" "}
                                                            {reservation.bookAuthors?.join(
                                                                ", "
                                                            ) || "Unknown"}
                                                        </p>
                                                        <p className="text-gray-400 text-sm">
                                                            User:{" "}
                                                            {reservation.userId}
                                                        </p>
                                                        <p className="text-gray-400 text-sm">
                                                            ID: {reservation.id}
                                                        </p>
                                                    </div>
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/10">
                                                        ACTIVE
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-400">
                                                            Reserved:
                                                        </span>
                                                        <span className="ml-2">
                                                            {new Date(
                                                                reservation.reservationDate
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">
                                                            Expires:
                                                        </span>
                                                        <span className="ml-2">
                                                            {new Date(
                                                                reservation.expirationDate
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">
                                                            Deposit:
                                                        </span>
                                                        <span className="ml-2 text-green-400">
                                                            {formatCurrency(
                                                                reservation.deposit
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">
                                                            {/* availableCopies/totalCopies removed, not in Reservation type */}
                                                        </span>
                                                    </div>
                                                </div>
                                                {reservation.bookCopyId && (
                                                    <div className="mt-3 p-2 bg-green-900/20 rounded border border-green-700">
                                                        <div className="flex items-center">
                                                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                                            <span className="text-sm">
                                                                Assigned Copy:{" "}
                                                                <span className="font-mono">
                                                                    {
                                                                        reservation.bookCopyId
                                                                    }
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ProtectedReservationWorkflowPage() {
    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
            <WorkflowAndReservationsPage />
        </ProtectedRoute>
    )
}
