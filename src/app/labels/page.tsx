"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import { bookCopyAPI } from "@/lib/api"
import { BookCopy } from "@/lib/api/types"
import {
    Search,
    Filter,
    Package,
    Printer,
    QrCode,
    Download,
    CheckSquare,
    Square,
    Tag,
    Settings,
    RefreshCw,
    AlertCircle,
    Eye,
    FileText,
} from "lucide-react"

type LabelSettings = {
    format: "QR" | "BARCODE" | "SIMPLE"
    size: "SMALL" | "MEDIUM" | "LARGE"
    includeTitle: boolean
    includeISBN: boolean
    paperSize: "A4" | "LETTER" | "LABEL_PAPER"
    labelsPerRow: number
    labelsPerColumn: number
}

export default function LabelsPage() {
    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
            <LabelManagement />
        </ProtectedRoute>
    )
}

function LabelManagement() {
    const { user } = useAuth()
    const [bookCopies, setBookCopies] = useState<BookCopy[]>([])
    const [filteredCopies, setFilteredCopies] = useState<BookCopy[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Selection and filtering
    const [selectedCopies, setSelectedCopies] = useState<Set<string>>(new Set())
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [selectAll, setSelectAll] = useState(false)
    // Label settings
    const [labelSettings, setLabelSettings] = useState<LabelSettings>({
        format: "QR",
        size: "MEDIUM",
        includeTitle: true,
        includeISBN: false,
        paperSize: "A4",
        labelsPerRow: 3,
        labelsPerColumn: 8,
    })

    const [showSettings, setShowSettings] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await bookCopyAPI.getBookCopies()

            if (response.error) {
                throw new Error(response.error.error)
            }

            setBookCopies(response.data || [])
        } catch (error) {
            console.error("Failed to fetch data:", error)
            setError("Failed to load book copy data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    // Filter logic
    useEffect(() => {
        let filtered = bookCopies

        if (searchTerm) {
            filtered = filtered.filter(
                (copy) =>
                    copy.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (copy.bookTitle &&
                        copy.bookTitle
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()))
            )
        }

        if (statusFilter !== "ALL") {
            filtered = filtered.filter((copy) => copy.status === statusFilter)
        }

        setFilteredCopies(filtered)

        // Reset selection when filters change
        setSelectedCopies(new Set())
        setSelectAll(false)
    }, [bookCopies, searchTerm, statusFilter])

    const handleSelectCopy = (copyId: string) => {
        const newSelected = new Set(selectedCopies)
        if (newSelected.has(copyId)) {
            newSelected.delete(copyId)
        } else {
            newSelected.add(copyId)
        }
        setSelectedCopies(newSelected)
        setSelectAll(newSelected.size === filteredCopies.length)
    }

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedCopies(new Set())
        } else {
            setSelectedCopies(new Set(filteredCopies.map((copy) => copy.id)))
        }
        setSelectAll(!selectAll)
    }

    const handlePrintLabels = () => {
        if (selectedCopies.size === 0) {
            alert("Please select at least one book copy to print labels for")
            return
        }

        // Simple label preview functionality
        // For now, we'll just show a preview of what would be printed
        const selectedBooks = Array.from(selectedCopies)
            .map((id) => filteredCopies.find((copy) => copy.id === id))
            .filter(Boolean)

        alert(
            `Preview: ${labelSettings.format} labels for ${selectedBooks.length} book copies...\n\nThis shows what would be printed on physical labels for inventory tracking.`
        )
    }

    const handleBulkGenerate = () => {
        const availableCopies = filteredCopies.filter(
            (copy) => copy.status === "AVAILABLE"
        )

        if (availableCopies.length === 0) {
            alert("No available book copies to generate labels for")
            return
        }

        setSelectedCopies(new Set(availableCopies.map((copy) => copy.id)))
        alert(
            `Selected ${availableCopies.length} available book copies for label generation`
        )
    }

    const getLabelPreview = (): BookCopy[] => {
        const selectedData = Array.from(selectedCopies)
            .slice(0, 3)
            .map((id) => filteredCopies.find((copy) => copy.id === id))
            .filter((copy): copy is BookCopy => copy !== undefined)

        return selectedData
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Loading book copy data...</p>
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
                        <Tag className="w-8 h-8 mr-3" />
                        Book Copy Labels
                    </h1>
                    <p className="text-gray-400 light-mode:text-gray-600">
                        Generate and print physical labels for book copies with
                        QR codes or barcodes
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 light-mode:text-gray-600">
                                    Total Copies
                                </p>
                                <p className="text-2xl font-bold">
                                    {bookCopies.length}
                                </p>
                            </div>
                            <Package className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 light-mode:text-gray-600">
                                    Selected
                                </p>
                                <p className="text-2xl font-bold text-green-500">
                                    {selectedCopies.size}
                                </p>
                            </div>
                            <CheckSquare className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 light-mode:text-gray-600">
                                    Available
                                </p>
                                <p className="text-2xl font-bold text-blue-500">
                                    {
                                        bookCopies.filter(
                                            (c) => c.status === "AVAILABLE"
                                        ).length
                                    }
                                </p>
                            </div>
                            <Tag className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200">
                        <button
                            onClick={handleBulkGenerate}
                            className="w-full h-full flex flex-col items-center justify-center p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        >
                            <QrCode className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">
                                Bulk Generate
                            </span>
                        </button>
                    </div>
                </div>

                {/* Filters and Actions Bar */}
                <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 border border-gray-700 light-mode:border-gray-200 mb-8">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search book copies..."
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
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="LOST">Lost</option>
                        </select>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSettings(true)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>

                            <button
                                onClick={() => setShowPreview(true)}
                                disabled={selectedCopies.size === 0}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                <FileText className="w-4 h-4" />
                                Preview
                            </button>

                            <button
                                onClick={handlePrintLabels}
                                disabled={selectedCopies.size === 0}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                <Printer className="w-4 h-4" />
                                Print Labels ({selectedCopies.size})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Selection Controls */}
                <div className="bg-gray-800 light-mode:bg-white rounded-lg p-4 border border-gray-700 light-mode:border-gray-200 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSelectAll}
                                className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                            >
                                {selectAll ? (
                                    <CheckSquare className="w-5 h-5" />
                                ) : (
                                    <Square className="w-5 h-5" />
                                )}
                                <span>
                                    Select All ({filteredCopies.length})
                                </span>
                            </button>

                            {selectedCopies.size > 0 && (
                                <span className="text-sm text-gray-400 light-mode:text-gray-600">
                                    {selectedCopies.size} items selected
                                </span>
                            )}
                        </div>

                        {selectedCopies.size > 0 && (
                            <button
                                onClick={() => setSelectedCopies(new Set())}
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>
                </div>

                {/* Book Copies Table */}
                <div className="bg-gray-800 light-mode:bg-white rounded-lg border border-gray-700 light-mode:border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700 light-mode:bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Select
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Copy ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Book Title
                                    </th>{" "}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 light-mode:text-gray-500 uppercase tracking-wider">
                                        Label Status
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
                                            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
                                            key={copy.id}
                                            className="hover:bg-gray-700 light-mode:hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() =>
                                                        handleSelectCopy(
                                                            copy.id
                                                        )
                                                    }
                                                    className="text-blue-400 hover:text-blue-300"
                                                >
                                                    {selectedCopies.has(
                                                        copy.id
                                                    ) ? (
                                                        <CheckSquare className="w-5 h-5" />
                                                    ) : (
                                                        <Square className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <QrCode className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="font-mono text-sm">
                                                        {copy.id}
                                                    </span>
                                                </div>
                                            </td>{" "}
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
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        copy.status ===
                                                        "AVAILABLE"
                                                            ? "bg-green-100 text-green-800"
                                                            : copy.status ===
                                                              "BORROWED"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : copy.status ===
                                                              "MAINTENANCE"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}
                                                >
                                                    {copy.status}
                                                </span>{" "}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {selectedCopies.has(copy.id)
                                                        ? "Ready to Print"
                                                        : "Not Selected"}
                                                </span>
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

            {/* Settings Modal */}
            {showSettings && (
                <LabelSettingsModal
                    settings={labelSettings}
                    onSettingsChange={setLabelSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}

            {/* Preview Modal */}
            {showPreview && (
                <LabelPreviewModal
                    copies={getLabelPreview()}
                    settings={labelSettings}
                    onClose={() => setShowPreview(false)}
                    onPrint={handlePrintLabels}
                />
            )}
        </div>
    )
}

// Label Settings Modal
function LabelSettingsModal({
    settings,
    onSettingsChange,
    onClose,
}: {
    settings: LabelSettings
    onSettingsChange: (settings: LabelSettings) => void
    onClose: () => void
}) {
    const [localSettings, setLocalSettings] = useState(settings)

    const handleSave = () => {
        onSettingsChange(localSettings)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">Label Settings</h2>

                <div className="space-y-6">
                    {/* Label Format */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Label Format
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {(["QR", "BARCODE", "SIMPLE"] as const).map(
                                (format) => (
                                    <button
                                        key={format}
                                        onClick={() =>
                                            setLocalSettings((prev) => ({
                                                ...prev,
                                                format,
                                            }))
                                        }
                                        className={`p-3 rounded-lg border-2 transition-colors ${
                                            localSettings.format === format
                                                ? "border-blue-500 bg-blue-600 bg-opacity-20"
                                                : "border-gray-600 light-mode:border-gray-300 hover:border-gray-500"
                                        }`}
                                    >
                                        <div className="text-center">
                                            {format === "QR" && (
                                                <QrCode className="w-6 h-6 mx-auto mb-2" />
                                            )}
                                            {format === "BARCODE" && (
                                                <div className="w-6 h-6 mx-auto mb-2 bg-gray-600 light-mode:bg-gray-300 rounded"></div>
                                            )}
                                            {format === "SIMPLE" && (
                                                <Tag className="w-6 h-6 mx-auto mb-2" />
                                            )}
                                            <span className="text-sm">
                                                {format}
                                            </span>
                                        </div>
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Label Size */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Label Size
                        </label>
                        <select
                            value={localSettings.size}
                            onChange={(e) =>
                                setLocalSettings((prev) => ({
                                    ...prev,
                                    size: e.target.value as any,
                                }))
                            }
                            className="w-full p-3 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg"
                        >
                            <option value="SMALL">Small (1" x 1")</option>
                            <option value="MEDIUM">Medium (2" x 1")</option>
                            <option value="LARGE">Large (3" x 2")</option>
                        </select>
                    </div>

                    {/* Include Options */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Include in Label
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={localSettings.includeTitle}
                                    onChange={(e) =>
                                        setLocalSettings((prev) => ({
                                            ...prev,
                                            includeTitle: e.target.checked,
                                        }))
                                    }
                                    className="mr-2"
                                />{" "}
                                Book Title
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={localSettings.includeISBN}
                                    onChange={(e) =>
                                        setLocalSettings((prev) => ({
                                            ...prev,
                                            includeISBN: e.target.checked,
                                        }))
                                    }
                                    className="mr-2"
                                />
                                ISBN
                            </label>
                        </div>
                    </div>

                    {/* Paper Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Paper Size
                            </label>
                            <select
                                value={localSettings.paperSize}
                                onChange={(e) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        paperSize: e.target.value as any,
                                    }))
                                }
                                className="w-full p-3 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg"
                            >
                                <option value="A4">A4</option>
                                <option value="LETTER">Letter</option>
                                <option value="LABEL_PAPER">Label Paper</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Labels per Row
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={localSettings.labelsPerRow}
                                onChange={(e) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        labelsPerRow: parseInt(e.target.value),
                                    }))
                                }
                                className="w-full p-3 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Labels per Column
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={localSettings.labelsPerColumn}
                                onChange={(e) =>
                                    setLocalSettings((prev) => ({
                                        ...prev,
                                        labelsPerColumn: parseInt(
                                            e.target.value
                                        ),
                                    }))
                                }
                                className="w-full p-3 bg-gray-700 light-mode:bg-gray-50 border border-gray-600 light-mode:border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    )
}

// Label Preview Modal
function LabelPreviewModal({
    copies,
    settings,
    onClose,
    onPrint,
}: {
    copies: BookCopy[]
    settings: LabelSettings
    onClose: () => void
    onPrint: () => void
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 light-mode:bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-6">Label Preview</h2>

                <div className="mb-6 p-4 bg-gray-700 light-mode:bg-gray-100 rounded-lg">
                    <h3 className="font-medium mb-2">Settings Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            Format:{" "}
                            <span className="font-medium">
                                {settings.format}
                            </span>
                        </div>
                        <div>
                            Size:{" "}
                            <span className="font-medium">{settings.size}</span>
                        </div>
                        <div>
                            Paper:{" "}
                            <span className="font-medium">
                                {settings.paperSize}
                            </span>
                        </div>
                        <div>
                            Layout:{" "}
                            <span className="font-medium">
                                {settings.labelsPerRow} ×{" "}
                                {settings.labelsPerColumn}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-medium mb-4">
                        Preview (Showing first 3 selected items)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {copies.map((copy) => (
                            <div
                                key={copy.id}
                                className="border border-gray-600 light-mode:border-gray-300 rounded p-4 bg-white text-black text-center"
                            >
                                {/* QR Code Placeholder */}
                                {settings.format === "QR" && (
                                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 border-2 border-gray-400 flex items-center justify-center">
                                        <QrCode className="w-8 h-8" />
                                    </div>
                                )}
                                {/* Barcode Placeholder */}
                                {settings.format === "BARCODE" && (
                                    <div className="w-full h-8 mx-auto mb-2 bg-gray-200 border border-gray-400 flex items-center justify-center">
                                        <div className="text-xs">
                                            |||||||||||
                                        </div>
                                    </div>
                                )}
                                {/* Copy ID */}
                                <div className="font-mono text-xs font-bold mb-1">
                                    {copy.id}
                                </div>{" "}
                                {/* Optional fields */}
                                {settings.includeTitle && copy.bookTitle && (
                                    <div className="text-xs truncate mb-1">
                                        {copy.bookTitle}
                                    </div>
                                )}
                                {settings.includeISBN && (
                                    <div className="text-xs text-gray-600">
                                        Price: {copy.bookPrice ? Number(copy.bookPrice).toLocaleString() : "N/A"}₫
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                    >
                        Close Preview
                    </button>
                    <button
                        onClick={() => {
                            onPrint()
                            onClose()
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print Labels
                    </button>
                </div>
            </div>
        </div>
    )
}
