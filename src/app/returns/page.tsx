"use client"

import React, { useState, useEffect } from "react"
import {
    mockActiveTransactions,
    mockTransactionDetails,
    mockDelay,
} from "@/lib/mockTransaction"
import { Transaction, TransactionDetail } from "@/lib/api/types"
import ProtectedRoute from "@/components/ProtectedRoute"
import {
    Search,
    Package,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Calendar,
    DollarSign,
    BookOpen,
    User,
    Scan,
    RefreshCw,
} from "lucide-react"

export default function ReturnManagement() {
    // Search states
    const [searchInput, setSearchInput] = useState("")
    const [searchResults, setSearchResults] = useState<Transaction[]>([])
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null)
    const [transactionDetails, setTransactionDetails] = useState<
        TransactionDetail[]
    >([])
    const [pendingReturns, setPendingReturns] = useState<Transaction[]>([])

    // UI states
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    // Return processing state
    const [showAssessmentModal, setShowAssessmentModal] = useState(false)
    const [selectedBookCopy, setSelectedBookCopy] = useState<string>("")
    const [penaltyFee, setPenaltyFee] = useState(0)
    const [damageDescription, setDamageDescription] = useState("")

    useEffect(() => {
        loadPendingReturns()
    }, [])

    const loadPendingReturns = async () => {
        setIsLoading(true)
        try {
            await mockDelay(300) // Simulate API delay
            setPendingReturns(mockActiveTransactions)
            setError("")
        } catch (error) {
            setError("Error loading pending returns")
        } finally {
            setIsLoading(false)
        }
    }

    const searchByBookCopyId = async () => {
        if (!searchInput.trim()) {
            setError("Please enter a book copy ID")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            await mockDelay(300) // Simulate API delay
            const filteredTransactions = mockActiveTransactions.filter(
                (transaction) =>
                    transaction.bookCopyId?.includes(searchInput) ||
                    transaction.id.toString().includes(searchInput)
            )
            setSearchResults(filteredTransactions)
            if (filteredTransactions.length === 0) {
                setError("No active transactions found for this book copy ID")
            }
        } catch (error) {
            setError("Error searching transactions")
        } finally {
            setIsLoading(false)
        }
    }

    const selectTransaction = async (transaction: Transaction) => {
        setSelectedTransaction(transaction)
        setIsLoading(true)
        try {
            await mockDelay(200) // Simulate API delay
            // Load transaction details from mock data
            const details = mockTransactionDetails[transaction.id] || [
                {
                    transactionId: transaction.id,
                    penaltyFee: transaction.penaltyFee || 0,
                    description: "",
                },
            ]
            setTransactionDetails(details)
        } catch (error) {
            setError("Error loading transaction details")
        } finally {
            setIsLoading(false)
        }
    }

    const openAssessmentModal = (bookCopyId: string) => {
        setSelectedBookCopy(bookCopyId)
        setPenaltyFee(0)
        setDamageDescription("")
        setShowAssessmentModal(true)
    }

    const approveReturn = async () => {
        if (!selectedTransaction || !selectedBookCopy) return

        setIsLoading(true)
        setError("")

        try {
            await mockDelay(500) // Simulate API delay

            // Simulate successful return approval
            console.log("Approving return:", {
                transactionId: selectedTransaction.id,
                bookCopyId: selectedBookCopy,
                penaltyFee: penaltyFee > 0 ? penaltyFee : 0,
                description: damageDescription || undefined,
            })

            setSuccessMessage("Return approved successfully!")
            setShowAssessmentModal(false)

            // Refresh data - remove the returned transaction from pending
            const updatedPendingReturns = mockActiveTransactions.filter(
                (t) => t.id !== selectedTransaction.id
            )
            setPendingReturns(updatedPendingReturns)

            // Clear selection
            setSelectedTransaction(null)
            setTransactionDetails([])
            setSearchResults([])
            setSearchInput("")
        } catch (error) {
            setError("Error approving return")
        } finally {
            setIsLoading(false)
        }
    }

    const handleScanCode = () => {
        // Mock barcode scanning - would integrate with actual scanner
        const mockScannedCode = "BCP001"
        setSearchInput(mockScannedCode)
        // Auto search after scanning
        setTimeout(() => {
            searchByBookCopyId()
        }, 500)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const isOverdue = (dueDate: string) => {
        return new Date(dueDate) < new Date()
    }

    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-100 mb-8">
                    Return Management
                </h1>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded mb-4">
                        {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Search & Selected Transaction */}
                    <div className="space-y-6">
                        {/* Search Section */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                                <Search className="w-5 h-5 mr-2" />
                                Search Transaction
                            </h2>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Book Copy ID or Transaction ID"
                                        value={searchInput}
                                        onChange={(e) =>
                                            setSearchInput(e.target.value)
                                        }
                                        className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                        onKeyPress={(e) =>
                                            e.key === "Enter" &&
                                            searchByBookCopyId()
                                        }
                                    />
                                    <button
                                        onClick={searchByBookCopyId}
                                        disabled={isLoading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleScanCode}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                                        title="Scan Barcode"
                                    >
                                        <Scan className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium text-gray-300">
                                            Search Results:
                                        </h3>
                                        {searchResults.map((transaction) => (
                                            <div
                                                key={transaction.id}
                                                onClick={() =>
                                                    selectTransaction(
                                                        transaction
                                                    )
                                                }
                                                className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-gray-100 font-medium">
                                                            {
                                                                transaction.bookTitle
                                                            }
                                                        </p>
                                                        <p className="text-gray-400 text-sm">
                                                            Copy:{" "}
                                                            {
                                                                transaction.bookCopyId
                                                            }{" "}
                                                            • User:{" "}
                                                            {
                                                                transaction.userName
                                                            }
                                                        </p>
                                                    </div>
                                                    {isOverdue(
                                                        transaction.dueDate ||
                                                            ""
                                                    ) && (
                                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selected Transaction Details */}
                        {selectedTransaction && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Transaction Details
                                </h2>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-gray-400 text-sm">
                                                Book Title
                                            </label>
                                            <p className="text-gray-100 font-medium">
                                                {selectedTransaction.bookTitle}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-gray-400 text-sm">
                                                Book Copy ID
                                            </label>
                                            <p className="text-gray-100 font-medium">
                                                {selectedTransaction.bookCopyId}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-gray-400 text-sm">
                                                Borrower
                                            </label>
                                            <p className="text-gray-100 font-medium">
                                                {selectedTransaction.userName}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-gray-400 text-sm">
                                                Borrow Date
                                            </label>
                                            <p className="text-gray-100 font-medium">
                                                {formatDate(
                                                    selectedTransaction.borrowDate
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-gray-400 text-sm">
                                                Due Date
                                            </label>
                                            <p
                                                className={`font-medium ${
                                                    isOverdue(
                                                        selectedTransaction.dueDate ||
                                                            ""
                                                    )
                                                        ? "text-red-400"
                                                        : "text-gray-100"
                                                }`}
                                            >
                                                {formatDate(
                                                    selectedTransaction.dueDate ||
                                                        ""
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-gray-400 text-sm">
                                                Current Penalty
                                            </label>
                                            <p className="text-gray-100 font-medium">
                                                {formatCurrency(
                                                    selectedTransaction.penaltyFee ||
                                                        0
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {isOverdue(
                                        selectedTransaction.dueDate || ""
                                    ) && (
                                        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded">
                                            <div className="flex items-center">
                                                <AlertTriangle className="w-5 h-5 mr-2" />
                                                <span className="font-medium">
                                                    Book is overdue!
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() =>
                                            openAssessmentModal(
                                                selectedTransaction.bookCopyId ||
                                                    ""
                                            )
                                        }
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Process Return
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Pending Returns */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-100 flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                Pending Returns
                            </h2>
                            <button
                                onClick={loadPendingReturns}
                                disabled={isLoading}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 ${
                                        isLoading ? "animate-spin" : ""
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {pendingReturns.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    onClick={() =>
                                        selectTransaction(transaction)
                                    }
                                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                                        selectedTransaction?.id ===
                                        transaction.id
                                            ? "bg-blue-600/20 border border-blue-500"
                                            : "bg-gray-700 hover:bg-gray-600"
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <BookOpen className="w-4 h-4 text-blue-400" />
                                                <h3 className="text-gray-100 font-medium">
                                                    {transaction.bookTitle}
                                                </h3>
                                                {isOverdue(
                                                    transaction.dueDate || ""
                                                ) && (
                                                    <AlertTriangle className="w-4 h-4 text-red-400" />
                                                )}
                                            </div>
                                            <div className="mt-1 space-y-1">
                                                <div className="flex items-center text-gray-400 text-sm">
                                                    <User className="w-3 h-3 mr-1" />
                                                    {transaction.userName}
                                                </div>
                                                <div className="flex items-center text-gray-400 text-sm">
                                                    <Package className="w-3 h-3 mr-1" />
                                                    Copy:{" "}
                                                    {transaction.bookCopyId}
                                                </div>
                                                <div className="flex items-center text-gray-400 text-sm">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    Due:{" "}
                                                    {formatDate(
                                                        transaction.dueDate ||
                                                            ""
                                                    )}
                                                </div>
                                                {(transaction.penaltyFee || 0) >
                                                    0 && (
                                                    <div className="flex items-center text-red-400 text-sm">
                                                        <DollarSign className="w-3 h-3 mr-1" />
                                                        Penalty:{" "}
                                                        {formatCurrency(
                                                            transaction.penaltyFee ||
                                                                0
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {pendingReturns.length === 0 && !isLoading && (
                                <div className="text-center py-8 text-gray-400">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No pending returns</p>
                                </div>
                            )}

                            {isLoading && (
                                <div className="text-center py-8 text-gray-400">
                                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" />
                                    <p>Loading...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Assessment Modal */}
                {showAssessmentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-xl font-semibold text-gray-100 mb-4">
                                Book Return Assessment
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">
                                        Book Copy ID
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedBookCopy}
                                        readOnly
                                        className="w-full bg-gray-700 text-gray-100 rounded-lg px-4 py-2 border border-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">
                                        Book Condition
                                    </label>
                                    <select
                                        onChange={(e) => {
                                            const value = e.target.value
                                            if (value === "damaged") {
                                                setPenaltyFee(50000) // 50,000 VND for damage
                                            } else if (value === "lost") {
                                                setPenaltyFee(200000) // 200,000 VND for lost book
                                            } else {
                                                setPenaltyFee(0)
                                            }
                                        }}
                                        className="w-full bg-gray-700 text-gray-100 rounded-lg px-4 py-2 border border-gray-600"
                                    >
                                        <option value="good">
                                            Good Condition
                                        </option>
                                        <option value="damaged">
                                            Damaged (50,000 VND penalty)
                                        </option>
                                        <option value="lost">
                                            Lost (200,000 VND penalty)
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">
                                        Additional Penalty (VND)
                                    </label>
                                    <input
                                        type="number"
                                        value={penaltyFee}
                                        onChange={(e) =>
                                            setPenaltyFee(
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full bg-gray-700 text-gray-100 rounded-lg px-4 py-2 border border-gray-600"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">
                                        Description/Notes
                                    </label>
                                    <textarea
                                        value={damageDescription}
                                        onChange={(e) =>
                                            setDamageDescription(e.target.value)
                                        }
                                        placeholder="Describe any damage or issues..."
                                        className="w-full bg-gray-700 text-gray-100 rounded-lg px-4 py-2 border border-gray-600 h-20 resize-none"
                                    />
                                </div>

                                <div className="bg-gray-700 rounded-lg p-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">
                                            Late Fee:
                                        </span>
                                        <span className="text-gray-100">
                                            {formatCurrency(
                                                selectedTransaction?.penaltyFee ||
                                                    0
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">
                                            Damage Fee:
                                        </span>
                                        <span className="text-gray-100">
                                            {formatCurrency(penaltyFee)}
                                        </span>
                                    </div>
                                    <hr className="border-gray-600 my-2" />
                                    <div className="flex justify-between font-medium">
                                        <span className="text-gray-100">
                                            Total:
                                        </span>
                                        <span className="text-gray-100">
                                            {formatCurrency(
                                                (selectedTransaction?.penaltyFee ||
                                                    0) + penaltyFee
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() =>
                                        setShowAssessmentModal(false)
                                    }
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                </button>
                                <button
                                    onClick={approveReturn}
                                    disabled={isLoading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {isLoading
                                        ? "Processing..."
                                        : "Approve Return"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
