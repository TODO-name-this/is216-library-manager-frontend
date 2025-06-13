"use client"

import React, { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { usePageTitle } from "@/lib/usePageTitle"
import { transactionAPI } from "@/lib/api/transactionAPI"
import { userAPI } from "@/lib/api/userAPI"
import { Transaction, User } from "@/lib/api/types"
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    User as UserIcon, 
    BookOpen,
    AlertCircle,
    CheckCircle,
    RefreshCw
} from "lucide-react"

export default function TransactionDetailsPage({
    params,
}: {
    params: Promise<{ userId: string }>
}) {
    const { userId } = use(params)
    const router = useRouter()

    const [user, setUser] = useState<User | null>(null)
    
    // Set dynamic page title
    usePageTitle(user ? `Transactions - ${user.name} - Scam Library` : "Transaction Details - Scam Library");
    
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Load user information
                const userResponse = await userAPI.getUserById(userId)
                if (userResponse.error) {
                    throw new Error(userResponse.error.error || "User not found")
                }
                setUser(userResponse.data!)

                // Load all transactions and filter by userId
                const transactionsResponse = await transactionAPI.getAll()
                if (Array.isArray(transactionsResponse)) {
                    const userTransactions = transactionsResponse.filter(
                        (transaction) => transaction.userId === userId
                    )
                    setTransactions(userTransactions)
                } else {
                    throw new Error(transactionsResponse.error || "Failed to load transactions")
                }
            } catch (err) {
                console.error("Error loading transaction data:", err)
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load transaction data"
                )
            } finally {
                setLoading(false)
            }
        }

        if (userId) {
            loadData()
        }
    }, [userId])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getStatusBadge = (transaction: Transaction) => {
        const status = transaction.status || "UNKNOWN"
        const statusColors = {
            BORROWED: "bg-blue-100 text-blue-800",
            OVERDUE: "bg-red-100 text-red-800", 
            COMPLETED: "bg-green-100 text-green-800",
            UNKNOWN: "bg-gray-100 text-gray-800"
        }
        
        const statusIcons = {
            BORROWED: <Clock className="w-4 h-4" />,
            OVERDUE: <AlertCircle className="w-4 h-4" />,
            COMPLETED: <CheckCircle className="w-4 h-4" />,
            UNKNOWN: <RefreshCw className="w-4 h-4" />
        }

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${statusColors[status as keyof typeof statusColors]}`}>
                {statusIcons[status as keyof typeof statusIcons]}
                {status}
            </span>
        )
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900 text-white p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Loading transaction details...</p>
                    </div>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="min-h-screen bg-gray-900 text-white p-6">
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded mb-4">
                    <h2 className="font-bold flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Error
                    </h2>
                    <p>{error}</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </button>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-gray-900 text-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <UserIcon className="w-8 h-8" />
                    Transaction Details - {user?.name || userId}
                </h1>
                <button
                    onClick={() => router.back()}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            </div>

            {/* User Information */}
            {user && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        User Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm text-gray-400">Name</label>
                            <p className="font-medium">{user.name}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">CCCD</label>
                            <p className="font-medium">{user.cccd}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Email</label>
                            <p className="font-medium">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Balance</label>
                            <p className="font-medium text-green-400">
                                {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format(user.balance)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions List */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Transaction History ({transactions.length})
                    </h2>
                </div>

                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No transactions found</p>
                        <p className="text-sm">This user has no borrowing history.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Book
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Book Copy ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Borrow Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Return Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Penalty Fee
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {transactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-gray-700/50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm text-blue-400">
                                                {transaction.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="font-medium truncate">
                                                    {transaction.bookTitle || "Unknown Book"}
                                                </p>
                                                {transaction.bookPhotoUrl && (
                                                    <p className="text-sm text-gray-400">
                                                        Has cover image
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm">
                                                {transaction.bookCopyId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(transaction)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {formatDate(transaction.borrowDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {formatDate(transaction.dueDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {transaction.returnedDate ? (
                                                <div className="flex items-center gap-1 text-sm text-green-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {formatDate(transaction.returnedDate)}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Not returned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {transaction.penaltyFee && transaction.penaltyFee > 0 ? (
                                                <span className="text-red-400 font-medium">
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(transaction.penaltyFee)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">None</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    )
}
