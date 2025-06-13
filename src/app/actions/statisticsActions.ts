"use client"

import { statisticsAPI, StatisticsData } from "@/lib/api/statisticsAPI"

export async function getStatistics(
    period: string = "year",
    year?: number,
    month?: number,
    quarter?: number
): Promise<StatisticsData | null> {
    try {
        const response = await statisticsAPI.getStatistics(
            period,
            year,
            month,
            quarter
        )
        if ("error" in response) {
            console.error("Failed to fetch statistics:", response.error)
            return null
        }
        return response
    } catch (error) {
        console.error("Error fetching statistics:", error)
        throw error
    }
}

export async function getStatisticsInRange(
    startDate: string,
    endDate: string
): Promise<StatisticsData | null> {
    try {
        const response = await statisticsAPI.getStatisticsInRange(
            startDate,
            endDate
        )
        if ("error" in response) {
            console.error(
                "Failed to fetch statistics for date range:",
                response.error
            )
            return null
        }
        return response
    } catch (error) {
        console.error("Error fetching statistics for date range:", error)
        throw error
    }
}
