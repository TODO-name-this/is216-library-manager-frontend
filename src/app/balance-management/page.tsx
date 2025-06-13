"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { usePageTitle } from "@/lib/usePageTitle"
import { balanceTransactionAPI, userAPI } from "@/lib/api"
import { BalanceTransaction, User } from "@/lib/api/types"
import {
    Plus,
    Minus,
    Wallet,
    Users,
    DollarSign,
    Loader2,
    AlertCircle,
    CheckCircle,
    Search,
    History,
    RefreshCw,
} from "lucide-react"

export default function BalanceManagementPage() {
    usePageTitle("Balance Management - Scam Library")
    const { user, isLibrarian, isAdmin } = useAuth()

    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [transactions, setTransactions] = useState<BalanceTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    // Form states
    const [transactionType, setTransactionType] = useState<
        "DEPOSIT" | "WITHDRAWAL"
    >("DEPOSIT")
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")

    const fetchUsers = async () => {
        try {
            const result = await userAPI.getUsers()
            if (result.error) {
                throw new Error(result.error.error)
            }
            // Filter out admin and librarian users, only show regular users
            const regularUsers = (result.data || []).filter(
                (u: User) => u.role === "USER"
            )
            setUsers(regularUsers)
        } catch (error: any) {
            setError("Failed to fetch users: " + error.message)
        }
    }

    const fetchUserTransactions = async (userId: string) => {
        try {
            const result =
                await balanceTransactionAPI.getUserBalanceTransactions(userId)
            if (result.error) {
                throw new Error(result.error.error)
            }
            setTransactions(result.data || [])
        } catch (error: any) {
            setError("Failed to fetch user transactions: " + error.message)
        }
    }

    useEffect(() => {
        fetchUsers().finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (selectedUser) {
            fetchUserTransactions(selectedUser.id)
        }
    }, [selectedUser])

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    const formatDate = (timestamp: string): string => {
        return new Date(timestamp).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleTransaction = async () => {
        if (!selectedUser || !amount || parseFloat(amount) <= 0) {
            setError("Please select a user and enter a valid amount")
            return
        }

        setProcessing(true)
        setError(null)
        setSuccess(null)

        try {
            const amountVnd = Math.round(parseFloat(amount))
            const result =
                transactionType === "DEPOSIT"
                    ? await balanceTransactionAPI.createDeposit(
                          selectedUser.id,
                          amountVnd,
                          description || undefined
                      )
                    : await balanceTransactionAPI.createWithdrawal(
                          selectedUser.id,
                          amountVnd,
                          description || undefined
                      )

            if (result.error) {
                throw new Error(result.error.error)
            }

            setSuccess(
                `${
                    transactionType === "DEPOSIT" ? "Nạp tiền" : "Rút tiền"
                } thành công: ${formatCurrency(amountVnd)}`
            )
            setAmount("")
            setDescription("")

            // Refresh user data and transactions
            await fetchUsers()
            await fetchUserTransactions(selectedUser.id)

            // Update selected user's balance if available in response
            if (result.data && result.data.balanceAfter) {
                setSelectedUser({
                    ...selectedUser,
                    balance: result.data.balanceAfter,
                })
            }
        } catch (error: any) {
            setError(error.message || "Transaction failed")
        } finally {
            setProcessing(false)
        }
    }

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.cccd.includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
                <div className="min-h-screen bg-gray-900 text-white p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-400">
                                Loading balance management...
                            </span>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Wallet className="h-8 w-8" />
                                Quản Lý Số Dư Tài Khoản
                            </h1>
                            <p className="text-gray-400 mt-2">
                                Nạp và rút tiền cho tài khoản người dùng
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                fetchUsers()
                                if (selectedUser) {
                                    fetchUserTransactions(selectedUser.id)
                                }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                <p>
                                    <strong>Error:</strong> {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded mb-6">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <p>
                                    <strong>Success:</strong> {success}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* User Selection */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Select User
                            </h2>

                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, CCCD, or email..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                            selectedUser?.id === user.id
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-700 hover:bg-gray-600 text-gray-100"
                                        }`}
                                    >
                                        <div className="font-medium">
                                            {user.name}
                                        </div>
                                        <div className="text-sm opacity-75">
                                            {user.cccd}
                                        </div>
                                        <div className="text-sm font-medium text-green-400">
                                            {formatCurrency(user.balance)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Transaction Form */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Create Transaction
                            </h2>

                            {selectedUser ? (
                                <div className="space-y-4">
                                    <div className="bg-gray-700 p-4 rounded-lg">
                                        <div className="text-sm text-gray-400">
                                            Selected User
                                        </div>
                                        <div className="font-medium text-white">
                                            {selectedUser.name}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            {selectedUser.cccd}
                                        </div>
                                        <div className="text-lg font-bold text-green-400">
                                            {formatCurrency(
                                                selectedUser.balance
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Transaction Type
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTransactionType(
                                                        "DEPOSIT"
                                                    )
                                                }
                                                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                                                    transactionType ===
                                                    "DEPOSIT"
                                                        ? "bg-green-600 text-white"
                                                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                }`}
                                            >
                                                <Plus className="h-4 w-4" />
                                                Deposit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setTransactionType(
                                                        "WITHDRAWAL"
                                                    )
                                                }
                                                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                                                    transactionType ===
                                                    "WITHDRAWAL"
                                                        ? "bg-red-600 text-white"
                                                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                }`}
                                            >
                                                <Minus className="h-4 w-4" />
                                                Withdraw
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Amount (VND)
                                        </label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) =>
                                                setAmount(e.target.value)
                                            }
                                            placeholder="Enter amount..."
                                            min="1000"
                                            step="1000"
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                            placeholder="Transaction description..."
                                            rows={3}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <button
                                        onClick={handleTransaction}
                                        disabled={
                                            processing ||
                                            !amount ||
                                            parseFloat(amount) <= 0
                                        }
                                        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                                            transactionType === "DEPOSIT"
                                                ? "bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                                                : "bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
                                        } disabled:cursor-not-allowed text-white`}
                                    >
                                        {processing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : transactionType === "DEPOSIT" ? (
                                            <Plus className="h-4 w-4" />
                                        ) : (
                                            <Minus className="h-4 w-4" />
                                        )}
                                        {processing
                                            ? "Processing..."
                                            : `${
                                                  transactionType === "DEPOSIT"
                                                      ? "Deposit"
                                                      : "Withdraw"
                                              } ${
                                                  amount
                                                      ? formatCurrency(
                                                            parseFloat(amount)
                                                        )
                                                      : "Money"
                                              }`}
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Select a user to create a transaction</p>
                                </div>
                            )}
                        </div>

                        {/* Transaction History */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Transaction History
                            </h2>

                            {selectedUser ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {transactions.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>No transactions found</p>
                                        </div>
                                    ) : (
                                        transactions.map((transaction) => (
                                            <div
                                                key={transaction.id}
                                                className="p-3 bg-gray-700 rounded-lg"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-white">
                                                            {
                                                                transaction.description
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            {formatDate(
                                                                transaction.timestamp
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div
                                                            className={`font-bold ${
                                                                transaction.type ===
                                                                    "DEPOSIT" ||
                                                                transaction.type ===
                                                                    "REFUND"
                                                                    ? "text-green-400"
                                                                    : "text-red-400"
                                                            }`}
                                                        >
                                                            {transaction.type ===
                                                                "DEPOSIT" ||
                                                            transaction.type ===
                                                                "REFUND"
                                                                ? "+"
                                                                : "-"}
                                                            {formatCurrency(
                                                                Math.abs(
                                                                    transaction.amount
                                                                )
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            Balance:{" "}
                                                            {formatCurrency(
                                                                transaction.balanceAfter
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>
                                        Select a user to view transaction
                                        history
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
