"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { BookTitle } from "@/lib/api/types"
import { getAllBooks } from "@/app/actions/bookActions"
import { useAuth } from "@/lib/AuthContext"
import { usePageTitle } from "@/lib/usePageTitle"

export default function BooksPage() {
    usePageTitle("Books - Scam Library")
    const { user, isAdmin, isLibrarian } = useAuth()

    // State for books data
    const [books, setBooks] = useState<BookTitle[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // State quản lý chức năng tìm kiếm, lọc và sắp xếp
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("All")
    const [sortBy, setSortBy] = useState("title") // Load books from API
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                setLoading(true)
                setError(null)
                const booksData = await getAllBooks()
                console.log(
                    "Books page received:",
                    booksData,
                    "Type:",
                    typeof booksData,
                    "Is array?",
                    Array.isArray(booksData)
                ) // getAllBooks now always returns an array (empty array on error)
                if (Array.isArray(booksData)) {
                    setBooks(booksData)
                    if (booksData.length === 0) {
                        setError("No books found in the library")
                    }
                } else {
                    console.warn("Unexpected data format:", booksData)
                    setBooks([])
                    setError("Unexpected data format received from server")
                }
            } catch (err) {
                console.error("Books page error:", err)
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to load books"

                // Show the actual error without authentication suggestions for book listing
                setError(errorMessage)
                setBooks([]) // Ensure books is always an array
            } finally {
                setLoading(false)
            }
        }

        fetchBooks()
    }, []) // Lọc dữ liệu theo từ khóa và trạng thái
    const filteredBooks = Array.isArray(books)
        ? books.filter((book) => {
              const authorNames = (book.authorNames || []).join(" ")
              const categoryNames = (book.categoryNames || []).join(" ")
              const searchMatch =
                  book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  authorNames
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  categoryNames.toLowerCase().includes(searchTerm.toLowerCase())
              const statusMatch =
                  filterStatus === "All" ||
                  (filterStatus === "Available" && book.canBorrow) ||
                  (filterStatus === "Unavailable" && !book.canBorrow)
              return searchMatch && statusMatch
          })
        : []

    // Sắp xếp sách theo tiêu chí được chọn
    const sortedBooks = [...filteredBooks].sort((a, b) => {
        if (sortBy === "title") {
            return a.title.localeCompare(b.title)
        } else if (sortBy === "author") {
            const authorA = (a.authorNames || [])[0] || ""
            const authorB = (b.authorNames || [])[0] || ""
            return authorA.localeCompare(authorB)
        } else if (sortBy === "date") {
            const dateA = new Date(a.publishedDate)
            const dateB = new Date(b.publishedDate)
            return dateB.getTime() - dateA.getTime()
        }
        return 0
    })
    return (
        <main className="p-4 text-white bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Books List</h1>
            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}{" "}
            {/* Error State */}
            {error && (
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
                    <p className="font-bold">Error loading books:</p>
                    <p>{error}</p>
                </div>
            )}
            {/* Controls only show if not loading */}{" "}
            {!loading && (
                <>
                    {/* Phần điều khiển: tìm kiếm, lọc và sắp xếp */}
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
                        <input
                            type="text"
                            placeholder="🔍 Search by title, author, or category..."
                            className="w-64 p-2 rounded border border-gray-700 bg-gray-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="p-2 rounded border border-gray-700 bg-gray-800"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="p-2 rounded border border-gray-700 bg-gray-800"
                        >
                            <option value="title">Sort by Title</option>
                            <option value="author">Sort by Author</option>
                            <option value="date">
                                Sort by Publication Date
                            </option>
                        </select>
                    </div>{" "}
                    {/* Books count */}
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-gray-400">
                            Showing {sortedBooks.length} of {books.length} books
                        </p>

                        {/* Add Book Button for Admin/Librarian */}
                        {(isAdmin() || isLibrarian()) && (
                            <Link
                                href="/books/add"
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Add New Book
                            </Link>
                        )}
                    </div>
                </>
            )}{" "}
            {/* Hiển thị danh sách sách */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
                    {sortedBooks.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-400 text-lg">
                                No books found
                            </p>
                            {searchTerm && (
                                <p className="text-gray-500 mt-2">
                                    Try adjusting your search terms
                                </p>
                            )}
                        </div>
                    ) : (
                        sortedBooks.map((book) => (
                            <div
                                key={book.id}
                                className="group relative flex flex-col h-full rounded-xl border-2 border-gray-800 bg-gray-900 p-5 shadow-2xl transition-all hover:border-blue-500 hover:shadow-blue-500/20 hover:shadow-xl"
                            >
                                {/* Gradient Background */}
                                <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />{" "}
                                {/* Image Container */}
                                <div className="relative overflow-hidden rounded-lg w-full h-60">
                                    {book.imageUrl ? (
                                        <img
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            src={book.imageUrl}
                                            alt={book.title}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                            <svg
                                                className="w-20 h-20 text-blue-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                {/* Content */}
                                <div className="mt-5 flex flex-col flex-1 justify-between">
                                    {/* Title with Gradient Text */}
                                    <h2 className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-xl font-bold text-transparent line-clamp-2">
                                        {book.title}
                                    </h2>{" "}
                                    {/* Metadata with Icons */}
                                    <div className="mt-3 space-y-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="h-4 w-4 text-blue-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                            <span>
                                                {(book.authorNames || []).join(
                                                    ", "
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="h-4 w-4 text-blue-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <span>{book.publishedDate}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="h-4 w-4 text-blue-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                />
                                            </svg>
                                            <span>
                                                {(
                                                    book.categoryNames || []
                                                ).join(", ")}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <svg
                                                className="h-4 w-4 text-blue-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <span
                                                className={
                                                    book.canBorrow
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                }
                                            >
                                                {book.canBorrow
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Button with Icon */}
                                    <Link
                                        href={`/books/details/${book.id}`}
                                        className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2.5 font-medium text-white transition-all hover:from-blue-500 hover:to-blue-400 hover:shadow-lg"
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                                            />
                                        </svg>
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}{" "}
            {/* add book button */}
            {(isAdmin() || isLibrarian()) && (
                <Link
                    href="/books/add"
                    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all z-50"
                >
                    <span className="text-2xl leading-none">+</span>
                </Link>
            )}
        </main>
    )
}
