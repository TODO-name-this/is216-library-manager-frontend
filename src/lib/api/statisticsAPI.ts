import { fetchWrapper } from "../fetchWrapper"
import { ApiResponse, ApiError } from "./types"

// Statistics Types
export interface PopularBook {
    title: string
    borrowCount: number
    revenue: number
}

export interface MonthlyStats {
    month: string
    transactions: number
    revenue: number
}

export interface UserActivity {
    role: "USER" | "ADMIN" | "LIBRARIAN"
    count: number
}

export interface BookCondition {
    condition: "NEW" | "GOOD" | "WORN" | "DAMAGED"
    count: number
}

export interface StatisticsData {
    totalUsers: number
    totalBooks: number
    totalTransactions: number
    grossRevenue: number
    netRevenue: number
    totalPenalties: number
    totalRefunds: number
    totalRevenue: number
    activeTransactions: number
    overdueTransactions: number
    popularBooks: PopularBook[]
    monthlyStats: MonthlyStats[]
    userActivity: UserActivity[]
    bookCondition: BookCondition[]
}

// Mock data generator
const generateMockStatistics = (
    period: string = "year",
    year?: number,
    month?: number,
    quarter?: number
): StatisticsData => {
    const currentYear = new Date().getFullYear()
    const targetYear = year || currentYear

    // Generate monthly stats based on period
    const generateMonthlyStats = (): MonthlyStats[] => {
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]

        if (period === "month" && month) {
            return [
                {
                    month: months[month - 1],
                    transactions: Math.floor(Math.random() * 50) + 10,
                    revenue: Math.floor(Math.random() * 5000000) + 1000000,
                },
            ]
        }

        if (period === "quarter" && quarter) {
            const startMonth = (quarter - 1) * 3
            return months
                .slice(startMonth, startMonth + 3)
                .map((monthName) => ({
                    month: monthName,
                    transactions: Math.floor(Math.random() * 30) + 5,
                    revenue: Math.floor(Math.random() * 3000000) + 500000,
                }))
        }

        // Default: full year or week
        return months.map((monthName) => ({
            month: monthName,
            transactions: Math.floor(Math.random() * 40) + 2,
            revenue: Math.floor(Math.random() * 2000000) + 100000,
        }))
    }

    const monthlyData = generateMonthlyStats()
    const totalTransactions = monthlyData.reduce(
        (sum, stat) => sum + stat.transactions,
        0
    )
    const totalRevenue = monthlyData.reduce(
        (sum, stat) => sum + stat.revenue,
        0
    )

    return {
        totalUsers: Math.floor(Math.random() * 50) + 20,
        totalBooks: Math.floor(Math.random() * 200) + 100,
        totalTransactions,
        grossRevenue: totalRevenue + Math.floor(Math.random() * 1000000),
        netRevenue: Math.floor(Math.random() * 20000000) + 5000000,
        totalPenalties: Math.floor(Math.random() * 10000000) + 2000000,
        totalRefunds: -(Math.floor(Math.random() * 9000000) + 1000000),
        totalRevenue,
        activeTransactions: Math.floor(Math.random() * 30) + 10,
        overdueTransactions: Math.floor(Math.random() * 15) + 3,
        popularBooks: [
            {
                title: "Pháp luật đại cương",
                borrowCount: Math.floor(Math.random() * 20) + 10,
                revenue: Math.floor(Math.random() * 500000) + 100000,
            },
            {
                title: "Kinh tế học vi mô",
                borrowCount: Math.floor(Math.random() * 15) + 8,
                revenue: Math.floor(Math.random() * 400000) + 80000,
            },
            {
                title: "Lập trình Java cơ bản",
                borrowCount: Math.floor(Math.random() * 12) + 6,
                revenue: Math.floor(Math.random() * 300000) + 60000,
            },
            {
                title: "Toán cao cấp A1",
                borrowCount: Math.floor(Math.random() * 18) + 7,
                revenue: Math.floor(Math.random() * 350000) + 70000,
            },
            {
                title: "Tiếng Anh giao tiếp",
                borrowCount: Math.floor(Math.random() * 14) + 5,
                revenue: Math.floor(Math.random() * 280000) + 50000,
            },
        ]
            .sort((a, b) => b.borrowCount - a.borrowCount)
            .slice(0, 5),
        monthlyStats: monthlyData,
        userActivity: [
            {
                role: "USER",
                count: Math.floor(Math.random() * 40) + 15,
            },
            {
                role: "ADMIN",
                count: Math.floor(Math.random() * 3) + 1,
            },
            {
                role: "LIBRARIAN",
                count: Math.floor(Math.random() * 5) + 2,
            },
        ],
        bookCondition: [
            {
                condition: "NEW",
                count: Math.floor(Math.random() * 50) + 30,
            },
            {
                condition: "GOOD",
                count: Math.floor(Math.random() * 40) + 20,
            },
            {
                condition: "WORN",
                count: Math.floor(Math.random() * 15) + 5,
            },
            {
                condition: "DAMAGED",
                count: Math.floor(Math.random() * 8) + 2,
            },
        ],
    }
}

export const statisticsAPI = {
    // Get library statistics
    getStatistics: async (
        period: string = "year",
        year?: number,
        month?: number,
        quarter?: number
    ): Promise<StatisticsData | ApiError> => {
        try {
            // For now, return mock data
            // In production, this would make a real API call:
            // const response = await fetchWrapper.get(`/statistics?period=${period}&year=${year || ''}&month=${month || ''}&quarter=${quarter || ''}`)

            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 500))

            const mockData = generateMockStatistics(
                period,
                year,
                month,
                quarter
            )
            return mockData
        } catch (error) {
            return { error: "Network error while fetching statistics" }
        }
    },

    // Get statistics for a specific time range
    getStatisticsInRange: async (
        startDate: string,
        endDate: string
    ): Promise<StatisticsData | ApiError> => {
        try {
            // Simulate network delay
            await new Promise((resolve) => setTimeout(resolve, 300))

            // Generate mock data for date range
            const mockData = generateMockStatistics("custom")
            return mockData
        } catch (error) {
            return {
                error: "Network error while fetching statistics for date range",
            }
        }
    },
}
