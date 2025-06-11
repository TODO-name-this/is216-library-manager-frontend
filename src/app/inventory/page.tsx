"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { bookCopyAPI } from "@/lib/api"
import { BookCopyWithDueInfo } from "@/lib/api/types"
import {
    Search,
    Filter,
    Package,
    AlertCircle,
    CheckCircle2,
    Wrench,
    XCircle,
    Edit,
    Trash2,
    Plus,
    Download,
    Upload,
    BarChart3,
    RefreshCw,
    CircleEllipsis,
} from "lucide-react"

export default function InventoryPage() {
    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
            <InventoryManagement />
        </ProtectedRoute>
    )
}

function InventoryManagement() {
    const { user } = useAuth()
    const [bookCopies, setBookCopies] = useState<BookCopyWithDueInfo[]>([])
    const [filteredCopies, setFilteredCopies] = useState<BookCopyWithDueInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    // Filters and search
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [conditionFilter, setConditionFilter] = useState("ALL")
    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        borrowed: 0,
        reserved: 0,
        maintenance: 0,
        lost: 0,
        overdue: 0,
    }) // Modal states
    const [selectedCopy, setSelectedCopy] = useState<BookCopyWithDueInfo | null>(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [processing, setProcessing] = useState(false)

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch enhanced book copies with due information
            const copiesResult = await bookCopyAPI.getAllBookCopiesWithDueInfo()

            // Check for API errors
            if (copiesResult.error) {
                console.error(
                    "Failed to fetch book copies:",
                    copiesResult.error
                )
                setError("Failed to load book copies")
                return
            }
            const copiesData = copiesResult.data || []

            setBookCopies(copiesData)

            // Calculate statistics including overdue
            const newStats = {
                total: copiesData.length,
                available: copiesData.filter(
                    (c: BookCopyWithDueInfo) => c.status === "AVAILABLE"
                ).length,
                borrowed: copiesData.filter(
                    (c: BookCopyWithDueInfo) => c.status === "BORROWED" && !c.isOverdue
                ).length,
                reserved: copiesData.filter(
                    (c: BookCopyWithDueInfo) => c.status === "RESERVED"
                ).length,
                maintenance: copiesData.filter(
                    (c: BookCopyWithDueInfo) => c.status === "MAINTENANCE"
                ).length,
                lost: copiesData.filter((c: BookCopyWithDueInfo) => c.status === "LOST")
                    .length,
                overdue: copiesData.filter((c: BookCopyWithDueInfo) => c.isOverdue)
                    .length,
            }
            setStats(newStats)
        } catch (error) {
            console.error("Failed to fetch inventory data:", error)
            setError("Failed to load inventory data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, []) // Filter logic
    useEffect(() => {
        let filtered = bookCopies // Search filter - now supports book title, borrower name, and CCCD search
        if (searchTerm) {
            filtered = filtered.filter(
                (copy) =>
                    copy.bookCopyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (copy.bookTitle &&
                        copy.bookTitle
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())) ||
                    (copy.borrowerName &&
                        copy.borrowerName
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())) ||
                    (copy.borrowerCccd &&
                        copy.borrowerCccd
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()))
            )
        }

        // Status filter - handle overdue separately
        if (statusFilter !== "ALL") {
            if (statusFilter === "OVERDUE") {
                filtered = filtered.filter((copy) => copy.isOverdue)
            } else {
                filtered = filtered.filter((copy) => copy.status === statusFilter && !copy.isOverdue)
            }
        }

        // Condition filter
        if (conditionFilter !== "ALL") {
            filtered = filtered.filter(
                (copy) => copy.condition === conditionFilter
            )
        }

        setFilteredCopies(filtered)
    }, [bookCopies, searchTerm, statusFilter, conditionFilter])

    const getStatusIcon = (copy: BookCopyWithDueInfo) => {
        if (copy.isOverdue) {
            return <AlertCircle className="w-4 h-4 text-red-500" />
        }
        
        switch (copy.status) {
            case "AVAILABLE":
                return <CheckCircle2 className="w-4 h-4 text-green-500" />
            case "BORROWED":
                return <CircleEllipsis className="w-4 h-4 text-blue-500" />
            case "RESERVED":
                return <Package className="w-4 h-4 text-purple-500" />
            case "MAINTENANCE":
                return <Wrench className="w-4 h-4 text-yellow-500" />
            case "LOST":
                return <XCircle className="w-4 h-4 text-white" />
            default:
                return <Package className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusColor = (copy: BookCopyWithDueInfo) => {
        if (copy.isOverdue) {
            return "bg-red-100 text-red-800 light-mode:bg-red-100"
        }
        
        switch (copy.status) {
            case "AVAILABLE":
                return "bg-green-100 text-green-800 light-mode:bg-green-100"
            case "BORROWED":
                return "bg-blue-100 text-blue-800 light-mode:bg-blue-100"
            case "RESERVED":
                return "bg-purple-100 text-purple-800 light-mode:bg-purple-100"
            case "MAINTENANCE":
                return "bg-yellow-100 text-yellow-800 light-mode:bg-yellow-100"
            case "LOST":
                return "bg-red-600 text-white light-mode:bg-red-600 light-mode:text-white"
            default:
                return "bg-gray-100 text-gray-800 light-mode:bg-gray-100"
        }
    }

    const getDisplayStatus = (copy: BookCopyWithDueInfo) => {
        return copy.isOverdue ? "OVERDUE" : copy.status
    }

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case "NEW":
                return "bg-green-100 text-green-800 light-mode:bg-green-100"
            case "GOOD":
                return "bg-blue-100 text-blue-800 light-mode:bg-blue-100"
            case "WORN":
                return "bg-yellow-100 text-yellow-800 light-mode:bg-yellow-100"
            case "DAMAGED":
                return "bg-red-100 text-red-800 light-mode:bg-red-100"
            default:
                return "bg-gray-100 text-gray-800 light-mode:bg-gray-100"
        }
    }

    const handleEditCopy = (copy: BookCopyWithDueInfo) => {
        setSelectedCopy(copy)
        setShowEditModal(true)
    }

    const handleDeleteCopy = async (copyId: string) => {
        if (
            !confirm(
                "Are you sure you want to delete this book copy? This action cannot be undone."
            )
        ) {
            return
        }

        try {
            setProcessing(true)
            const response = await bookCopyAPI.deleteBookCopy(parseInt(copyId))

            if (response.error) {
                alert(`Failed to delete book copy: ${response.error.error}`)
                return
            }

            alert("Book copy deleted successfully!")
            await fetchData() // Refresh data
        } catch (error) {
            console.error("Error deleting book copy:", error)
            alert("Failed to delete book copy")
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Loading inventory data...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={fetchData}
                            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white light-mode:bg-gray-50 light-mode:text-gray-900">
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 flex items-center">
                        <Package className="w-8 h-8 mr-3" />
                        Book Copy Inventory
                    </h1>
                    <p className="text-gray-400 light-mode:text-gray-600">
                        Manage physical book copies and track inventory status
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
                    <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 light-mode:text-gray-600">
                                    Total Copies
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats.total}
                                </p>
                            </div>
                            <Package className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 light-mode:text-gray-600">
                                    Available
                                </p>
                                <p className="text-2xl font-bold text-green-500">
                                    {stats.available}
                                </p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 light-mode:text-gray-600">
                                    Borrowed
                                </p>
                                <p className="text-2xl font-bold text-blue-500">
                                    {stats.borrowed}
                                </p>
                            </div>
                            <CircleEllipsis className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 light-mode:text-gray-600">
                                    Overdue
                                </p>
                                <p className="text-2xl font-bold text-red-500">
                                    {stats.overdue}
                                </p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 light-mode:text-gray-600">
                                    Maintenance
                                </p>
                                <p className="text-2xl font-bold text-yellow-500">
                                    {stats.maintenance}
                                </p>
                            </div>
                            <Wrench className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 light-mode:text-gray-600">
                                    Lost
                                </p>
                                <p className="text-2xl font-bold text-red-500">
                                    {stats.lost}
                                </p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200 mb-8">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by copy ID, book title, borrower name, or CCCD..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="BORROWED">Borrowed</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="LOST">Lost</option>
                        </select>

                        {/* Condition Filter */}
                        <select
                            value={conditionFilter}
                            onChange={(e) => setConditionFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="ALL">All Conditions</option>
                            <option value="NEW">New</option>
                            <option value="GOOD">Good</option>
                            <option value="WORN">Worn</option>
                            <option value="DAMAGED">Damaged</option>{" "}
                        </select>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Copy
                            </button>

                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 ${
                                        loading ? "animate-spin" : ""
                                    }`}
                                />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-gray-800 light-mode:bg-white rounded-lg border border-gray-700 light-mode:border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700 light-mode:bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Copy ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Book Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Condition
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Borrower Info
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700 light-mode:divide-gray-200">
                                {filteredCopies.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-12 text-center text-gray-400 light-mode:text-gray-500"
                                        >
                                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg mb-2">
                                                No book copies found
                                            </p>
                                            <p className="text-sm">
                                                Try adjusting your search or
                                                filter criteria
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCopies.map((copy) => (
                                        <tr
                                            key={copy.bookCopyId}
                                            className="hover:bg-gray-700 light-mode:hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Package className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="font-mono text-sm">
                                                        {copy.bookCopyId}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs">
                                                    <p className="font-medium truncate">
                                                        {copy.bookTitle ||
                                                            `Book ID: ${copy.bookTitleId}`}
                                                    </p>
                                                    <p className="text-sm text-gray-400 light-mode:text-gray-500">
                                                        Price: {copy.bookPrice ? Number(copy.bookPrice).toLocaleString() : "N/A"}₫
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                        copy
                                                    )}`}
                                                >
                                                    {getStatusIcon(copy)}
                                                    <span className="ml-1">
                                                        {getDisplayStatus(copy)}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(
                                                        copy.condition
                                                    )}`}
                                                >
                                                    {copy.condition}
                                                </span>{" "}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    {copy.borrowerName ? (
                                                        <>
                                                            <span className="font-medium text-sm">
                                                                {
                                                                    copy.borrowerName
                                                                }
                                                            </span>
                                                            <span className="text-xs text-gray-400 light-mode:text-gray-500">
                                                                CCCD:{" "}
                                                                {
                                                                    copy.borrowerCccd || "N/A"
                                                                }
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 light-mode:text-gray-500">
                                                            No borrower
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEditCopy(copy)
                                                        }
                                                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 light-mode:hover:bg-gray-100 rounded"
                                                        title="Edit Copy"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteCopy(
                                                                copy.bookCopyId
                                                            )
                                                        }
                                                        disabled={processing}
                                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 light-mode:hover:bg-gray-100 rounded disabled:opacity-50"
                                                        title="Delete Copy"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mt-4 text-sm text-gray-400 light-mode:text-gray-600">
                    Showing {filteredCopies.length} of {bookCopies.length} book
                    copies
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && selectedCopy && (
                <EditCopyModal
                    copy={selectedCopy}
                    onClose={() => {
                        setShowEditModal(false)
                        setSelectedCopy(null)
                    }}
                    onSave={fetchData}
                />
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateCopyModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={fetchData}
                />
            )}
        </div>
    )
}

// Edit Copy Modal Component
function EditCopyModal({
    copy,
    onClose,
    onSave,
}: {
    copy: BookCopyWithDueInfo
    onClose: () => void
    onSave: () => void
}) {
    const [formData, setFormData] = useState({
        status: copy.status as "AVAILABLE" | "BORROWED" | "RESERVED" | "MAINTENANCE" | "LOST",
        condition: copy.condition as "NEW" | "GOOD" | "WORN" | "DAMAGED",
    })
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const response = await bookCopyAPI.updateBookCopy(copy.bookCopyId, formData)

            if (response.data) {
                alert("Book copy updated successfully!")
                onSave() // Refresh the data
                onClose()
            } else {
                alert(response.error?.error || "Failed to update book copy")
            }
        } catch (error) {
            console.error("Error updating book copy:", error)
            alert("Failed to update book copy")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Edit Book Copy</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Copy ID
                        </label>
                        <input
                            type="text"
                            value={copy.bookCopyId}
                            disabled
                            className="w-full p-3 bg-gray-700 light-mode:bg-gray-100 border border-gray-600 light-mode:border-gray-300 rounded-lg opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    status: e.target.value as any,
                                }))
                            }
                            className="w-full p-3 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="BORROWED">Borrowed</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="LOST">Lost</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Condition
                        </label>
                        <select
                            value={formData.condition}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    condition: e.target.value as any,
                                }))
                            }
                            className="w-full p-3 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="NEW">New</option>
                            <option value="GOOD">Good</option>
                            <option value="WORN">Worn</option>
                            <option value="DAMAGED">Damaged</option>
                        </select>{" "}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Create Copy Modal Component
function CreateCopyModal({
    onClose,
    onSave,
}: {
    onClose: () => void
    onSave: () => void
}) {
    const [formData, setFormData] = useState({
        bookTitle: "",
        condition: "NEW" as const,
    })
    const [creating, setCreating] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.bookTitle) {
            alert("Please select a book title")
            return
        }

        setCreating(true)

        try {
            const response = await bookCopyAPI.createBookCopy({
                bookTitleId: formData.bookTitle,
                condition: formData.condition,
            })

            if (response.error) {
                alert(`Failed to create book copy: ${response.error.error}`)
                return
            }

            onSave()
            onClose()
        } catch (error) {
            console.error("Failed to create book copy:", error)
            alert("An error occurred while creating the book copy")
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Create New Book Copy</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Book Title *
                        </label>
                        <input
                            type="text"
                            value={formData.bookTitle}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    bookTitle: e.target.value,
                                }))
                            }
                            placeholder="Enter book title"
                            className="w-full p-3 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Condition
                        </label>
                        <select
                            value={formData.condition}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    condition: e.target.value as any,
                                }))
                            }
                            className="w-full p-3 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="NEW">New</option>
                            <option value="GOOD">Good</option>
                            <option value="WORN">Worn</option>
                            <option value="DAMAGED">Damaged</option>
                        </select>{" "}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={creating}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                        >
                            {creating ? "Creating..." : "Create Copy"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
