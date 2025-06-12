"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
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
    const { user, isAdmin, isLibrarian } = useAuth()
    const [transactions, setTransactions] = useState<TransactionWithUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const isStaff = isAdmin() || isLibrarian()

    useEffect(() => {
        const loadTransactions = async () => {
            try {
                setLoading(true)
                setError(null)

                let transactionData: Transaction[] = []
                let users: User[] = []

                if (isStaff) {
                    // Staff can see all transactions
                    transactionData = await getAllTransactions()
                    users = await getAllUsers()
                    // Debug: Log transactions with returnedDate that shouldn't be displayed
                    const returnedTransactions = transactionData.filter(
                        (trans) => trans.returnedDate !== null
                    )
                    if (returnedTransactions.length > 0) {
                        console.log(
                            "Found transactions with returnedDate:",
                            returnedTransactions
                        )
                    }
                } else {
                    // Regular users see only their transactions
                    transactionData = await getMyTransactions()
                }

                // Create transactions with user data
                const transactionsWithUsers: TransactionWithUser[] =
                    transactionData
                        .filter((transaction) => {
                            // Only include transactions that don't have a returnedDate
                            // or where returnedDate is null or empty string
                            return (
                                !transaction.returnedDate ||
                                transaction.returnedDate === ""
                            )
                        })
                        .map((transaction) => {
                            const transactionWithUser: TransactionWithUser = {
                                transaction,
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
    }, [isStaff]) // Filter transactions based on search
    const filteredTransactions = transactions.filter((item) => {
        const matchesSearch = isStaff
            ? item.user?.name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
              item.user?.cccd.includes(searchTerm) ||
              item.transaction.id.includes(searchTerm)
            : item.transaction.id.includes(searchTerm)

        return matchesSearch
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
            {/* Search Controls */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder={
                        isStaff
                            ? "🔍 Search by ID, User Name, or CCCD..."
                            : "🔍 Search by Transaction ID..."
                    }
                    className="w-64 p-2 rounded border border-gray-700 bg-gray-800 text-gray-300 placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>{" "}
            {/* Transactions Table */}
            <div className="overflow-x-auto bg-gray-900 rounded">
                <table className="w-full text-left text-white bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-4">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">Transaction ID</th>
                            {isStaff && <th className="px-4 py-3">User</th>}
                            {isStaff && <th className="px-4 py-3">CCCD</th>}
                            <th className="px-4 py-3">Borrow Date</th>
                            <th className="px-4 py-3">Due Date</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((item) => (
                                <tr
                                    key={item.transaction.id}
                                    className="border-t border-gray-700 hover:bg-gray-750"
                                >
                                    <td className="px-4 py-3 text-blue-300 font-mono">
                                        {item.transaction.id}
                                    </td>
                                    {isStaff && (
                                        <td className="px-4 py-3 text-gray-300">
                                            {item.user?.name || "Unknown User"}
                                        </td>
                                    )}
                                    {isStaff && (
                                        <td className="px-4 py-3 text-gray-400 font-mono">
                                            {item.user?.cccd || "N/A"}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-gray-300">
                                        {new Date(
                                            item.transaction.borrowDate
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">
                                        {new Date(
                                            item.transaction.dueDate
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/transactions/${item.transaction.userId}/details`}
                                            className="text-blue-400 hover:text-blue-300 mr-3"
                                        >
                                            View Details
                                        </Link>
                                        {isStaff && (
                                            <button
                                                className="text-red-400 hover:text-red-300"
                                                onClick={() => {
                                                    // Add transaction management functionality
                                                    console.log(
                                                        "Manage transaction:",
                                                        item.transaction.id
                                                    )
                                                }}
                                            >
                                                Manage
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={isStaff ? 6 : 4}
                                    className="px-4 py-3 text-center text-gray-400"
                                >
                                    {searchTerm
                                        ? "No matching transactions found."
                                        : isStaff
                                        ? "No transactions found in the system."
                                        : "You have no transactions."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Summary Card */}
            <div className="mt-6 bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-3">Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">
                            Total Transactions
                        </p>{" "}
                        <p className="text-2xl font-bold text-white">
                            {filteredTransactions.length}
                        </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">Overdue</p>
                        <p className="text-2xl font-bold text-red-400">
                            {
                                filteredTransactions.filter(
                                    (t) =>
                                        new Date(t.transaction.dueDate) <
                                        new Date()
                                ).length
                            }
                        </p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                        <p className="text-gray-400 text-sm">
                            Due Soon (7 days)
                        </p>
                        <p className="text-2xl font-bold text-yellow-400">
                            {
                                filteredTransactions.filter((t) => {
                                    const dueDate = new Date(
                                        t.transaction.dueDate
                                    )
                                    const now = new Date()
                                    const sevenDaysFromNow = new Date(
                                        now.getTime() + 7 * 24 * 60 * 60 * 1000
                                    )
                                    return (
                                        dueDate >= now &&
                                        dueDate <= sevenDaysFromNow
                                    )
                                }).length
                            }
                        </p>
                    </div>
                </div>
            </div>
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
