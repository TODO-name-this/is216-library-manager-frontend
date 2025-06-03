"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { createBook } from "@/app/actions/bookActions"
import { getAllAuthors, createAuthor } from "@/app/actions/authorActions"
import {
    getAllPublishers,
    createPublisher,
} from "@/app/actions/publisherActions"
import { getAllCategories, createCategory } from "@/app/actions/categoryActions"
import { Author, Publisher, Category } from "@/lib/api/types"
import { Author as LocalAuthor } from "@/types"
import ProtectedRoute from "@/components/ProtectedRoute"

function AddBookPage() {
    const router = useRouter()
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
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [authorsData, publishersData, categoriesData] =
                await Promise.all([
                    getAllAuthors(),
                    getAllPublishers(),
                    getAllCategories(),
                ])
            setAuthors(authorsData)
            setPublishers(publishersData)
            setCategories(categoriesData)
        } catch (error) {
            console.error("Failed to load data:", error)
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

            const newBook = await createBook(bookData)
            if (newBook) {
                alert("Book added successfully!")
                router.push("/books")
            } else {
                alert("Failed to add book")
            }
        } catch (error) {
            console.error("Error adding book:", error)
            alert("Error adding book")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-white">Loading data...</p>
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
                    <h1 className="text-3xl font-bold">Add New Book</h1>
                    <p className="text-gray-400 mt-2">
                        Add a new book to the library system
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
                                    placeholder="978-0-123456-78-9"
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
                                    Publication Date *
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
                                    Price (VND) *
                                </label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="450000"
                                    required
                                    disabled={submitting}
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Required as downpayment for borrowing
                                </p>
                            </div>

                            {/* Can Borrow */}
                            <div>
                                <label
                                    htmlFor="canBorrow"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Available for Borrowing
                                </label>
                                <select
                                    id="canBorrow"
                                    name="canBorrow"
                                    value={formData.canBorrow.toString()}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            canBorrow:
                                                e.target.value === "true",
                                        }))
                                    }
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    disabled={submitting}
                                >
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>
                            </div>

                            {/* Description - For UI display */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium mb-2 text-gray-400"
                                >
                                    Description{" "}
                                    <span className="text-gray-500">
                                        (For UI display only)
                                    </span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    placeholder="Brief description of the book"
                                    disabled={submitting}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Upload className="w-5 h-5 mr-2" />
                            Book Cover Image
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://example.com/book-cover.jpg"
                                    disabled={submitting}
                                />
                                <div className="flex items-center mt-2 space-x-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowImagePreview(
                                                !showImagePreview
                                            )
                                        }
                                        className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        {showImagePreview ? "Hide" : "Preview"}
                                    </button>
                                </div>
                            </div>

                            {/* Image Preview */}
                            {showImagePreview && formData.imageUrl && (
                                <div>
                                    <p className="text-sm font-medium mb-2">
                                        Preview
                                    </p>
                                    <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Book cover preview"
                                            className="max-w-full h-48 object-contain mx-auto rounded"
                                            onError={(e) => {
                                                const img =
                                                    e.currentTarget as HTMLImageElement
                                                img.src =
                                                    "https://via.placeholder.com/200x300/374151/9ca3af?text=No+Image"
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Authors Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Authors *
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowNewAuthor(!showNewAuthor)}
                                className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add New Author
                            </button>
                        </div>{" "}
                        {showNewAuthor && (
                            <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
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
                                                setNewAuthor((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
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
                                                setNewAuthor((prev) => ({
                                                    ...prev,
                                                    avatarUrl: e.target.value,
                                                }))
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
                                                setNewAuthor((prev) => ({
                                                    ...prev,
                                                    birthday: e.target.value,
                                                }))
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
                                                setNewAuthor((prev) => ({
                                                    ...prev,
                                                    biography: e.target.value,
                                                }))
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {authors.map((author) => (
                                <label
                                    key={author.id}
                                    className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
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
                                        className="rounded border-gray-500 text-blue-600 focus:ring-blue-500"
                                        disabled={submitting}
                                    />
                                    <span className="text-sm">
                                        {author.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {formData.authorIds.length === 0 && (
                            <p className="text-red-400 text-sm mt-2">
                                Please select at least one author
                            </p>
                        )}
                    </div>

                    {/* Publisher Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center">
                                <Building className="w-5 h-5 mr-2" />
                                Publisher *
                            </h2>
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
                        </div>{" "}
                        {showNewPublisher && (
                            <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
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
                                                setNewPublisher((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
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
                                                setNewPublisher((prev) => ({
                                                    ...prev,
                                                    address: e.target.value,
                                                }))
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
                                                setNewPublisher((prev) => ({
                                                    ...prev,
                                                    logoUrl: e.target.value,
                                                }))
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
                                                setNewPublisher((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
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
                                                setNewPublisher((prev) => ({
                                                    ...prev,
                                                    phone: e.target.value,
                                                }))
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
                                <option key={publisher.id} value={publisher.id}>
                                    {publisher.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Categories Section */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold flex items-center">
                                <Tag className="w-5 h-5 mr-2" />
                                Categories
                            </h2>
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
                        </div>{" "}
                        {showNewCategory && (
                            <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
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
                                                setNewCategory((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
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
                                            value={newCategory.description}
                                            onChange={(e) =>
                                                setNewCategory((prev) => ({
                                                    ...prev,
                                                    description: e.target.value,
                                                }))
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categories.map((category) => (
                                <label
                                    key={category.id}
                                    className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
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
                                        className="rounded border-gray-500 text-blue-600 focus:ring-blue-500"
                                        disabled={submitting}
                                    />
                                    <span className="text-sm">
                                        {category.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Physical Details Section - For UI display */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 opacity-80">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Book className="w-5 h-5 mr-2" />
                            Physical Details{" "}
                            <span className="text-sm text-gray-400 ml-2">
                                (For UI display only)
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    value={formData.pages}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="300"
                                    disabled={submitting}
                                />
                            </div>

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
                                    <option value="Vietnamese">
                                        Vietnamese
                                    </option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

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
                                    <option value="E-book">E-book</option>
                                    <option value="Audiobook">Audiobook</option>
                                </select>
                            </div>

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
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="500"
                                    disabled={submitting}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="dimensions"
                                    className="block text-sm font-medium mb-2"
                                >
                                    Dimensions (L x W x H in cm)
                                </label>
                                <input
                                    id="dimensions"
                                    name="dimensions"
                                    value={formData.dimensions}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="20 x 15 x 2"
                                    disabled={submitting}
                                />
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
                                <p className="text-xs text-gray-400 mt-1">
                                    Physical copies to be created
                                </p>
                            </div>

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
                                <p className="text-xs text-gray-400 mt-1">
                                    Cannot exceed total copies
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-between pt-6">
                        <Link
                            href="/books"
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors flex items-center"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Adding Book...
                                </>
                            ) : (
                                "Add Book"
                            )}
                        </button>{" "}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function AddBookPageProtected() {
    return (
        <ProtectedRoute requiredRole={["ADMIN", "LIBRARIAN"]}>
            <AddBookPage />
        </ProtectedRoute>
    )
}
