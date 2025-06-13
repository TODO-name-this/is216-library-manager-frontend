"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePageTitle } from "@/lib/usePageTitle"
import {
    getAllTransactions,
    getMyTransactions,
} from "@/app/actions/transactionActions"
import { getAllUsers } from "@/app/actions/userActions"
import { Transaction, User } from "@/lib/api/types"
import { useAuth } from "@/lib/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

interface TransactionWithUser {
    transaction: Transaction
    user?: User
}

function TransactionsPageContent() {
    usePageTitle("Transactions - Scam Library")
    const { user, isAdmin, isLibrarian } = useAuth()
    const [transactions, setTransactions] = useState<TransactionWithUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all") // all, active, completed, overdue
    const [sortBy, setSortBy] = useState<string>("borrowDate") // borrowDate, dueDate, status, penalty
    const [sortOrder, setSortOrder] = useState<string>("desc") // asc, desc

    const isStaff = isAdmin() || isLibrarian()

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                setLoading(true)
                setError(null)

                let transactionData: Transaction[] = []
                let users: User[] = []

                if (isStaff) {
                    // Staff can see ALL transactions
                    transactionData = await getAllTransactions()
                    users = await getAllUsers()
                } else {
                    // Regular users see ALL their transactions (both active and completed)
                    transactionData = await getMyTransactions()
                }

                // Create transactions with user data and calculate status
                const transactionsWithUsers: TransactionWithUser[] =
                    transactionData.map((transaction) => {
                        // Calculate transaction status
                        let status: "BORROWED" | "OVERDUE" | "COMPLETED"
                        if (transaction.returnedDate) {
                            status = "COMPLETED"
                        } else if (
                            new Date(transaction.dueDate || "") < new Date()
                        ) {
                            status = "OVERDUE"
                        } else {
                            status = "BORROWED"
                        }

                        const transactionWithUser: TransactionWithUser = {
                            transaction: {
                                ...transaction,
                                status,
                            },
                        }

                        if (isStaff) {
                            // For staff, include user information
                            const userForTransaction = users.find(
                                (u) => u.id === transaction.userId
                            )
                            transactionWithUser.user = userForTransaction
                        }

                        return transactionWithUser
                    })

                setTransactions(transactionsWithUsers)
            } catch (err) {
                console.error("Error loading transactions:", err)
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load transactions"
                )
            } finally {
                setLoading(false)
            }
        }

        loadTransactions()
    }, [isStaff])

    // Helper functions
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
        })
    }

    const getStatusBadge = (transaction: Transaction) => {
        if (transaction.returnedDate) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500">
                    Returned
                </span>
            )
        } else if (new Date(transaction.dueDate) < new Date()) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500">
                    Overdue
                </span>
            )
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500">
                    Active
                </span>
            )
        }
    }

    const isOverdue = (dueDate: string, returnedDate: string | null) => {
        if (returnedDate) return false
        return new Date(dueDate) < new Date()
    } // Filter and sort transactions
    const filteredAndSortedTransactions = transactions
        .filter((item) => {
            // Search filter
            const matchesSearch = isStaff
                ? item.user?.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  item.user?.cccd?.includes(searchTerm) ||
                  item.transaction.id.includes(searchTerm) ||
                  item.transaction.bookTitle
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())
                : item.transaction.id.includes(searchTerm) ||
                  item.transaction.bookTitle
                      ?.toLowerCase()
                      .includes(searchTerm.toLowerCase())

            // Status filter
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && !item.transaction.returnedDate) ||
                (statusFilter === "completed" &&
                    item.transaction.returnedDate) ||
                (statusFilter === "overdue" &&
                    !item.transaction.returnedDate &&
                    new Date(item.transaction.dueDate || "") < new Date())

            return matchesSearch && matchesStatus
        })
        .sort((a, b) => {
            let aValue: any, bValue: any

            switch (sortBy) {
                case "borrowDate":
                    aValue = new Date(a.transaction.borrowDate)
                    bValue = new Date(b.transaction.borrowDate)
                    break
                case "dueDate":
                    aValue = new Date(a.transaction.dueDate || "")
                    bValue = new Date(b.transaction.dueDate || "")
                    break
                case "status":
                    aValue = a.transaction.status || ""
                    bValue = b.transaction.status || ""
                    break
                case "penalty":
                    aValue = a.transaction.transactionDetail?.penaltyFee || 0
                    bValue = b.transaction.transactionDetail?.penaltyFee || 0
                    break
                case "user":
                    aValue = a.user?.name || ""
                    bValue = b.user?.name || ""
                    break
                default:
                    aValue = a.transaction.borrowDate
                    bValue = b.transaction.borrowDate
            }

            if (sortOrder === "asc") {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

    if (loading) {
        return (
            <main className="p-6 bg-gray-900 text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="mt-2">Loading transactions...</p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="p-6 bg-gray-900 text-white min-h-screen">
                <div className="bg-red-600 text-white p-4 rounded mb-4">
                    <h2 className="font-bold">Error</h2>
                    <p>{error}</p>
                </div>
            </main>
        )
    }

    return (
        <main className="p-6 bg-gray-900 text-white min-h-screen">
            {" "}
            <h1 className="text-3xl font-bold mb-6">
                {isStaff ? "All Transactions" : "My Transactions"}
            </h1>
            {/* Search Controls */} {/* Search and Filter Controls */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <input
                        type="text"
                        placeholder={
                            isStaff
                                ? "🔍 Search by ID, User Name, CCCD, or Book Title..."
                                : "🔍 Search by Transaction ID or Book Title..."
                        }
                        className="flex-1 min-w-64 p-2 rounded border border-gray-700 bg-gray-800 text-gray-300 placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {isStaff && (
                        <>
                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="p-2 rounded border border-gray-700 bg-gray-800 text-gray-300"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="overdue">Overdue</option>
                                <option value="completed">Completed</option>
                            </select>

                            {/* Sort By */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="p-2 rounded border border-gray-700 bg-gray-800 text-gray-300"
                            >
                                <option value="borrowDate">
                                    Sort by Borrow Date
                                </option>
                                <option value="dueDate">
                                    Sort by Due Date
                                </option>
                                <option value="status">Sort by Status</option>
                                <option value="penalty">Sort by Penalty</option>
                                <option value="user">Sort by User</option>
                            </select>

                            {/* Sort Order */}
                            <button
                                onClick={() =>
                                    setSortOrder(
                                        sortOrder === "asc" ? "desc" : "asc"
                                    )
                                }
                                className="p-2 rounded border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                                title={`Sort ${
                                    sortOrder === "asc"
                                        ? "Descending"
                                        : "Ascending"
                                }`}
                            >
                                {sortOrder === "asc" ? "↑" : "↓"}
                            </button>
                        </>
                    )}
                </div>
            </div>{" "}
            {/* Transactions Display */}
            {isStaff ? (
                // Staff view - Enhanced table with all important columns
                <div className="overflow-x-auto bg-gray-900 rounded">
                    {" "}
                    <table className="w-full text-left text-white bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-4">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">Transaction ID</th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-600 select-none"
                                    onClick={() => {
                                        if (sortBy === "user") {
                                            setSortOrder(
                                                sortOrder === "asc"
                                                    ? "desc"
                                                    : "asc"
                                            )
                                        } else {
                                            setSortBy("user")
                                            setSortOrder("asc")
                                        }
                                    }}
                                >
                                    User{" "}
                                    {sortBy === "user" &&
                                        (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th className="px-4 py-3">Book Title</th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-600 select-none"
                                    onClick={() => {
                                        if (sortBy === "status") {
                                            setSortOrder(
                                                sortOrder === "asc"
                                                    ? "desc"
                                                    : "asc"
                                            )
                                        } else {
                                            setSortBy("status")
                                            setSortOrder("asc")
                                        }
                                    }}
                                >
                                    Status{" "}
                                    {sortBy === "status" &&
                                        (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-600 select-none"
                                    onClick={() => {
                                        if (sortBy === "borrowDate") {
                                            setSortOrder(
                                                sortOrder === "asc"
                                                    ? "desc"
                                                    : "asc"
                                            )
                                        } else {
                                            setSortBy("borrowDate")
                                            setSortOrder("desc")
                                        }
                                    }}
                                >
                                    Borrow Date{" "}
                                    {sortBy === "borrowDate" &&
                                        (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-600 select-none"
                                    onClick={() => {
                                        if (sortBy === "dueDate") {
                                            setSortOrder(
                                                sortOrder === "asc"
                                                    ? "desc"
                                                    : "asc"
                                            )
                                        } else {
                                            setSortBy("dueDate")
                                            setSortOrder("asc")
                                        }
                                    }}
                                >
                                    Due Date{" "}
                                    {sortBy === "dueDate" &&
                                        (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th className="px-4 py-3">Return Date</th>
                                <th
                                    className="px-4 py-3 cursor-pointer hover:bg-gray-600 select-none"
                                    onClick={() => {
                                        if (sortBy === "penalty") {
                                            setSortOrder(
                                                sortOrder === "asc"
                                                    ? "desc"
                                                    : "asc"
                                            )
                                        } else {
                                            setSortBy("penalty")
                                            setSortOrder("desc")
                                        }
                                    }}
                                >
                                    Penalty Fee{" "}
                                    {sortBy === "penalty" &&
                                        (sortOrder === "asc" ? "↑" : "↓")}
                                </th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedTransactions.length > 0 ? (
                                filteredAndSortedTransactions.map((item) => (
                                    <tr
                                        key={item.transaction.id}
                                        className="border-t border-gray-700 hover:bg-gray-750"
                                    >
                                        <td className="px-4 py-3 text-blue-300 font-mono">
                                            {item.transaction.id}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-gray-300 font-medium">
                                                    {item.user?.name ||
                                                        "Unknown User"}
                                                </p>
                                                <p className="text-gray-500 text-sm font-mono">
                                                    {item.user?.cccd || "N/A"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-gray-300 font-medium">
                                                    {item.transaction
                                                        .bookTitle ||
                                                        "Unknown Book"}
                                                </p>
                                                <p className="text-gray-500 text-sm">
                                                    Copy ID:{" "}
                                                    {
                                                        item.transaction
                                                            .bookCopyId
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(item.transaction)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">
                                            {formatDate(
                                                item.transaction.borrowDate
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`${
                                                    isOverdue(
                                                        item.transaction
                                                            .dueDate,
                                                        item.transaction
                                                            .returnedDate
                                                    )
                                                        ? "text-red-400 font-medium"
                                                        : "text-gray-300"
                                                }`}
                                            >
                                                {formatDate(
                                                    item.transaction.dueDate
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">
                                            {item.transaction.returnedDate
                                                ? formatDate(
                                                      item.transaction
                                                          .returnedDate
                                                  )
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.transaction.transactionDetail
                                                ?.penaltyFee &&
                                            item.transaction.transactionDetail
                                                .penaltyFee > 0 ? (
                                                <span className="text-red-400 font-medium">
                                                    {formatCurrency(
                                                        item.transaction
                                                            .transactionDetail
                                                            .penaltyFee
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/transactions/${item.transaction.userId}/details`}
                                                    className="text-blue-400 hover:text-blue-300 text-sm"
                                                >
                                                    Details
                                                </Link>
                                                {!item.transaction
                                                    .returnedDate && (
                                                    <Link
                                                        href="/returns"
                                                        className="text-green-400 hover:text-green-300 text-sm"
                                                    >
                                                        Return
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-8 text-center text-gray-400"
                                    >
                                        No transactions found
                                        {searchTerm && (
                                            <div className="text-sm text-gray-500 mt-2">
                                                Try adjusting your search terms
                                                or filters
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                // User view - Detailed card layout
                <div className="space-y-4">
                    {filteredAndSortedTransactions.length > 0 ? (
                        filteredAndSortedTransactions.map((item) => (
                            <div
                                key={item.transaction.id}
                                className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-1">
                                            {item.transaction.bookTitle ||
                                                "Book Title"}
                                        </h3>
                                        <p className="text-gray-400 text-sm font-mono">
                                            Transaction ID:{" "}
                                            {item.transaction.id}
                                        </p>
                                        <p className="text-gray-400 text-sm font-mono">
                                            Book Copy ID:{" "}
                                            {item.transaction.bookCopyId}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(item.transaction)}
                                        {item.transaction.bookPrice && (
                                            <p className="text-gray-400 text-sm mt-2">
                                                Book Price:{" "}
                                                {formatCurrency(
                                                    item.transaction.bookPrice
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Borrow Date
                                        </p>
                                        <p className="text-white font-medium">
                                            {formatDate(
                                                item.transaction.borrowDate
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Due Date
                                        </p>
                                        <p
                                            className={`font-medium ${
                                                isOverdue(
                                                    item.transaction.dueDate,
                                                    item.transaction
                                                        .returnedDate
                                                )
                                                    ? "text-red-400"
                                                    : "text-white"
                                            }`}
                                        >
                                            {formatDate(
                                                item.transaction.dueDate
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Return Date
                                        </p>
                                        <p className="text-white font-medium">
                                            {item.transaction.returnedDate
                                                ? formatDate(
                                                      item.transaction
                                                          .returnedDate
                                                  )
                                                : "Not returned yet"}
                                        </p>
                                    </div>
                                </div>

                                {/* Transaction Details */}
                                {item.transaction.transactionDetail && (
                                    <div className="border-t border-gray-700 pt-4">
                                        <h4 className="text-white font-medium mb-2">
                                            Transaction Details
                                        </h4>
                                        {item.transaction.transactionDetail
                                            .penaltyFee > 0 && (
                                            <div className="mb-2">
                                                <span className="text-red-400 font-medium">
                                                    Penalty Fee:{" "}
                                                    {formatCurrency(
                                                        item.transaction
                                                            .transactionDetail
                                                            .penaltyFee
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {item.transaction.transactionDetail
                                            .description && (
                                            <div className="bg-gray-700 rounded p-3">
                                                <p className="text-gray-300 text-sm">
                                                    {
                                                        item.transaction
                                                            .transactionDetail
                                                            .description
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Overdue warning */}
                                {isOverdue(
                                    item.transaction.dueDate,
                                    item.transaction.returnedDate
                                ) && (
                                    <div className="border-t border-gray-700 pt-4">
                                        <div className="bg-red-500/20 border border-red-500 rounded p-3">
                                            <p className="text-red-400 text-sm font-medium">
                                                ⚠️ This book is overdue! Late
                                                fees may apply (5,000 VND per
                                                day).
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
                            <p className="text-gray-400">
                                No transactions found
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                                {searchTerm
                                    ? "Try adjusting your search terms"
                                    : "You haven't borrowed any books yet"}
                            </p>{" "}
                        </div>
                    )}
                </div>
            )}
        </main>
    )
}

export default function TransactionsPage() {
    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN", "USER"]}>
            <TransactionsPageContent />
        </ProtectedRoute>
    )
}
