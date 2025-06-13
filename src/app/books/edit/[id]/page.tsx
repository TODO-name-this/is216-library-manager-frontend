"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { usePageTitle } from "@/lib/usePageTitle"
import {
    ArrowLeft,
    Book,
    Upload,
    Eye,
    Users,
    Building,
    Tag,
    Settings,
    Plus,
    X,
} from "lucide-react"
import { getBookById, updateBook } from "@/app/actions/bookActions"
import { getAllAuthors, createAuthor } from "@/app/actions/authorActions"
import {
    getAllPublishers,
    createPublisher,
} from "@/app/actions/publisherActions"
import { getAllCategories, createCategory } from "@/app/actions/categoryActions"
import { BookTitle, Author, Publisher, Category } from "@/lib/api/types"
import { Author as LocalAuthor } from "@/types"
import ProtectedRoute from "@/components/ProtectedRoute"

function EditBookPage() {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()

    const [book, setBook] = useState<BookTitle | null>(null)

    // Set dynamic page title
    usePageTitle(book ? `Edit ${book.title} - Scam Library` : "Edit Book - Scam Library")

    const [authors, setAuthors] = useState<LocalAuthor[]>([])
    const [publishers, setPublishers] = useState<Publisher[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [showImagePreview, setShowImagePreview] = useState(false) // New item creation states
    const [showNewAuthor, setShowNewAuthor] = useState(false)
    const [showNewPublisher, setShowNewPublisher] = useState(false)
    const [showNewCategory, setShowNewCategory] = useState(false)
    const [newAuthor, setNewAuthor] = useState({
        name: "",
        avatarUrl: "",
        birthday: "",
        biography: "",
    })
    const [newPublisher, setNewPublisher] = useState({
        name: "",
        address: "",
        logoUrl: "",
        email: "",
        phone: "",
    })
    const [newCategory, setNewCategory] = useState({
        name: "",
        description: "",
    })

    // Enhanced form data to match API structure
    const [formData, setFormData] = useState({
        title: "",
        isbn: "",
        publishedDate: "",
        imageUrl: "",
        authorIds: [] as string[],
        publisherId: "",
        categoryIds: [] as string[],
        price: 0,
        canBorrow: true,
        totalCopies: 1,
        maxOnlineReservations: 1,
        // Additional fields for UI (not sent to API but used for display)
        description: "",
        pages: "",
        language: "English",
        format: "Paperback",
        weight: "",
        dimensions: "",
    })

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        try {
            setLoading(true)
            const [bookData, authorsData, publishersData, categoriesData] =
                await Promise.all([
                    getBookById(id),
                    getAllAuthors(),
                    getAllPublishers(),
                    getAllCategories(),
                ])

            if (!bookData) {
                throw new Error("Book not found")
            }

            setBook(bookData)
            setAuthors(authorsData)
            setPublishers(publishersData)
            setCategories(categoriesData)

            // Initialize form with existing book data
            setFormData({
                title: bookData.title || "",
                isbn: bookData.isbn || "",
                publishedDate: bookData.publishedDate || "",
                imageUrl: bookData.imageUrl || "",
                authorIds: bookData.authorIds || [],
                publisherId: bookData.publisherId || "",
                categoryIds: bookData.categoryIds || [],
                price: bookData.price || 0,
                canBorrow: bookData.canBorrow ?? true,
                totalCopies: bookData.totalCopies || 1,
                maxOnlineReservations: bookData.maxOnlineReservations || 1,
                // UI fields - not from API
                description: "",
                pages: "",
                language: "English",
                format: "Paperback",
                weight: "",
                dimensions: "",
            })
        } catch (error) {
            console.error("Failed to load data:", error)
            alert("Failed to load book data")
            router.push("/books")
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "price" ||
                name === "totalCopies" ||
                name === "maxOnlineReservations" ||
                name === "pages" ||
                name === "weight"
                    ? parseInt(value) || 0
                    : value,
        }))
    }

    const handleAuthorChange = (authorId: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            authorIds: checked
                ? [...prev.authorIds, authorId]
                : prev.authorIds.filter((id) => id !== authorId),
        }))
    }

    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            categoryIds: checked
                ? [...prev.categoryIds, categoryId]
                : prev.categoryIds.filter((id) => id !== categoryId),
        }))
    }

    const handleCreateAuthor = async () => {
        if (!newAuthor.name.trim()) return

        try {
            const authorData = {
                name: newAuthor.name.trim(),
                ...(newAuthor.avatarUrl && { avatarUrl: newAuthor.avatarUrl }),
                ...(newAuthor.birthday && { birthday: newAuthor.birthday }),
                ...(newAuthor.biography && {
                    biography: newAuthor.biography.trim(),
                }),
            }
            const createdAuthor = await createAuthor(authorData)
            if (createdAuthor) {
                setAuthors((prev) => [...prev, createdAuthor])
                setFormData((prev) => ({
                    ...prev,
                    authorIds: [...prev.authorIds, createdAuthor.id],
                }))
                setNewAuthor({
                    name: "",
                    avatarUrl: "",
                    birthday: "",
                    biography: "",
                })
                setShowNewAuthor(false)
            } else {
                alert("Failed to create author")
            }
        } catch (err) {
            console.error("Error creating author:", err)
            alert("Failed to create author")
        }
    }

    const handleCreatePublisher = async () => {
        if (!newPublisher.name.trim() || !newPublisher.address.trim()) {
            alert("Publisher name and address are required")
            return
        }

        try {
            const publisherData = {
                name: newPublisher.name.trim(),
                address: newPublisher.address.trim(),
                ...(newPublisher.logoUrl && { logoUrl: newPublisher.logoUrl }),
                ...(newPublisher.email && { email: newPublisher.email }),
                ...(newPublisher.phone && { phone: newPublisher.phone }),
            }
            const createdPublisher = await createPublisher(publisherData)
            if (createdPublisher) {
                setPublishers((prev) => [...prev, createdPublisher])
                setFormData((prev) => ({
                    ...prev,
                    publisherId: createdPublisher.id,
                }))
                setNewPublisher({
                    name: "",
                    address: "",
                    logoUrl: "",
                    email: "",
                    phone: "",
                })
                setShowNewPublisher(false)
            } else {
                alert("Failed to create publisher")
            }
        } catch (err) {
            console.error("Error creating publisher:", err)
            alert("Failed to create publisher")
        }
    }

    const handleCreateCategory = async () => {
        if (!newCategory.name.trim() || !newCategory.description.trim()) {
            alert("Category name and description are required")
            return
        }

        try {
            const categoryData = {
                name: newCategory.name.trim(),
                description: newCategory.description.trim(),
            }
            const createdCategory = await createCategory(categoryData)
            if (createdCategory) {
                setCategories((prev) => [...prev, createdCategory])
                setFormData((prev) => ({
                    ...prev,
                    categoryIds: [...prev.categoryIds, createdCategory.id],
                }))
                setNewCategory({ name: "", description: "" })
                setShowNewCategory(false)
            } else {
                alert("Failed to create category")
            }
        } catch (err) {
            console.error("Error creating category:", err)
            alert("Failed to create category")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (
            !formData.title.trim() ||
            !formData.isbn.trim() ||
            formData.authorIds.length === 0 ||
            !formData.publisherId ||
            !formData.publishedDate ||
            formData.price <= 0
        ) {
            alert("Please fill in all required fields")
            return
        }

        if (formData.maxOnlineReservations > formData.totalCopies) {
            alert("Max online reservations cannot exceed total copies")
            return
        }

        setSubmitting(true)
        try {
            // Prepare data for API (only the fields the API expects)
            const bookData = {
                imageUrl: formData.imageUrl || "",
                title: formData.title.trim(),
                isbn: formData.isbn.trim(),
                canBorrow: formData.canBorrow,
                price: formData.price,
                publishedDate: formData.publishedDate,
                publisherId: formData.publisherId,
                totalCopies: formData.totalCopies,
                maxOnlineReservations: formData.maxOnlineReservations,
                authorIds: formData.authorIds,
                categoryIds: formData.categoryIds,
            }

            const updatedBook = await updateBook(id, bookData)
            if (updatedBook) {
                alert("Book updated successfully!")
                router.push(`/books/details/${id}`)
            } else {
                alert("Failed to update book")
            }
        } catch (error) {
            console.error("Error updating book:", error)
            alert("Error updating book")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-white">Loading book details...</p>
                </div>
            </div>
        )
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="text-center text-white">
                    <p className="text-xl mb-4">Book not found</p>
                    <Link
                        href="/books"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Books
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/books"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Books
                    </Link>
                    <h1 className="text-3xl font-bold">Edit Book</h1>
                    <p className="text-gray-400 mt-2">
                        Update book information
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Book className="w-5 h-5 mr-2" />
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Title */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Title *
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter book title"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            {/* ISBN */}
                            <div>
                                <label
                                    htmlFor="isbn"
                                    className="block text-sm font-medium mb-2"
                                >
                                    ISBN *
                                </label>
                                <input
                                    id="isbn"
                                    name="isbn"
                                    value={formData.isbn}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter ISBN"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            {/* Published Date */}
                            <div>
                                <label
                                    htmlFor="publishedDate"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Published Date *
                                </label>
                                <input
                                    id="publishedDate"
                                    name="publishedDate"
                                    type="date"
                                    value={formData.publishedDate}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label
                                    htmlFor="price"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Price (SGD) *
                                </label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0.00"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            {/* Can Borrow Toggle */}
                            <div className="flex items-center space-x-3">
                                <input
                                    id="canBorrow"
                                    name="canBorrow"
                                    type="checkbox"
                                    checked={formData.canBorrow}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            canBorrow: e.target.checked,
                                        }))
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    disabled={submitting}
                                />
                                <label
                                    htmlFor="canBorrow"
                                    className="text-sm font-medium"
                                >
                                    Available for borrowing
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Upload className="w-5 h-5 mr-2" />
                            Book Image
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="imageUrl"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Image URL
                                </label>
                                <input
                                    id="imageUrl"
                                    name="imageUrl"
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://example.com/book-cover.jpg"
                                    disabled={submitting}
                                />
                            </div>

                            {formData.imageUrl && (
                                <div className="flex items-center space-x-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowImagePreview(
                                                !showImagePreview
                                            )
                                        }
                                        className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        {showImagePreview
                                            ? "Hide Preview"
                                            : "Show Preview"}
                                    </button>
                                </div>
                            )}

                            {showImagePreview && formData.imageUrl && (
                                <div className="mt-4">
                                    <img
                                        src={formData.imageUrl}
                                        alt="Book cover preview"
                                        className="max-w-xs max-h-64 rounded-lg border border-gray-600"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                "none"
                                            alert(
                                                "Failed to load image. Please check the URL."
                                            )
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Authors Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Authors *
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                                {authors.map((author) => (
                                    <label
                                        key={author.id}
                                        className="flex items-center space-x-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.authorIds.includes(
                                                author.id
                                            )}
                                            onChange={(e) =>
                                                handleAuthorChange(
                                                    author.id,
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                            disabled={submitting}
                                        />
                                        <span className="text-sm truncate">
                                            {author.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {/* Add New Author */}
                            <div className="border-t border-gray-700 pt-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewAuthor(!showNewAuthor)
                                    }
                                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add New Author
                                </button>

                                {showNewAuthor && (
                                    <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                                        <h4 className="text-sm font-medium mb-3 text-blue-400">
                                            Add New Author
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium mb-1">
                                                    Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newAuthor.name}
                                                    onChange={(e) =>
                                                        setNewAuthor(
                                                            (prev) => ({
                                                                ...prev,
                                                                name: e.target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="Enter author name"
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm"
                                                    onKeyPress={(e) =>
                                                        e.key === "Enter" &&
                                                        handleCreateAuthor()
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">
                                                    Avatar URL
                                                </label>
                                                <input
                                                    type="url"
                                                    value={newAuthor.avatarUrl}
                                                    onChange={(e) =>
                                                        setNewAuthor(
                                                            (prev) => ({
                                                                ...prev,
                                                                avatarUrl:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="https://example.com/avatar.jpg"
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">
                                                    Birthday
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newAuthor.birthday}
                                                    onChange={(e) =>
                                                        setNewAuthor(
                                                            (prev) => ({
                                                                ...prev,
                                                                birthday:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">
                                                    Biography
                                                </label>
                                                <textarea
                                                    value={newAuthor.biography}
                                                    onChange={(e) =>
                                                        setNewAuthor(
                                                            (prev) => ({
                                                                ...prev,
                                                                biography:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="Brief biography"
                                                    rows={2}
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm resize-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end space-x-2 mt-3">
                                            <button
                                                type="button"
                                                onClick={handleCreateAuthor}
                                                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
                                            >
                                                Create
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewAuthor(false)
                                                    setNewAuthor({
                                                        name: "",
                                                        avatarUrl: "",
                                                        birthday: "",
                                                        biography: "",
                                                    })
                                                }}
                                                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Publisher Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Building className="w-5 h-5 mr-2" />
                            Publisher *
                        </h2>

                        <div className="space-y-4">
                            <select
                                name="publisherId"
                                value={formData.publisherId}
                                onChange={handleChange}
                                className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                                disabled={submitting}
                            >
                                <option value="">Select a publisher</option>
                                {publishers.map((publisher) => (
                                    <option
                                        key={publisher.id}
                                        value={publisher.id}
                                    >
                                        {publisher.name}
                                    </option>
                                ))}
                            </select>
                            {/* Add New Publisher */}
                            <div className="border-t border-gray-700 pt-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewPublisher(!showNewPublisher)
                                    }
                                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add New Publisher
                                </button>

                                {showNewPublisher && (
                                    <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                                        <h4 className="text-sm font-medium mb-3 text-blue-400">
                                            Add New Publisher
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium mb-1">
                                                    Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newPublisher.name}
                                                    onChange={(e) =>
                                                        setNewPublisher(
                                                            (prev) => ({
                                                                ...prev,
                                                                name: e.target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="Enter publisher name"
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">
                                                    Address *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newPublisher.address}
                                                    onChange={(e) =>
                                                        setNewPublisher(
                                                            (prev) => ({
                                                                ...prev,
                                                                address:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="Publisher address"
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">
                                                    Logo URL
                                                </label>
                                                <input
                                                    type="url"
                                                    value={newPublisher.logoUrl}
                                                    onChange={(e) =>
                                                        setNewPublisher(
                                                            (prev) => ({
                                                                ...prev,
                                                                logoUrl:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="https://example.com/logo.png"
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={newPublisher.email}
                                                    onChange={(e) =>
                                                        setNewPublisher(
                                                            (prev) => ({
                                                                ...prev,
                                                                email: e.target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="contact@publisher.com"
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={newPublisher.phone}
                                                    onChange={(e) =>
                                                        setNewPublisher(
                                                            (prev) => ({
                                                                ...prev,
                                                                phone: e.target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="1234567890"
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end space-x-2 mt-3">
                                            <button
                                                type="button"
                                                onClick={handleCreatePublisher}
                                                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
                                            >
                                                Create
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewPublisher(false)
                                                    setNewPublisher({
                                                        name: "",
                                                        address: "",
                                                        logoUrl: "",
                                                        email: "",
                                                        phone: "",
                                                    })
                                                }}
                                                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Tag className="w-5 h-5 mr-2" />
                            Categories
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                                {categories.map((category) => (
                                    <label
                                        key={category.id}
                                        className="flex items-center space-x-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.categoryIds.includes(
                                                category.id
                                            )}
                                            onChange={(e) =>
                                                handleCategoryChange(
                                                    category.id,
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                            disabled={submitting}
                                        />
                                        <span className="text-sm truncate">
                                            {category.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {/* Add New Category */}
                            <div className="border-t border-gray-700 pt-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowNewCategory(!showNewCategory)
                                    }
                                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add New Category
                                </button>

                                {showNewCategory && (
                                    <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                                        <h4 className="text-sm font-medium mb-3 text-blue-400">
                                            Add New Category
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium mb-1">
                                                    Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newCategory.name}
                                                    onChange={(e) =>
                                                        setNewCategory(
                                                            (prev) => ({
                                                                ...prev,
                                                                name: e.target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="Enter category name"
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1">
                                                    Description *
                                                </label>
                                                <textarea
                                                    value={
                                                        newCategory.description
                                                    }
                                                    onChange={(e) =>
                                                        setNewCategory(
                                                            (prev) => ({
                                                                ...prev,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    placeholder="Describe this category"
                                                    rows={3}
                                                    className="w-full p-2 rounded border border-gray-600 bg-gray-600 text-white text-sm resize-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end space-x-2 mt-3">
                                            <button
                                                type="button"
                                                onClick={handleCreateCategory}
                                                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
                                            >
                                                Create
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowNewCategory(false)
                                                    setNewCategory({
                                                        name: "",
                                                        description: "",
                                                    })
                                                }}
                                                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Inventory Settings Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Settings className="w-5 h-5 mr-2" />
                            Inventory Settings
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Total Copies */}
                            <div>
                                <label
                                    htmlFor="totalCopies"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Total Copies *
                                </label>
                                <input
                                    id="totalCopies"
                                    name="totalCopies"
                                    type="number"
                                    min="1"
                                    value={formData.totalCopies}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={submitting}
                                />
                            </div>

                            {/* Max Online Reservations */}
                            <div>
                                <label
                                    htmlFor="maxOnlineReservations"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Max Online Reservations *
                                </label>
                                <input
                                    id="maxOnlineReservations"
                                    name="maxOnlineReservations"
                                    type="number"
                                    min="0"
                                    max={formData.totalCopies}
                                    value={formData.maxOnlineReservations}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={submitting}
                                />
                                <p className="text-sm text-gray-400 mt-1">
                                    Cannot exceed total copies (
                                    {formData.totalCopies})
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information Section (UI Only) */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4">
                            Additional Information
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">
                            These fields are for display purposes and won't be
                            saved to the system.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Description */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Book description or summary"
                                    disabled={submitting}
                                />
                            </div>

                            {/* Pages */}
                            <div>
                                <label
                                    htmlFor="pages"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Number of Pages
                                </label>
                                <input
                                    id="pages"
                                    name="pages"
                                    type="number"
                                    min="1"
                                    value={formData.pages}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0"
                                    disabled={submitting}
                                />
                            </div>

                            {/* Language */}
                            <div>
                                <label
                                    htmlFor="language"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Language
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={submitting}
                                >
                                    <option value="English">English</option>
                                    <option value="Chinese">Chinese</option>
                                    <option value="Malay">Malay</option>
                                    <option value="Tamil">Tamil</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Format */}
                            <div>
                                <label
                                    htmlFor="format"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Format
                                </label>
                                <select
                                    id="format"
                                    name="format"
                                    value={formData.format}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={submitting}
                                >
                                    <option value="Paperback">Paperback</option>
                                    <option value="Hardcover">Hardcover</option>
                                    <option value="eBook">eBook</option>
                                    <option value="Audiobook">Audiobook</option>
                                </select>
                            </div>

                            {/* Weight */}
                            <div>
                                <label
                                    htmlFor="weight"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Weight (grams)
                                </label>
                                <input
                                    id="weight"
                                    name="weight"
                                    type="number"
                                    min="0"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0"
                                    disabled={submitting}
                                />
                            </div>

                            {/* Dimensions */}
                            <div>
                                <label
                                    htmlFor="dimensions"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Dimensions
                                </label>
                                <input
                                    id="dimensions"
                                    name="dimensions"
                                    value={formData.dimensions}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="L x W x H (cm)"
                                    disabled={submitting}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <Link
                            href="/books"
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded-lg font-medium transition-colors flex items-center"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Updating...
                                </>
                            ) : (
                                "Update Book"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function ProtectedEditBookPage() {
    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
            <EditBookPage />
        </ProtectedRoute>
    )
}
