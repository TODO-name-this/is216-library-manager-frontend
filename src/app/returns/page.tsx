"use client"

import React, { useState, useEffect } from "react"
import { usePageTitle } from "@/lib/usePageTitle"
import { transactionAPI } from "@/lib/api/transactionAPI"
import { Transaction, TransactionDetail, ReturnBookDto } from "@/lib/api/types"
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
    usePageTitle("Return Management - Scam Library");
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
    const [bookCondition, setBookCondition] = useState<
        "NEW" | "GOOD" | "WORN" | "DAMAGED"
    >("GOOD")
    const [additionalPenaltyFee, setAdditionalPenaltyFee] = useState(0)
    const [damageDescription, setDamageDescription] = useState("")
    const [isBookLost, setIsBookLost] = useState(false)

    useEffect(() => {
        loadPendingReturns()
    }, [])

    const loadPendingReturns = async () => {
        setIsLoading(true)
        try {
            const response = await transactionAPI.getAll()
            if (Array.isArray(response)) {
                // Filter for borrowed and overdue transactions
                const activeTransactions = response.filter(
                    (transaction) =>
                        transaction.status === "BORROWED" ||
                        transaction.status === "OVERDUE"
                )
                setPendingReturns(activeTransactions)
                setError("")
            } else {
                setError(response.error || "Failed to load transactions")
            }
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
            const response = await transactionAPI.getAll()
            if (Array.isArray(response)) {
                const filteredTransactions = response.filter(
                    (transaction) =>
                        (transaction.status === "BORROWED" ||
                            transaction.status === "OVERDUE") &&
                        (transaction.bookCopyId?.includes(searchInput) ||
                            transaction.id.toString().includes(searchInput))
                )
                setSearchResults(filteredTransactions)
                if (filteredTransactions.length === 0) {
                    setError(
                        "No active transactions found for this book copy ID"
                    )
                }
            } else {
                setError("Failed to search transactions")
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
            // For now, just set basic transaction details
            // In a real app, you might fetch additional details from a separate API
            const details: TransactionDetail[] = [
                {
                    transactionId: transaction.id,
                    penaltyFee: transaction.penaltyFee || 0,
                    description:
                        transaction.transactionDetail?.description || "",
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
        resetAssessmentForm()
        setSelectedBookCopy(bookCopyId)
        setShowAssessmentModal(true)
    }

    const approveReturn = async () => {
        if (!selectedTransaction || !selectedBookCopy) return

        setIsLoading(true)
        setError("")

        try {
            const returnData: ReturnBookDto = {
                returnedDate: new Date().toISOString().split("T")[0], // Today's date
                bookCondition: bookCondition, // Keep the selected condition as-is
                description: isBookLost
                    ? `Book lost - replacement fee: ${formatCurrency(
                          selectedTransaction.bookPrice || 0
                      )}${
                          damageDescription
                              ? `. Additional notes: ${damageDescription}`
                              : ""
                      }`
                    : damageDescription || undefined,
                additionalPenaltyFee: isBookLost
                    ? 0 // Server handles book price deduction automatically when isLost=true
                    : additionalPenaltyFee > 0
                    ? additionalPenaltyFee
                    : 0,
            }

            const response = await transactionAPI.returnBookWithCondition(
                selectedTransaction.id,
                returnData,
                isBookLost
            )

            if (response.data) {
                setSuccessMessage(
                    `Return processed successfully! ${
                        response.data.message || ""
                    }`
                )
                setShowAssessmentModal(false)
                resetAssessmentForm()

                // Refresh the pending returns list
                await loadPendingReturns()

                // Clear selection
                setSelectedTransaction(null)
                setTransactionDetails([])
                setSearchResults([])
                setSearchInput("")
            } else {
                setError(response.error?.error || "Failed to process return")
            }
        } catch (error) {
            setError("Error processing return")
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

    const calculateLateFee = (dueDate: string, bookPrice: number = 0) => {
        if (!isOverdue(dueDate)) return 0
        const today = new Date()
        const due = new Date(dueDate)
        const diffTime = Math.abs(today.getTime() - due.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const uncappedLateFee = diffDays * 5000 // 5,000 VND per day        // Cap the late fee at the book price
        return Math.min(uncappedLateFee, bookPrice)
    }

    const getTotalBill = () => {
        if (!selectedTransaction) return 0
        const bookPrice = selectedTransaction.bookPrice || 0

        if (isBookLost) {
            // If book is lost, penalty fee is the book price + late fee
            const lateFee = calculateLateFee(
                selectedTransaction.dueDate || "",
                bookPrice
            )
            return lateFee + bookPrice
        } else {
            // Normal return with condition assessment
            const lateFee = calculateLateFee(
                selectedTransaction.dueDate || "",
                bookPrice
            )
            const penaltyFee = additionalPenaltyFee
            return lateFee + penaltyFee
        }
    }

    const resetAssessmentForm = () => {
        setBookCondition("GOOD")
        setAdditionalPenaltyFee(0)
        setDamageDescription("")
        setIsBookLost(false)
        setSelectedBookCopy("")
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
                </div>{" "}
                {/* Assessment Modal */}
                {showAssessmentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
                            <div className="p-6 border-b border-gray-700">
                                <h3 className="text-xl font-semibold text-gray-100">
                                    Book Return Assessment
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-4">
                                    {" "}
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
                                    {/* Book Lost Checkbox */}
                                    <div className="border border-red-500 rounded-lg p-4 bg-red-500/10">
                                        <label className="flex items-center space-x-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isBookLost}
                                                onChange={(e) => {
                                                    setIsBookLost(
                                                        e.target.checked
                                                    )
                                                    if (e.target.checked) {
                                                        // Reset penalty fields when book is lost
                                                        setAdditionalPenaltyFee(
                                                            0
                                                        )
                                                        setDamageDescription("")
                                                    } else {
                                                        setAdditionalPenaltyFee(
                                                            0
                                                        )
                                                    }
                                                }}
                                                className="h-4 w-4 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                                            />
                                            <div>
                                                <span className="text-red-400 font-medium">
                                                    Book is Lost
                                                </span>
                                                <p className="text-gray-400 text-xs mt-1">
                                                    Check this if the book copy
                                                    is completely lost. Penalty
                                                    will be set to the book
                                                    price:{" "}
                                                    {selectedTransaction
                                                        ? formatCurrency(
                                                              selectedTransaction.bookPrice ||
                                                                  0
                                                          )
                                                        : "N/A"}
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">
                                            Book Condition
                                        </label>
                                        <select
                                            value={bookCondition}
                                            onChange={(e) => {
                                                const value = e.target.value as
                                                    | "NEW"
                                                    | "GOOD"
                                                    | "WORN"
                                                    | "DAMAGED"
                                                setBookCondition(value)
                                            }}
                                            disabled={isBookLost}
                                            className={`w-full rounded-lg px-4 py-2 border ${
                                                isBookLost
                                                    ? "bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed"
                                                    : "bg-gray-700 text-gray-100 border-gray-600"
                                            }`}
                                        >
                                            <option value="NEW">
                                                New Condition
                                            </option>
                                            <option value="GOOD">
                                                Good Condition
                                            </option>
                                            <option value="WORN">
                                                Worn Condition
                                            </option>{" "}
                                            <option value="DAMAGED">
                                                Damaged
                                            </option>
                                        </select>
                                    </div>{" "}
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">
                                            Additional Penalty (VND)
                                            {isBookLost && (
                                                <span className="text-red-400 ml-2">
                                                    (Disabled - Book replacement
                                                    cost applied)
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                isBookLost
                                                    ? 0
                                                    : additionalPenaltyFee
                                            }
                                            onChange={(e) =>
                                                setAdditionalPenaltyFee(
                                                    Number(e.target.value)
                                                )
                                            }
                                            disabled={isBookLost}
                                            className={`w-full rounded-lg px-4 py-2 border ${
                                                isBookLost
                                                    ? "bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed"
                                                    : "bg-gray-700 text-gray-100 border-gray-600"
                                            }`}
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">
                                            Description/Notes
                                            {isBookLost && (
                                                <span className="text-red-400 ml-2">
                                                    (Optional - Additional
                                                    details about the loss)
                                                </span>
                                            )}
                                        </label>
                                        <textarea
                                            value={damageDescription}
                                            onChange={(e) =>
                                                setDamageDescription(
                                                    e.target.value
                                                )
                                            }
                                            placeholder={
                                                isBookLost
                                                    ? "Additional details about how the book was lost (optional)..."
                                                    : "Describe any damage or issues..."
                                            }
                                            className="w-full bg-gray-700 text-gray-100 rounded-lg px-4 py-2 border border-gray-600 h-20 resize-none"
                                        />
                                    </div>{" "}
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <h4 className="text-lg font-semibold text-gray-100 mb-3 flex items-center">
                                            <DollarSign className="w-5 h-5 mr-2" />
                                            Total Bill
                                        </h4>{" "}
                                        <div className="space-y-2">
                                            {selectedTransaction &&
                                                selectedTransaction.bookPrice && (
                                                    <div className="flex justify-between text-xs text-gray-500">
                                                        <span>
                                                            Book Price{" "}
                                                            {isBookLost
                                                                ? "(Replacement Cost)"
                                                                : "(Late Fee Cap)"}
                                                            :
                                                        </span>
                                                        <span>
                                                            {formatCurrency(
                                                                selectedTransaction.bookPrice
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">
                                                    Late Fee (
                                                    {selectedTransaction &&
                                                    isOverdue(
                                                        selectedTransaction.dueDate ||
                                                            ""
                                                    )
                                                        ? Math.ceil(
                                                              Math.abs(
                                                                  new Date().getTime() -
                                                                      new Date(
                                                                          selectedTransaction.dueDate ||
                                                                              ""
                                                                      ).getTime()
                                                              ) /
                                                                  (1000 *
                                                                      60 *
                                                                      60 *
                                                                      24)
                                                          )
                                                        : 0}{" "}
                                                    days × 5,000 VND, capped at
                                                    book price):
                                                </span>
                                                <span className="text-gray-100">
                                                    {formatCurrency(
                                                        selectedTransaction
                                                            ? calculateLateFee(
                                                                  selectedTransaction.dueDate ||
                                                                      "",
                                                                  selectedTransaction.bookPrice ||
                                                                      0
                                                              )
                                                            : 0
                                                    )}
                                                </span>
                                            </div>

                                            {isBookLost ? (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-red-400">
                                                        Book Replacement Cost:
                                                    </span>
                                                    <span className="text-red-400 font-semibold">
                                                        {formatCurrency(
                                                            selectedTransaction?.bookPrice ||
                                                                0
                                                        )}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">
                                                        Damage/Condition
                                                        Penalty:
                                                    </span>
                                                    <span className="text-gray-100">
                                                        {formatCurrency(
                                                            additionalPenaltyFee
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            <hr className="border-gray-600 my-2" />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span className="text-gray-100">
                                                    Total Amount Due:
                                                </span>
                                                <span
                                                    className={
                                                        isBookLost
                                                            ? "text-red-400"
                                                            : "text-yellow-400"
                                                    }
                                                >
                                                    {formatCurrency(
                                                        getTotalBill()
                                                    )}
                                                </span>
                                            </div>

                                            {getTotalBill() > 0 && (
                                                <div
                                                    className={`mt-2 text-sm rounded p-2 ${
                                                        isBookLost
                                                            ? "text-red-300 bg-red-500/20 border border-red-500"
                                                            : "text-yellow-300 bg-yellow-500/20 border border-yellow-500"
                                                    }`}
                                                >
                                                    {isBookLost ? "📚" : "⚠️"}{" "}
                                                    Customer will be charged{" "}
                                                    {formatCurrency(
                                                        getTotalBill()
                                                    )}{" "}
                                                    {isBookLost
                                                        ? "for book replacement + late fees"
                                                        : "for this return"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-700">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => {
                                            setShowAssessmentModal(false)
                                            resetAssessmentForm()
                                        }}
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
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
