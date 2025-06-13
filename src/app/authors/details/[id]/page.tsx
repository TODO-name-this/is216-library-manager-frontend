"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { BookTitle, Author } from "@/lib/api/types"
import { getAuthorByIdApi } from "@/app/actions/authorActions"

interface AuthorWithBooks extends Author {
    bookIds?: string[]
    bookNames?: string[]
    bookUrls?: string[]
    publisherIds?: string[]
    publisherNames?: string[]
}

export default function AuthorDetailPage() {
    const { id } = useParams<{ id: string }>()
    const [author, setAuthor] = useState<AuthorWithBooks | null>(null)
    const [books, setBooks] = useState<BookTitle[]>([])
    const [publisherNames, setPublisherNames] = useState<string[]>([]) // Store publisher names separately
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchAuthorData = async () => {
            try {
                setLoading(true)
                setError(null)
                // Fetch author details - use string ID directly since API uses string IDs
                const authorData = (await getAuthorByIdApi(
                    id
                )) as AuthorWithBooks
                if (!authorData) {
                    throw new Error("Author not found")
                }
                setAuthor(authorData) // Create book objects from the author data (bookIds, bookNames, bookUrls)
                if (
                    authorData.bookIds &&
                    authorData.bookNames &&
                    authorData.bookIds.length > 0
                ) {
                    const authorBooks: BookTitle[] = authorData.bookIds.map(
                        (bookId, index) => ({
                            id: bookId,
                            title:
                                authorData.bookNames![index] || "Unknown Title",
                            imageUrl:
                                authorData.bookUrls?.[index] ||
                                "https://via.placeholder.com/200x300?text=No+Image", // Default image URL instead of null
                            authorNames: [authorData.name], // Current author
                            publisherId:
                                authorData.publisherIds?.[index] ||
                                "Unknown Publisher ID", // Use actual publisher ID from API
                            // Add other required BookTitle properties with defaults
                            isbn: "",
                            publishedDate: "",
                            status: "Available",
                            rating: 0,
                            ratingCount: 0,
                            categoryNames: [],
                            categoryIds: [], // Required property
                            authorIds: [authorData.id],
                            reviews: [],
                            canBorrow: true, // Required property - default to true
                            price: 0, // Required property
                            totalCopies: 0, // Required property
                            availableCopies: 0, // Required property
                            onlineReservations: 0, // Required property
                            maxOnlineReservations: 0, // Required property
                            userReservationsForThisBook: null, // Required property
                            maxUserReservations: null, // Required property
                            totalUserActiveReservations: 0, // Required property
                            maxGlobalUserReservations: 5, // Required property
                        })
                    )
                    setBooks(authorBooks)
                    setPublisherNames(authorData.publisherNames || []) // Store publisher names separately
                } else {
                    setBooks([])
                    setPublisherNames([])
                }
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load author details"
                )
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchAuthorData()
        }
    }, [id])

    if (loading) {
        return (
            <div className="p-4 text-white bg-gray-900 min-h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 text-white bg-gray-900 min-h-screen">
                <div className="mb-6">
                    <Link
                        href="/authors"
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
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
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back
                    </Link>
                </div>
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
                    <p className="font-bold">Error loading author:</p>
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    if (!author) {
        return (
            <div className="p-4 text-white bg-gray-900 min-h-screen">
                <div className="mb-6">
                    <Link
                        href="/authors"
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
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
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back
                    </Link>
                </div>
                <p>Author not found.</p>
            </div>
        )
    }
    return (
        <div className="p-4 text-white bg-gray-900 min-h-screen">
            <div className="px-4 sm:px-0">
                <div className="mb-6">
                    {/* Back button */}
                    <Link
                        href="/authors"
                        className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
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
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back
                    </Link>
                </div>{" "}
                <div className="mb-8 bg-gray-800 rounded-xl p-6 shadow-lg flex flex-col sm:flex-row items-center gap-6">
                    {/* Author Avatar */}
                    <div className="w-64 h-64 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-gray-700 flex items-center justify-center overflow-hidden">
                        {author.avatarUrl ? (
                            <img
                                src={author.avatarUrl}
                                alt={author.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg
                                className="w-24 h-24 text-blue-400"
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
                        )}
                    </div>{" "}
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-white">
                            {author.name}
                        </h1>
                        {author.birthday && (
                            <p className="mt-2 text-gray-400">
                                Born:{" "}
                                {new Date(author.birthday).toLocaleDateString(
                                    "en-US",
                                    {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }
                                )}
                            </p>
                        )}
                        {author.biography && (
                            <p className="mt-3 text-gray-300 italic">
                                "{author.biography}"
                            </p>
                        )}
                        <p className="mt-3 text-gray-300">
                            This author has written {books.length}{" "}
                            {books.length === 1 ? "book" : "books"} in our
                            library.
                        </p>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                    Books by {author.name}
                </h2>
                {books.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-lg text-gray-300">
                            No books found for this author.
                        </p>
                        <p className="text-gray-500 mt-2">
                            Books by this author will appear here when
                            available.
                        </p>
                    </div>
                ) : (
                    <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {books.map((book, index) => (
                            <div
                                key={book.id}
                                className="group relative flex flex-col h-full rounded-xl border-2 border-gray-800 bg-gray-900 p-5 shadow-2xl transition-all hover:border-blue-500 hover:shadow-blue-500/20 hover:shadow-xl"
                            >
                                {/* Gradient Background */}
                                <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                {/* Image Container */}
                                <div className="relative overflow-hidden rounded-lg w-full h-60">
                                    {book.imageUrl ? (
                                        <img
                                            src={book.imageUrl}
                                            alt={book.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
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

                                {/* Book Info */}
                                <div className="mt-5 flex flex-col flex-1 justify-between">
                                    <h3 className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-xl font-bold text-transparent line-clamp-2">
                                        {book.title}
                                    </h3>
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
                                                {book.authorNames?.join(", ") ||
                                                    "Unknown Author"}
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
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                            <span>
                                                {publisherNames[index] ||
                                                    "Unknown Publisher"}
                                            </span>
                                        </div>
                                    </div>

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
                        ))}
                    </main>
                )}
            </div>
        </div>
    )
}
