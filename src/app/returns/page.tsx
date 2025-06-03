"use client"

import { useState, useEffect } from "react"
import { transactionAPI } from "@/lib/api/transactionAPI"
import { bookCopyAPI } from "@/lib/api/bookCopyAPI"
import { Transaction, TransactionDetail, BookCopy } from "@/lib/api/types"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ReturnsPage() {
    const [pendingReturns, setPendingReturns] = useState<Transaction[]>([])
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
    const [transactionDetails, setTransactionDetails] = useState<TransactionDetail[]>([])
    const [bookCopyIdInput, setBookCopyIdInput] = useState("")
    const [searchResults, setSearchResults] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    // Assessment modal state
    const [showAssessmentModal, setShowAssessmentModal] = useState(false)
    const [selectedBookCopy, setSelectedBookCopy] = useState<string>("")
    const [penaltyFee, setPenaltyFee] = useState<number>(0)
    const [damageDescription, setDamageDescription] = useState("")

    useEffect(() => {
        loadPendingReturns()
    }, [])

    const loadPendingReturns = async () => {
        setIsLoading(true)
        try {
            const response = await transactionAPI.getPendingReturns()
            if (response.data) {
                setPendingReturns(response.data)
            } else {
                setError(response.error?.error || "Failed to load pending returns")
            }
        } catch (error) {
            setError("Error loading pending returns")
        } finally {
            setIsLoading(false)
        }
    }

    const searchByBookCopyId = async () => {
        if (!bookCopyIdInput.trim()) {
            setError("Please enter a book copy ID")
            return
        }

        setIsLoading(true)
        setError("")
        
        try {
            const response = await transactionAPI.getByBookCopyId(bookCopyIdInput)
            if (response.data) {
                setSearchResults(response.data)
                if (response.data.length === 0) {
                    setError("No active transactions found for this book copy ID")
                }
            } else {
                setError(response.error?.error || "Failed to search transactions")
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
            const response = await transactionAPI.getTransactionDetails(transaction.id)
            if (response.data) {
                setTransactionDetails(response.data)
            } else {
                setError(response.error?.error || "Failed to load transaction details")
            }
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
            const response = await transactionAPI.approveReturn(
                selectedTransaction.id,
                selectedBookCopy,
                {
                    penaltyFee: penaltyFee > 0 ? penaltyFee : undefined,
                    description: damageDescription || undefined
                }
            )
            
            if (response.data) {
                setSuccessMessage("Return approved successfully!")
                setShowAssessmentModal(false)
                
                // Refresh data
                await loadPendingReturns()
                if (selectedTransaction) {
                    await selectTransaction(selectedTransaction)
                }
            } else {
                setError(response.error?.error || "Failed to approve return")
            }
        } catch (error) {
            setError("Error approving return")        } finally {
            setIsLoading(false)
        }
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

                {/* Search by Book Copy ID */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">
                        Search by Book Copy ID
                    </h2>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Enter book copy ID..."
                            value={bookCopyIdInput}
                            onChange={(e) => setBookCopyIdInput(e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={searchByBookCopyId}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            {isLoading ? "Searching..." : "Search"}
                        </button>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-medium text-gray-100 mb-3">Search Results</h3>
                            <div className="space-y-2">
                                {searchResults.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        onClick={() => selectTransaction(transaction)}
                                        className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg cursor-pointer transition-colors"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-gray-100 font-medium">
                                                    Transaction #{transaction.id.slice(0, 8)}
                                                </span>
                                                <span className="text-gray-400 ml-2">
                                                    • {transaction.userName || "Unknown User"}
                                                </span>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                transaction.status === "BORROWED" 
                                                    ? "bg-yellow-500/20 text-yellow-300"
                                                    : transaction.status === "OVERDUE"
                                                    ? "bg-red-500/20 text-red-300"
                                                    : "bg-green-500/20 text-green-300"
                                            }`}>
                                                {transaction.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pending Returns */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">
                        Pending Returns ({pendingReturns.length})
                    </h2>
                    
                    {pendingReturns.length === 0 ? (
                        <p className="text-gray-400">No pending returns</p>
                    ) : (
                        <div className="space-y-3">
                            {pendingReturns.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    onClick={() => selectTransaction(transaction)}
                                    className={`bg-gray-700 hover:bg-gray-600 p-4 rounded-lg cursor-pointer transition-colors border-l-4 ${
                                        selectedTransaction?.id === transaction.id 
                                            ? "border-blue-500 bg-gray-600" 
                                            : "border-transparent"
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="text-gray-100 font-medium">
                                                {transaction.userName || "Unknown User"}
                                            </span>
                                            <span className="text-gray-400 ml-2">
                                                • Due: {new Date(transaction.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                new Date(transaction.dueDate) < new Date()
                                                    ? "bg-red-500/20 text-red-300"
                                                    : "bg-yellow-500/20 text-yellow-300"
                                            }`}>
                                                {new Date(transaction.dueDate) < new Date() ? "OVERDUE" : "PENDING"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Transaction Details */}
                {selectedTransaction && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-100 mb-4">
                            Transaction Details - {selectedTransaction.userName}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-100 mb-2">Transaction Info</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Transaction ID:</span>
                                        <span className="text-gray-100">{selectedTransaction.id.slice(0, 8)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Issue Date:</span>
                                        <span className="text-gray-100">{new Date(selectedTransaction.issueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Due Date:</span>
                                        <span className="text-gray-100">{new Date(selectedTransaction.dueDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Status:</span>
                                        <span className="text-gray-100">{selectedTransaction.status}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-medium text-gray-100 mb-2">Book Copies</h3>
                                {selectedTransaction.bookCopyIds && selectedTransaction.bookCopyIds.length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedTransaction.bookCopyIds.map((copyId) => (
                                            <div key={copyId} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                                                <span className="text-gray-100 font-mono text-sm">{copyId}</span>
                                                <button
                                                    onClick={() => openAssessmentModal(copyId)}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                                >
                                                    Approve Return
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm">No book copies listed</p>
                                )}
                            </div>
                        </div>

                        {/* Transaction Details */}
                        {transactionDetails.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-100 mb-3">Return History</h3>
                                <div className="space-y-3">
                                    {transactionDetails.map((detail) => (
                                        <div key={`${detail.transactionId}-${detail.bookCopyId}`} className="bg-gray-700 p-4 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-gray-100 font-medium">{detail.bookTitle || detail.bookCopyId}</div>
                                                    <div className="text-gray-400 text-sm">Copy ID: {detail.bookCopyId}</div>
                                                    {detail.returnedDate && (
                                                        <div className="text-gray-400 text-sm">
                                                            Returned: {new Date(detail.returnedDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                    {detail.description && (
                                                        <div className="text-gray-300 text-sm mt-2 p-2 bg-gray-600 rounded">
                                                            {detail.description}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    {detail.penaltyFee > 0 && (
                                                        <span className="text-red-300 font-medium">
                                                            Penalty: ${detail.penaltyFee}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Assessment Modal */}
                {showAssessmentModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-100 mb-4">
                                Assess Return - Copy {selectedBookCopy}
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Penalty Fee (if any)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={penaltyFee}
                                        onChange={(e) => setPenaltyFee(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-300 text-sm font-medium mb-2">
                                        Damage/Condition Description
                                    </label>
                                    <textarea
                                        value={damageDescription}
                                        onChange={(e) => setDamageDescription(e.target.value)}
                                        rows={4}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Describe any damage, wear, or condition issues. Explain why penalty fee is being applied..."
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAssessmentModal(false)}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={approveReturn}
                                    disabled={isLoading}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    {isLoading ? "Processing..." : "Approve Return"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
