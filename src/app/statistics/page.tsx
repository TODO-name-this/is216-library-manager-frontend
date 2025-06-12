"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { transactionAPI, bookCopyAPI, userAPI, reservationAPI } from "@/lib/api"
import {
    BarChart3,
    TrendingUp,
    Users,
    BookOpen,
    Calendar,
    DollarSign,
    Clock,
    AlertTriangle,
    Download,
    Filter,
    RefreshCw,
    PieChart,
    Package,
} from "lucide-react"

interface StatisticsData {
    totalUsers: number
    totalBooks: number
    totalTransactions: number
    totalRevenue: number
    activeTransactions: number
    overdueTransactions: number
    popularBooks: Array<{
        title: string
        borrowCount: number
        revenue: number
    }>
    monthlyStats: Array<{
        month: string
        transactions: number
        revenue: number
    }>
    userActivity: Array<{
        role: string
        count: number
    }>
    bookCondition: Array<{
        condition: string
        count: number
    }>
}

// Mock data for demonstration
const mockStatistics: StatisticsData = {
    totalUsers: 1247,
    totalBooks: 3582,
    totalTransactions: 8934,
    totalRevenue: 125680000, // VND
    activeTransactions: 234,
    overdueTransactions: 47,
    popularBooks: [
        { title: "Clean Code", borrowCount: 89, revenue: 2670000 },
        {
            title: "JavaScript: The Good Parts",
            borrowCount: 76,
            revenue: 2280000,
        },
        { title: "Design Patterns", borrowCount: 64, revenue: 1920000 },
        { title: "Refactoring", borrowCount: 52, revenue: 1560000 },
        {
            title: "The Pragmatic Programmer",
            borrowCount: 48,
            revenue: 1440000,
        },
    ],
    monthlyStats: [
        { month: "Jan", transactions: 745, revenue: 11200000 },
        { month: "Feb", transactions: 682, revenue: 10230000 },
        { month: "Mar", transactions: 798, revenue: 11970000 },
        { month: "Apr", transactions: 856, revenue: 12840000 },
        { month: "May", transactions: 923, revenue: 13845000 },
        { month: "Jun", transactions: 234, revenue: 3510000 }, // Current month (partial)
    ],
    userActivity: [
        { role: "USER", count: 1189 },
        { role: "LIBRARIAN", count: 52 },
        { role: "ADMIN", count: 6 },
    ],
    bookCondition: [
        { condition: "NEW", count: 1245 },
        { condition: "GOOD", count: 1892 },
        { condition: "WORN", count: 367 },
        { condition: "DAMAGED", count: 78 },
    ],
}

function StatisticsDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState<StatisticsData>(mockStatistics)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dateRange, setDateRange] = useState("month") // week, month, quarter, year
    const [refreshing, setRefreshing] = useState(false)

    const loadStatistics = async () => {
        setLoading(true)
        setError(null)

        try {
            // In a real app, this would fetch actual statistics from the API
            // For now, we'll use mock data with some random variations
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

            const variation = () => Math.floor(Math.random() * 100) - 50
            const updatedStats = {
                ...mockStatistics,
                totalUsers: mockStatistics.totalUsers + variation(),
                totalTransactions:
                    mockStatistics.totalTransactions + variation() * 10,
                activeTransactions: Math.max(
                    50,
                    mockStatistics.activeTransactions + variation()
                ),
                overdueTransactions: Math.max(
                    0,
                    mockStatistics.overdueTransactions +
                        Math.floor(variation() / 5)
                ),
            }

            setStats(updatedStats)
        } catch (err) {
            setError("Failed to load statistics")
            console.error("Error loading statistics:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadStatistics()
        setRefreshing(false)
    }

    const exportData = () => {
        // Mock export functionality
        const dataStr = JSON.stringify(stats, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `library-statistics-${
            new Date().toISOString().split("T")[0]
        }.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    useEffect(() => {
        loadStatistics()
    }, [dateRange])

    const formatCurrency = (amount: number) => {
        return `${amount.toLocaleString()}₫`
    }

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case "NEW":
                return "bg-green-500"
            case "GOOD":
                return "bg-blue-500"
            case "WORN":
                return "bg-yellow-500"
            case "DAMAGED":
                return "bg-red-500"
            default:
                return "bg-gray-500"
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case "ADMIN":
                return "bg-red-500"
            case "LIBRARIAN":
                return "bg-blue-500"
            case "USER":
                return "bg-green-500"
            default:
                return "bg-gray-500"
        }
    }

    if (loading && !refreshing) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading statistics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <BarChart3 className="h-8 w-8" />
                            Library Statistics Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Comprehensive analytics and insights for library
                            management
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                        </select>

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
                            Refresh
                        </button>

                        <button
                            onClick={exportData}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">
                                    Total Users
                                </p>
                                <p className="text-3xl font-bold text-white">
                                    {stats.totalUsers.toLocaleString()}
                                </p>
                                <p className="text-sm text-green-400 mt-1">
                                    +12% from last month
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">
                                    Total Books
                                </p>
                                <p className="text-3xl font-bold text-white">
                                    {stats.totalBooks.toLocaleString()}
                                </p>
                                <p className="text-sm text-green-400 mt-1">
                                    +5% from last month
                                </p>
                            </div>
                            <BookOpen className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">
                                    Total Revenue
                                </p>
                                <p className="text-3xl font-bold text-white">
                                    {formatCurrency(stats.totalRevenue)}
                                </p>
                                <p className="text-sm text-green-400 mt-1">
                                    +18% from last month
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">
                                    Active Transactions
                                </p>
                                <p className="text-3xl font-bold text-white">
                                    {stats.activeTransactions}
                                </p>
                                <p className="text-sm text-red-400 mt-1">
                                    {stats.overdueTransactions} overdue
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Monthly Revenue Chart */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Monthly Performance
                        </h3>
                        <div className="space-y-4">
                            {stats.monthlyStats.map((month, index) => (
                                <div
                                    key={month.month}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 text-gray-400 text-sm">
                                            {month.month}
                                        </div>
                                        <div className="flex-1 bg-gray-700 rounded-full h-3 max-w-xs">
                                            <div
                                                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${
                                                        (month.transactions /
                                                            Math.max(
                                                                ...stats.monthlyStats.map(
                                                                    (m) =>
                                                                        m.transactions
                                                                )
                                                            )) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm">
                                        <div className="text-white font-medium">
                                            {month.transactions} txns
                                        </div>
                                        <div className="text-gray-400">
                                            {formatCurrency(month.revenue)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Books */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Most Popular Books
                        </h3>
                        <div className="space-y-4">
                            {stats.popularBooks.map((book, index) => (
                                <div
                                    key={book.title}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium truncate max-w-xs">
                                                {book.title}
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                {book.borrowCount} borrows
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-sm">
                                        <div className="text-green-400 font-medium">
                                            {formatCurrency(book.revenue)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* User Distribution */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            User Distribution
                        </h3>
                        <div className="space-y-4">
                            {stats.userActivity.map((user) => (
                                <div
                                    key={user.role}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-4 h-4 rounded-full ${getRoleColor(
                                                user.role
                                            )}`}
                                        ></div>
                                        <span className="text-gray-300">
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">
                                            {user.count}
                                        </span>
                                        <div className="w-20 bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getRoleColor(
                                                    user.role
                                                )}`}
                                                style={{
                                                    width: `${
                                                        (user.count /
                                                            stats.totalUsers) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Book Condition */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Book Condition Status
                        </h3>
                        <div className="space-y-4">
                            {stats.bookCondition.map((condition) => (
                                <div
                                    key={condition.condition}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-4 h-4 rounded-full ${getConditionColor(
                                                condition.condition
                                            )}`}
                                        ></div>
                                        <span className="text-gray-300">
                                            {condition.condition}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">
                                            {condition.count}
                                        </span>
                                        <div className="w-20 bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getConditionColor(
                                                    condition.condition
                                                )}`}
                                                style={{
                                                    width: `${
                                                        (condition.count /
                                                            stats.totalBooks) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Alert Section */}
                {stats.overdueTransactions > 0 && (
                    <div className="mt-8 bg-red-500/20 border border-red-500 rounded-lg p-6">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-6 w-6 text-red-400" />
                            <div>
                                <h4 className="text-lg font-semibold text-red-300">
                                    Attention Required
                                </h4>
                                <p className="text-red-200 mt-1">
                                    There are {stats.overdueTransactions}{" "}
                                    overdue transactions that need immediate
                                    attention.
                                    <a
                                        href="/returns"
                                        className="ml-2 underline hover:no-underline"
                                    >
                                        Go to Returns Management
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function StatisticsPage() {
    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
            <StatisticsDashboard />
        </ProtectedRoute>
    )
}
