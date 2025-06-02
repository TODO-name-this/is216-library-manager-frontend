"use client"

import React, { useState, useEffect, ChangeEvent, use } from "react"
import { useRouter } from "next/navigation"
import { getAllUsers } from "@/app/actions/userActions"
import { getReservationsByUserId } from "@/app/actions/reservationActions"
import { createTransaction } from "@/app/actions/transactionActions"
import { User, Reservation } from "@/lib/api/types"
import Link from "next/link"

interface TransactionDetail {
    bookCopyId: string
    title: string
    author: string
    dueDate: string
}

export default function TransactionDetailsPage({
    params,
}: {
    params: Promise<{ userId: string }>
}) {
    const { userId } = use(params)
    const router = useRouter()

    const [user, setUser] = useState<User | null>(null)
    const [reservations, setReservations] = useState<Reservation[]>([])
    const [details, setDetails] = useState<TransactionDetail[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Get all users to find user by userId (assuming userId is ID or similar identifier)
                const users = await getAllUsers()
                const foundUser = users.find(
                    (u) => u.id.toString() === userId || u.cccd === userId
                )

                if (!foundUser) {
                    throw new Error("User not found")
                }

                setUser(foundUser)

                // Get user reservations
                const userReservations = await getReservationsByUserId(
                    Number(foundUser.id)
                )
                setReservations(userReservations)                // Build transaction details from reservations
                const transactionDetails: TransactionDetail[] = [];
                for (const reservation of userReservations) {
                    if (reservation.status === "APPROVED") {
                        // Book details are already included in the reservation response
                        transactionDetails.push({
                            bookCopyId: reservation.bookCopyId || reservation.bookTitleId, // Use bookCopyId if available, otherwise bookTitleId
                            title: reservation.bookTitle,
                            author: reservation.bookAuthors.join(", ") || "Unknown",
                            dueDate: new Date(
                                Date.now() + 14 * 24 * 60 * 60 * 1000
                            )
                                .toISOString()
                                .slice(0, 10), // 14 days from now
                        })
                    }
                }

                setDetails(transactionDetails)
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

    const handleChange = (
        index: number,
        field: keyof TransactionDetail,
        value: string
    ) => {
        setDetails((prev) =>
            prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
        )
    }

    const handleRemove = (index: number) => {
        setDetails((prev) => prev.filter((_, i) => i !== index))
    }
    const handleSave = async () => {
        if (!confirm("Are you sure you want to create these transactions?"))
            return

        try {
            setSubmitting(true)
            setError(null)            // Create transactions for each detail
            for (const detail of details) {
                const transactionData = {
                    userId: user?.id || userId,
                    borrowDate: new Date().toISOString().split('T')[0], // Today
                    dueDate: detail.dueDate,
                }

                await createTransaction(transactionData)
            }

            alert("Transactions created successfully.")
            router.push("/transactions")
        } catch (err) {
            console.error("Error creating transactions:", err)
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create transactions"
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleBack = () => {
        router.back()
    }
    if (loading) {
        return (
            <main className="p-6 bg-gray-900 text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="mt-2">Loading transaction details...</p>
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
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
                >
                    Go Back
                </button>
            </main>
        )
    }

    return (
        <main className="p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-4">
                Chi tiết đặt sách của: {user?.name || userId}
            </h1>

            {submitting && (
                <div className="bg-blue-600 text-white p-4 rounded mb-4">
                    <p>Creating transactions...</p>
                </div>
            )}

            <div className="overflow-x-auto bg-gray-900 rounded mb-6">
                <table className="w-full text-left text-white bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-4">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">Copy ID</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Author</th>
                            <th className="px-4 py-3">Due Date</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.map((d, index) => (
                            <tr
                                key={d.bookCopyId}
                                className="border-t border-gray-700"
                            >
                                <td className="px-4 py-3 text-gray-500">
                                    {d.bookCopyId}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {d.title}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                    {d.author}
                                </td>
                                <td className="px-4 py-3">
                                    <input
                                        type="date"
                                        value={d.dueDate}
                                        className="p-1 rounded border border-gray-700 bg-gray-800 text-gray-300"
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            handleChange(
                                                index,
                                                "dueDate",
                                                e.target.value
                                            )
                                        }
                                        disabled={submitting}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleRemove(index)}
                                        className="px-2 py-1 bg-red-600 rounded hover:bg-red-500"
                                        disabled={submitting}
                                    >
                                        Hủy cuốn
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {details.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-4 py-3 text-center text-gray-400"
                                >
                                    Không có sách để mượn.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex space-x-4">
                <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    disabled={submitting}
                >
                    Quay lại
                </button>
                <Link
                    href="/transactions"
                    className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                    Hủy
                </Link>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400 disabled:bg-gray-600"
                    disabled={submitting || details.length === 0}
                >
                    {submitting ? "Đang lưu..." : "Lưu"}
                </button>
            </div>
        </main>
    )
}
