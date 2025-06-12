"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import { transactionAPI } from "@/lib/api/transactionAPI"
import { userAPI } from "@/lib/api/userAPI"
import { bookCopyAPI } from "@/lib/api/bookCopyAPI"
import { User, BookCopy, CreateTransactionDto } from "@/lib/api/types"
import {
    Search,
    BookOpen,
    User as UserIcon,
    Calendar,
    CheckCircle,
    AlertTriangle,
    Scan,
    RefreshCw,
} from "lucide-react"

export default function BorrowBookPage() {
    const router = useRouter()

    // Form states
    const [userId, setUserId] = useState("")
    const [bookCopyId, setBookCopyId] = useState("")
    const [dueDate, setDueDate] = useState("")

    // Search states
    const [userSearch, setUserSearch] = useState("")
    const [bookCopySearch, setBookCopySearch] = useState("")
    const [users, setUsers] = useState<User[]>([])
    const [bookCopies, setBookCopies] = useState<BookCopy[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [filteredBookCopies, setFilteredBookCopies] = useState<BookCopy[]>([])

    // Selected items
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [selectedBookCopy, setSelectedBookCopy] = useState<BookCopy | null>(
        null
    )

    // UI states
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    useEffect(() => {
        loadInitialData()
        setDefaultDueDate()
    }, [])

    useEffect(() => {
        // Filter users based on search
        if (userSearch.trim()) {
            const filtered = users.filter(
                (user) =>
                    user.name
                        .toLowerCase()
                        .includes(userSearch.toLowerCase()) ||
                    user.cccd.includes(userSearch) ||
                    user.email.toLowerCase().includes(userSearch.toLowerCase())
            )
            setFilteredUsers(filtered)
        } else {
            setFilteredUsers([])
        }
    }, [userSearch, users])

    useEffect(() => {
        // Filter available book copies based on search
        if (bookCopySearch.trim()) {
            const availableCopies = bookCopies.filter(
                (copy) => copy.status === "AVAILABLE"
            )
            const filtered = availableCopies.filter(
                (copy) =>
                    copy.id
                        .toLowerCase()
                        .includes(bookCopySearch.toLowerCase()) ||
                    copy.bookTitle
                        ?.toLowerCase()
                        .includes(bookCopySearch.toLowerCase())
            )
            setFilteredBookCopies(filtered)
        } else {
            setFilteredBookCopies([])
        }
    }, [bookCopySearch, bookCopies])

    const loadInitialData = async () => {
        setIsLoading(true)
        try {
            const [usersResponse, bookCopiesResponse] = await Promise.all([
                userAPI.getUsers(),
                bookCopyAPI.getBookCopies(),
            ])

            if (usersResponse.data) {
                setUsers(usersResponse.data)
            } else {
                setError("Failed to load users")
            }

            if (bookCopiesResponse.data) {
                setBookCopies(bookCopiesResponse.data)
            } else {
                setError("Failed to load book copies")
            }
        } catch (err) {
            setError("Failed to load initial data")
        } finally {
            setIsLoading(false)
        }
    }

    const setDefaultDueDate = () => {
        // Set default due date to 14 days from now
        const today = new Date()
        const defaultDue = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
        setDueDate(defaultDue.toISOString().split("T")[0])
    }

    const handleUserSelect = (user: User) => {
        setSelectedUser(user)
        setUserId(user.id)
        setUserSearch(user.name)
        setFilteredUsers([])
    }

    const handleBookCopySelect = (bookCopy: BookCopy) => {
        setSelectedBookCopy(bookCopy)
        setBookCopyId(bookCopy.id)
        setBookCopySearch(`${bookCopy.id} - ${bookCopy.bookTitle}`)
        setFilteredBookCopies([])
    }

    const handleScanUser = () => {
        // Mock CCCD scanning
        const mockCCCD = "123456789012"
        setUserSearch(mockCCCD)
    }

    const handleScanBookCopy = () => {
        // Mock book copy barcode scanning
        const mockBarcode = "BCP001"
        setBookCopySearch(mockBarcode)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!userId || !bookCopyId || !dueDate) {
            setError("Please fill in all required fields")
            return
        }

        if (new Date(dueDate) <= new Date()) {
            setError("Due date must be in the future")
            return
        }

        setIsLoading(true)
        setError("")
        setSuccessMessage("")

        try {
            const borrowData: CreateTransactionDto = {
                userId,
                bookCopyId,
                dueDate,
            }

            const response = await transactionAPI.borrowBook(borrowData)

            if (response.data) {
                setSuccessMessage(
                    `Book borrowed successfully! Transaction ID: ${response.data.id}`
                )
                // Reset form
                resetForm()
                // Refresh book copies to update availability
                loadInitialData()
            } else {
                setError(response.error?.error || "Failed to borrow book")
            }
        } catch (err) {
            setError("Error processing borrow request")
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setUserId("")
        setBookCopyId("")
        setUserSearch("")
        setBookCopySearch("")
        setSelectedUser(null)
        setSelectedBookCopy(null)
        setFilteredUsers([])
        setFilteredBookCopies([])
        setDefaultDueDate()
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount)
    }

    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
            <div className="min-h-screen bg-gray-900 text-white p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <BookOpen className="h-8 w-8" />
                            Mượn Sách
                        </h1>
                        <button
                            onClick={() => router.back()}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Quay lại
                        </button>
                    </div>

                    {/* Success/Error Messages */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded mb-6 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* User Selection */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                Chọn Người Dùng
                            </h2>

                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm người dùng (tên, CCCD, email)..."
                                        value={userSearch}
                                        onChange={(e) =>
                                            setUserSearch(e.target.value)
                                        }
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleScanUser}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Scan className="h-4 w-4" />
                                    Quét CCCD
                                </button>
                            </div>

                            {/* User Search Results */}
                            {filteredUsers.length > 0 && (
                                <div className="bg-gray-700 border border-gray-600 rounded-lg max-h-40 overflow-y-auto">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() =>
                                                handleUserSelect(user)
                                            }
                                            className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                                        >
                                            <div className="font-medium">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                CCCD: {user.cccd} | Email:{" "}
                                                {user.email}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                Số dư:{" "}
                                                {formatCurrency(user.balance)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Selected User Display */}
                            {selectedUser && (
                                <div className="mt-4 bg-green-500/20 border border-green-500 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-green-300 mb-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Người dùng đã chọn:
                                    </div>
                                    <div className="text-white font-medium">
                                        {selectedUser.name}
                                    </div>
                                    <div className="text-gray-300 text-sm">
                                        CCCD: {selectedUser.cccd}
                                    </div>
                                    <div className="text-gray-300 text-sm">
                                        Số dư:{" "}
                                        {formatCurrency(selectedUser.balance)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Book Copy Selection */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Chọn Bản Sao Sách
                            </h2>

                            <div className="flex gap-4 mb-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm sách (ID bản sao, tên sách)..."
                                        value={bookCopySearch}
                                        onChange={(e) =>
                                            setBookCopySearch(e.target.value)
                                        }
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleScanBookCopy}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Scan className="h-4 w-4" />
                                    Quét Barcode
                                </button>
                            </div>

                            {/* Book Copy Search Results */}
                            {filteredBookCopies.length > 0 && (
                                <div className="bg-gray-700 border border-gray-600 rounded-lg max-h-40 overflow-y-auto">
                                    {filteredBookCopies.map((copy) => (
                                        <div
                                            key={copy.id}
                                            onClick={() =>
                                                handleBookCopySelect(copy)
                                            }
                                            className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                                        >
                                            <div className="font-medium">
                                                {copy.id} - {copy.bookTitle}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                Tình trạng: {copy.condition} |
                                                Giá:{" "}
                                                {formatCurrency(
                                                    copy.bookPrice || 0
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Selected Book Copy Display */}
                            {selectedBookCopy && (
                                <div className="mt-4 bg-green-500/20 border border-green-500 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-green-300 mb-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Sách đã chọn:
                                    </div>
                                    <div className="text-white font-medium">
                                        {selectedBookCopy.bookTitle}
                                    </div>
                                    <div className="text-gray-300 text-sm">
                                        ID: {selectedBookCopy.id}
                                    </div>
                                    <div className="text-gray-300 text-sm">
                                        Tình trạng: {selectedBookCopy.condition}
                                    </div>
                                    <div className="text-gray-300 text-sm">
                                        Giá:{" "}
                                        {formatCurrency(
                                            selectedBookCopy.bookPrice || 0
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Due Date */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Ngày Hạn Trả
                            </h2>

                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                min={
                                    new Date(Date.now() + 24 * 60 * 60 * 1000)
                                        .toISOString()
                                        .split("T")[0]
                                } // Tomorrow minimum
                                required
                                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-gray-400 text-sm mt-2">
                                Mặc định: 14 ngày từ hôm nay
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={
                                    isLoading ||
                                    !userId ||
                                    !bookCopyId ||
                                    !dueDate
                                }
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-5 w-5" />
                                        Xác nhận mượn sách
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg transition-colors"
                            >
                                Đặt lại
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    )
}
