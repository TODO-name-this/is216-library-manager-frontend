"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { usePageTitle } from "@/lib/usePageTitle"
import { balanceTransactionAPI } from "@/lib/api"
import { BalanceTransaction } from "@/lib/api/types"
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
    Loader2,
} from "lucide-react"

export default function AccountPage() {
    usePageTitle("Account - Scam Library")
    const { user } = useAuth()
    const [transactions, setTransactions] = useState<BalanceTransaction[]>([])
    const [accountSummary, setAccountSummary] = useState({
        currentBalance: 0,
        totalDeposited: 0,
        totalSpent: 0,
        pendingTransactions: 0,
        lastUpdated: new Date().toISOString(),
    })
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [filter, setFilter] = useState<string>("ALL")
    const [error, setError] = useState<string | null>(null)

    const fetchData = async (showLoading = true) => {
        if (showLoading) setLoading(true)
        setError(null)

        try {
            const transactionsResult =
                await balanceTransactionAPI.getMyBalanceTransactions()

            if (transactionsResult.error) {
                throw new Error(transactionsResult.error.error)
            }

            const txns = transactionsResult.data || []
            setTransactions(txns)

            // Calculate account summary from transactions
            const summary = {
                currentBalance: user?.balance || 0, // Use user balance from auth context
                totalDeposited: txns
                    .filter((t) => t.type === "DEPOSIT")
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0),
                totalSpent: txns
                    .filter(
                        (t) =>
                            t.type === "BOOK_RENTAL" ||
                            t.type === "PENALTY_FEE" ||
                            t.type === "WITHDRAWAL"
                    )
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0),
                pendingTransactions: txns.filter((t) => t.status === "PENDING")
                    .length,
                lastUpdated: new Date().toISOString(),
            }
            setAccountSummary(summary)
        } catch (error: any) {
            setError(error.message || "Failed to fetch account data")
            console.error("Error fetching account data:", error)
        } finally {
            if (showLoading) setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

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

    const getTransactionColor = (type: string, amount: number) => {
        if (type === "DEPOSIT" || type === "REFUND") return "text-green-500"
        if (
            type === "WITHDRAWAL" ||
            type === "BOOK_RENTAL" ||
            type === "PENALTY_FEE"
        )
            return "text-red-500"
        return amount > 0 ? "text-green-500" : "text-red-500"
    }

    const filteredTransactions = transactions.filter((txn) => {
        if (filter === "ALL") return true
        return txn.type === filter
    })

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchData(false)
        setRefreshing(false)
    }

    const exportTransactions = () => {
        const dataStr = JSON.stringify(transactions, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `account-history-${
            new Date().toISOString().split("T")[0]
        }.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-900 text-white p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-400">
                                Đang tải dữ liệu tài khoản...
                            </span>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-900 text-white p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                <p>
                                    <strong>Lỗi:</strong> {error}
                                </p>
                            </div>
                            <button
                                onClick={() => fetchData()}
                                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        )
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
                                disabled={refreshing}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${
                                        refreshing ? "animate-spin" : ""
                                    }`}
                                />
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
                                    <p className="text-sm text-gray-400">
                                        Số dư hiện tại
                                    </p>
                                    <p className="text-2xl font-bold text-green-400">
                                        {formatCurrency(
                                            accountSummary.totalDeposited - accountSummary.totalSpent
                                        )}
                                    </p>
                                </div>
                                <Wallet className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">
                                        Tổng nạp
                                    </p>
                                    <p className="text-2xl font-bold text-blue-400">
                                        {formatCurrency(
                                            accountSummary.totalDeposited
                                        )}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">
                                        Tổng chi tiêu
                                    </p>
                                    <p className="text-2xl font-bold text-red-400">
                                        {formatCurrency(
                                            accountSummary.totalSpent
                                        )}
                                    </p>
                                </div>
                                <TrendingDown className="h-8 w-8 text-red-500" />
                            </div>
                        </div>

                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">
                                        Giao dịch chờ
                                    </p>
                                    <p className="text-2xl font-bold text-yellow-400">
                                        {accountSummary.pendingTransactions}
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
                                <strong>Lưu ý:</strong> Để nạp hoặc rút tiền,
                                vui lòng đến quầy thư viện với CCCD và yêu cầu
                                hỗ trợ từ thủ thư.
                            </p>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700">
                        <div className="p-6 border-b border-gray-700">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-white">
                                    Lịch sử giao dịch
                                </h2>

                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">
                                        Tất cả giao dịch
                                    </option>
                                    <option value="DEPOSIT">Nạp tiền</option>
                                    <option value="WITHDRAWAL">Rút tiền</option>
                                    <option value="BOOK_RENTAL">
                                        Mượn sách
                                    </option>
                                    <option value="REFUND">Hoàn tiền</option>
                                    <option value="PENALTY_FEE">
                                        Phí phạt
                                    </option>
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
                                                {getTransactionIcon(
                                                    transaction.type
                                                )}
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {
                                                            transaction.description
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {formatDate(
                                                            transaction.timestamp
                                                        )}
                                                    </p>
                                                    <span
                                                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                            transaction.status ===
                                                            "COMPLETED"
                                                                ? "bg-green-500/20 text-green-400"
                                                                : transaction.status ===
                                                                  "PENDING"
                                                                ? "bg-yellow-500/20 text-yellow-400"
                                                                : "bg-red-500/20 text-red-400"
                                                        }`}
                                                    >
                                                        {transaction.status ===
                                                        "COMPLETED"
                                                            ? "Hoàn thành"
                                                            : transaction.status ===
                                                              "PENDING"
                                                            ? "Đang xử lý"
                                                            : "Thất bại"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p
                                                    className={`font-bold ${getTransactionColor(
                                                        transaction.type,
                                                        transaction.amount
                                                    )}`}
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
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    Số dư:{" "}
                                                    {formatCurrency(
                                                        transaction.balanceAfter
                                                    )}
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
                        <p>
                            Cập nhật lần cuối:{" "}
                            {formatDate(accountSummary.lastUpdated)}
                        </p>
                        <p className="mt-1">
                            Mọi thắc mắc về giao dịch, vui lòng liên hệ thủ thư
                            hoặc quản trị viên
                        </p>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
