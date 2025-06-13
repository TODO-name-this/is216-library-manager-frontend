"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { getStatistics } from "@/app/actions/statisticsActions"
import { StatisticsData } from "@/lib/api/statisticsAPI"
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
    FileText,
    FileSpreadsheet,
    ChevronDown,
} from "lucide-react"

// Import export libraries
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

function StatisticsDashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState<StatisticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [dateRange, setDateRange] = useState("year") // week, month, quarter, year
    const [refreshing, setRefreshing] = useState(false)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
        undefined
    )
    const [selectedQuarter, setSelectedQuarter] = useState<number | undefined>(
        undefined
    )
    const [showExportDropdown, setShowExportDropdown] = useState(false)

    const loadStatistics = async () => {
        setLoading(true)
        setError(null)

        try {
            let year: number | undefined = selectedYear
            let month: number | undefined = undefined
            let quarter: number | undefined = undefined

            if (dateRange === "month") {
                month = selectedMonth || new Date().getMonth() + 1
            } else if (dateRange === "quarter") {
                quarter =
                    selectedQuarter ||
                    Math.ceil((new Date().getMonth() + 1) / 3)
            }

            const statisticsData = await getStatistics(
                dateRange,
                year,
                month,
                quarter
            )
            if (statisticsData) {
                setStats(statisticsData)
            } else {
                setError("Failed to load statistics")
            }
        } catch (err) {
            setError("Failed to load statistics")
            console.error("Error loading statistics:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStatistics()
    }, [dateRange, selectedYear, selectedMonth, selectedQuarter]) // Close export dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element
            if (
                showExportDropdown &&
                !target.closest(".export-dropdown-container")
            ) {
                setShowExportDropdown(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showExportDropdown])

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadStatistics()
        setRefreshing(false)
    }

    const exportData = () => {
        if (!stats) return

        const dataStr = JSON.stringify(stats, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `library-statistics-${dateRange}-${Date.now()}.json`
        link.click()
        URL.revokeObjectURL(url)
    }

    const exportToPDF = () => {
        if (!stats) return

        const doc = new jsPDF()
        const currentDate = new Date().toLocaleDateString("vi-VN")

        // Title
        doc.setFontSize(20)
        doc.text("Library Statistics Report", 20, 20)
        doc.setFontSize(12)
        doc.text(`Generated on: ${currentDate}`, 20, 30)
        doc.text(`Period: ${dateRange}`, 20, 40)

        // Key Metrics
        doc.setFontSize(16)
        doc.text("Key Metrics", 20, 55)

        const keyMetrics = [
            ["Metric", "Value"],
            ["Total Users", stats.totalUsers.toLocaleString()],
            ["Total Books", stats.totalBooks.toLocaleString()],
            [
                "Total Revenue",
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(stats.totalRevenue),
            ],
            [
                "Net Revenue",
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(stats.netRevenue),
            ],
            ["Active Transactions", stats.activeTransactions.toString()],
            ["Overdue Transactions", stats.overdueTransactions.toString()],
            [
                "Total Penalties",
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(stats.totalPenalties),
            ],
        ]

        autoTable(doc, {
            head: [keyMetrics[0]],
            body: keyMetrics.slice(1),
            startY: 65,
        })

        let finalY = (doc as any).lastAutoTable?.finalY || 120

        // Popular Books
        doc.setFontSize(16)
        doc.text("Popular Books", 20, finalY + 20)

        const popularBooksData = [
            ["Title", "Borrow Count", "Revenue"],
            ...stats.popularBooks.map((book) => [
                book.title,
                book.borrowCount.toString(),
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(book.revenue),
            ]),
        ]

        autoTable(doc, {
            head: [popularBooksData[0]],
            body: popularBooksData.slice(1),
            startY: finalY + 30,
        })

        // Monthly Stats
        doc.addPage()
        doc.setFontSize(16)
        doc.text("Monthly Statistics", 20, 20)

        const monthlyData = [
            ["Month", "Transactions", "Revenue"],
            ...stats.monthlyStats.map((month) => [
                month.month,
                month.transactions.toString(),
                new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(month.revenue),
            ]),
        ]

        autoTable(doc, {
            head: [monthlyData[0]],
            body: monthlyData.slice(1),
            startY: 30,
        })

        // Save PDF
        doc.save(`library-statistics-${dateRange}-${Date.now()}.pdf`)
    }

    const exportToExcel = () => {
        if (!stats) return

        // Create workbook
        const wb = XLSX.utils.book_new()

        // Key Metrics sheet
        const keyMetricsData = [
            ["Metric", "Value"],
            ["Total Users", stats.totalUsers],
            ["Total Books", stats.totalBooks],
            ["Total Revenue", stats.totalRevenue],
            ["Net Revenue", stats.netRevenue],
            ["Gross Revenue", stats.grossRevenue],
            ["Total Penalties", stats.totalPenalties],
            ["Total Refunds", stats.totalRefunds],
            ["Active Transactions", stats.activeTransactions],
            ["Overdue Transactions", stats.overdueTransactions],
        ]
        const keyMetricsWS = XLSX.utils.aoa_to_sheet(keyMetricsData)
        XLSX.utils.book_append_sheet(wb, keyMetricsWS, "Key Metrics")

        // Popular Books sheet
        const popularBooksData = [
            ["Title", "Borrow Count", "Revenue"],
            ...stats.popularBooks.map((book) => [
                book.title,
                book.borrowCount,
                book.revenue,
            ]),
        ]
        const popularBooksWS = XLSX.utils.aoa_to_sheet(popularBooksData)
        XLSX.utils.book_append_sheet(wb, popularBooksWS, "Popular Books")

        // Monthly Stats sheet
        const monthlyData = [
            ["Month", "Transactions", "Revenue"],
            ...stats.monthlyStats.map((month) => [
                month.month,
                month.transactions,
                month.revenue,
            ]),
        ]
        const monthlyWS = XLSX.utils.aoa_to_sheet(monthlyData)
        XLSX.utils.book_append_sheet(wb, monthlyWS, "Monthly Stats")

        // User Activity sheet
        const userActivityData = [
            ["Role", "Count"],
            ...stats.userActivity.map((user) => [user.role, user.count]),
        ]
        const userActivityWS = XLSX.utils.aoa_to_sheet(userActivityData)
        XLSX.utils.book_append_sheet(wb, userActivityWS, "User Activity")

        // Book Condition sheet
        const bookConditionData = [
            ["Condition", "Count"],
            ...stats.bookCondition.map((condition) => [
                condition.condition,
                condition.count,
            ]),
        ]
        const bookConditionWS = XLSX.utils.aoa_to_sheet(bookConditionData)
        XLSX.utils.book_append_sheet(wb, bookConditionWS, "Book Condition") // Save Excel file
        XLSX.writeFile(wb, `library-statistics-${dateRange}-${Date.now()}.xlsx`)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    const formatCompactCurrency = (amount: number) => {
        if (amount >= 1000000000) {
            return `${(amount / 1000000000).toFixed(1)}B VND`
        } else if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)}M VND`
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)}K VND`
        } else {
            return `${amount.toLocaleString()} VND`
        }
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
            <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
                <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading statistics...</p>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    if (error) {
        return (
            <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
                <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-400 text-6xl mb-4">⚠️</div>
                        <p className="text-red-400 text-xl mb-4">{error}</p>
                        <button
                            onClick={loadStatistics}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    if (!stats) {
        return (
            <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
                <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-400">No statistics available</p>
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
                                Refresh{" "}
                            </button>{" "}
                            {/* Export Dropdown */}
                            <div className="relative export-dropdown-container">
                                <button
                                    onClick={() =>
                                        setShowExportDropdown(
                                            !showExportDropdown
                                        )
                                    }
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Download className="h-4 w-4" />
                                    Export
                                    <ChevronDown className="h-4 w-4" />
                                </button>

                                {showExportDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                                        <button
                                            onClick={() => {
                                                exportData()
                                                setShowExportDropdown(false)
                                            }}
                                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Export as JSON
                                        </button>
                                        <button
                                            onClick={() => {
                                                exportToPDF()
                                                setShowExportDropdown(false)
                                            }}
                                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Export as PDF
                                        </button>
                                        <button
                                            onClick={() => {
                                                exportToExcel()
                                                setShowExportDropdown(false)
                                            }}
                                            className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 flex items-center gap-2 rounded-b-lg"
                                        >
                                            <FileSpreadsheet className="h-4 w-4" />
                                            Export as Excel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>{" "}
                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
                        {/* Total Revenue */}
                        <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-400 text-xs lg:text-sm mb-1">
                                        Total Revenue
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-xs lg:text-base font-bold text-white break-words leading-tight">
                                            {formatCurrency(stats.totalRevenue)}
                                        </p>
                                    </div>
                                </div>
                                <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-500 flex-shrink-0 ml-2" />
                            </div>
                        </div>

                        {/* Net Revenue */}
                        <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-400 text-xs lg:text-sm mb-1">
                                        Net Revenue
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-xs lg:text-base font-bold text-white break-words leading-tight">
                                            {formatCurrency(stats.netRevenue)}
                                        </p>
                                        <p className="text-xs text-green-400 break-words">
                                            Penalties:{" "}
                                            {formatCurrency(
                                                stats.totalPenalties
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-purple-500 flex-shrink-0 ml-2" />
                            </div>
                        </div>

                        {/* Active Loans */}
                        <div className="bg-gray-800 rounded-lg p-4 lg:p-6 border border-gray-700">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-400 text-xs lg:text-sm mb-1">
                                        Active Loans
                                    </p>
                                    <p className="text-lg lg:text-2xl font-bold text-white break-words">
                                        {stats.activeTransactions}
                                    </p>
                                    <p className="text-xs text-red-400 break-words">
                                        {stats.overdueTransactions} overdue
                                    </p>
                                </div>
                                <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500 flex-shrink-0 ml-2" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Monthly Statistics Chart */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Monthly Trends
                            </h3>
                            <div className="space-y-3">
                                {stats.monthlyStats.map((month, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-gray-300 font-medium w-12">
                                            {month.month}
                                        </span>
                                        <div className="flex-1 mx-4">
                                            <div className="bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
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
                                        <span className="text-gray-400 text-sm w-24 text-right">
                                            {month.transactions} loans
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Popular Books */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Most Popular Books
                            </h3>
                            <div className="space-y-3">
                                {stats.popularBooks.map((book, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <p className="text-gray-100 font-medium truncate">
                                                {book.title}
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                {book.borrowCount} borrows •{" "}
                                                {formatCurrency(book.revenue)}
                                            </p>
                                        </div>
                                        <div className="text-yellow-400 font-bold text-lg">
                                            #{index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {" "}
                        {/* User Activity */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    User Activity by Role
                                </h3>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm">
                                        Total Users
                                    </p>
                                    <p className="text-lg font-bold text-blue-400">
                                        {stats.totalUsers.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {stats.userActivity.map((user) => (
                                    <div
                                        key={user.role}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`w-4 h-4 rounded-full ${getRoleColor(
                                                    user.role
                                                )}`}
                                            ></div>
                                            <span className="text-gray-300 font-medium">
                                                {user.role}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-32 bg-gray-700 rounded-full h-2">
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
                                            <span className="text-gray-100 font-bold w-8 text-right">
                                                {user.count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>{" "}
                        {/* Book Condition */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Book Condition Distribution
                                </h3>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm">
                                        Total Books
                                    </p>
                                    <p className="text-lg font-bold text-green-400">
                                        {stats.totalBooks.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {stats.bookCondition.map((condition) => (
                                    <div
                                        key={condition.condition}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`w-4 h-4 rounded-full ${getConditionColor(
                                                    condition.condition
                                                )}`}
                                            ></div>
                                            <span className="text-gray-300 font-medium">
                                                {condition.condition}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-32 bg-gray-700 rounded-full h-2">
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
                                            <span className="text-gray-100 font-bold w-8 text-right">
                                                {condition.count}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Alert for Overdue Books */}
                    {stats.overdueTransactions > 0 && (
                        <div className="mt-8 bg-red-500/20 border border-red-500 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <AlertTriangle className="h-6 w-6 text-red-400" />
                                <div>
                                    <h4 className="text-red-400 font-semibold">
                                        Attention Required
                                    </h4>
                                    <p className="text-red-300">
                                        There are {stats.overdueTransactions}{" "}
                                        overdue book loans that require
                                        immediate attention.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default function StatisticsPage() {
    return <StatisticsDashboard />
}
