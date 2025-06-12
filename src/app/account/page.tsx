"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Clock,
    CreditCard,
    AlertCircle,
    Download,
    RefreshCw,
    Plus,
    Minus,
} from "lucide-react"

interface AccountTransaction {
    id: string
    type: "DEPOSIT" | "WITHDRAWAL" | "BOOK_RENTAL" | "PENALTY_FEE" | "REFUND"
    amount: number
    description: string
    timestamp: string
    balanceAfter: number
    status: "COMPLETED" | "PENDING" | "FAILED"
}

// Mock data cho số dư tài khoản
const mockAccountData = {
    currentBalance: 2450000, // VND
    totalDeposited: 5000000,
    totalSpent: 2550000,
    pendingTransactions: 0,
    lastUpdated: "2024-12-10T14:30:00Z",
}

// Mock data cho lịch sử giao dịch
const mockTransactionHistory: AccountTransaction[] = [
    {
        id: "txn_001",
        type: "DEPOSIT",
        amount: 500000,
        description: "Nạp tiền tại quầy thư viện",
        timestamp: "2024-12-10T09:15:00Z",
        balanceAfter: 2450000,
        status: "COMPLETED",
    },
    {
        id: "txn_002",
        type: "BOOK_RENTAL",
        amount: -75000,
        description: "Mượn sách: Clean Code",
        timestamp: "2024-12-09T14:20:00Z",
        balanceAfter: 1950000,
        status: "COMPLETED",
    },
    {
        id: "txn_003",
        type: "REFUND",
        amount: 60000,
        description: "Hoàn tiền trả sách: JavaScript Guide",
        timestamp: "2024-12-08T11:45:00Z",
        balanceAfter: 2025000,
        status: "COMPLETED",
    },
    {
        id: "txn_004",
        type: "PENALTY_FEE",
        amount: -15000,
        description: "Phí phạt trả sách muộn: Design Patterns",
        timestamp: "2024-12-07T16:30:00Z",
        balanceAfter: 1965000,
        status: "COMPLETED",
    },
    {
        id: "txn_005",
        type: "DEPOSIT",
        amount: 1000000,
        description: "Nạp tiền tại quầy thư viện",
        timestamp: "2024-12-05T10:00:00Z",
        balanceAfter: 1980000,
        status: "COMPLETED",
    },
    {
        id: "txn_006",
        type: "BOOK_RENTAL",
        amount: -45000,
        description: "Mượn sách: The Pragmatic Programmer",
        timestamp: "2024-12-04T13:15:00Z",
        balanceAfter: 980000,
        status: "COMPLETED",
    },
    {
        id: "txn_007",
        type: "REFUND",
        amount: 45000,
        description: "Hoàn tiền trả sách: Introduction to Algorithms",
        timestamp: "2024-12-03T15:20:00Z",
        balanceAfter: 1025000,
        status: "COMPLETED",
    },
    {
        id: "txn_008",
        type: "DEPOSIT",
        amount: 2000000,
        description: "Nạp tiền lần đầu - Tạo tài khoản",
        timestamp: "2024-12-01T08:30:00Z",
        balanceAfter: 980000,
        status: "COMPLETED",
    },
]

export default function AccountPage() {
    const { user } = useAuth()
    const [transactions, setTransactions] = useState<AccountTransaction[]>(mockTransactionHistory)
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState<string>("ALL")

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

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "DEPOSIT":
                return <Plus className="h-4 w-4 text-green-500" />
            case "WITHDRAWAL":
                return <Minus className="h-4 w-4 text-red-500" />
            case "BOOK_RENTAL":
                return <CreditCard className="h-4 w-4 text-blue-500" />
            case "PENALTY_FEE":
                return <AlertCircle className="h-4 w-4 text-orange-500" />
            case "REFUND":
                return <TrendingUp className="h-4 w-4 text-green-500" />
            default:
                return <Clock className="h-4 w-4 text-gray-500" />
        }
    }

    const getTransactionColor = (amount: number) => {
        return amount > 0 ? "text-green-500" : "text-red-500"
    }

    const filteredTransactions = transactions.filter((txn) => {
        if (filter === "ALL") return true
        return txn.type === filter
    })

    const handleRefresh = () => {
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }

    const exportTransactions = () => {
        const dataStr = JSON.stringify(transactions, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `account-history-${new Date().toISOString().split("T")[0]}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Wallet className="h-8 w-8" />
                                Số Dư Tài Khoản
                            </h1>
                            <p className="text-gray-400 mt-2">
                                Quản lý số dư và lịch sử giao dịch của bạn
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                Làm mới
                            </button>

                            <button
                                onClick={exportTransactions}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Xuất lịch sử
                            </button>
                        </div>
                    </div>

                    {/* Balance Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Số dư hiện tại</p>
                                    <p className="text-2xl font-bold text-green-400">
                                        {formatCurrency(mockAccountData.currentBalance)}
                                    </p>
                                </div>
                                <Wallet className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Tổng nạp</p>
                                    <p className="text-2xl font-bold text-blue-400">
                                        {formatCurrency(mockAccountData.totalDeposited)}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Tổng chi tiêu</p>
                                    <p className="text-2xl font-bold text-red-400">
                                        {formatCurrency(mockAccountData.totalSpent)}
                                    </p>
                                </div>
                                <TrendingDown className="h-8 w-8 text-red-500" />
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Giao dịch chờ</p>
                                    <p className="text-2xl font-bold text-yellow-400">
                                        {mockAccountData.pendingTransactions}
                                    </p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-500" />
                            </div>
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="bg-blue-500/20 border border-blue-500 text-blue-300 px-4 py-3 rounded mb-6">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <p>
                                <strong>Lưu ý:</strong> Để nạp hoặc rút tiền, vui lòng đến quầy thư viện 
                                với CCCD và yêu cầu hỗ trợ từ thủ thư.
                            </p>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700">
                        <div className="p-6 border-b border-gray-700">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-white">Lịch sử giao dịch</h2>
                                
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">Tất cả giao dịch</option>
                                    <option value="DEPOSIT">Nạp tiền</option>
                                    <option value="WITHDRAWAL">Rút tiền</option>
                                    <option value="BOOK_RENTAL">Mượn sách</option>
                                    <option value="REFUND">Hoàn tiền</option>
                                    <option value="PENALTY_FEE">Phí phạt</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-6">
                            {filteredTransactions.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Không có giao dịch nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                {getTransactionIcon(transaction.type)}
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {transaction.description}
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {formatDate(transaction.timestamp)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className={`font-bold ${getTransactionColor(transaction.amount)}`}>
                                                    {transaction.amount > 0 ? "+" : ""}
                                                    {formatCurrency(Math.abs(transaction.amount))}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    Số dư: {formatCurrency(transaction.balanceAfter)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 text-center text-gray-400 text-sm">
                        <p>Cập nhật lần cuối: {formatDate(mockAccountData.lastUpdated)}</p>
                        <p className="mt-1">
                            Mọi thắc mắc về giao dịch, vui lòng liên hệ thủ thư hoặc quản trị viên
                        </p>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}