"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    Star,
    StarHalf,
    ArrowLeft,
    Book,
    Building,
    MessageSquare,
    User,
} from "lucide-react"
import { BookTitle, Review } from "@/lib/api/types"
import { getBookById } from "@/app/actions/bookActions"

export default function BookDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()

    const [book, setBook] = useState<BookTitle | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [newRating, setNewRating] = useState(0)
    const [newComment, setNewComment] = useState("")

    useEffect(() => {
        const fetchBookData = async () => {
            try {
                setLoading(true)
                setError(null)                // Fetch book title details (which includes reviews)
                const bookData = await getBookById(id)
                if (!bookData) {
                    throw new Error("Book not found")
                }
                setBook(bookData)

                // Reviews are now included in the book response
                setReviews(bookData.reviews || [])
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load book details"
                )
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchBookData()
        }
    }, [id])

    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0
        const sum = reviews.reduce((acc, review) => acc + review.star, 0)
        return sum / reviews.length
    }

    const renderStars = (rating: number) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 !== 0

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
            )
        }

        if (hasHalfStar) {
            stars.push(
                <StarHalf
                    key="half"
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                />
            )
        }

        const emptyStars = 5 - Math.ceil(rating)
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Star key={`empty-${i}`} className="w-5 h-5 text-gray-600" />
            )
        }

        return stars
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
                        <div className="bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-700">
                            <div className="flex gap-8">
                                <div className="w-64 h-96 bg-gray-700 rounded-lg"></div>
                                <div className="flex-1 space-y-4">
                                    <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                                    <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                                    <div className="h-20 bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/books"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Books
                    </Link>
                    <div className="bg-gray-800 rounded-lg shadow-sm p-8 text-center border border-gray-700">
                        <div className="text-red-400 text-lg font-semibold mb-2">
                            Error Loading Book
                        </div>
                        <p className="text-gray-300 mb-4">{error}</p>
                        <Link
                            href="/books"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Return to Books
                        </Link>
                    </div>
                </div>
            </div>
        )
    }
    if (!book) {
        return (
            <div className="min-h-screen bg-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/books"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Books
                    </Link>
                    <div className="bg-gray-800 rounded-lg shadow-sm p-8 text-center border border-gray-700">
                        <div className="text-gray-300 text-lg">
                            Book not found
                        </div>
                    </div>
                </div>
            </div>
        )    }
    const averageRating = calculateAverageRating();

    return (
        <main className="min-h-screen p-6 bg-gray-900 text-white">
            <div className="max-w-6xl mx-auto">
                {/* Back button */}
                <div className="mb-6">
                    <Link
                        href="/books"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Books
                    </Link>
                </div>

                {/* Main grid layout for book details and sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Book image + info */}
                        <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-8">
                            <div className="flex flex-col items-center space-y-4 flex-shrink-0">
                                {book.imageUrl ? (
                                    <img
                                        className="h-auto w-78 rounded shadow-lg"
                                        src={book.imageUrl}
                                        alt={book.title}
                                        onError={(e) => {
                                            const img =
                                                e.currentTarget as HTMLImageElement
                                            const text = encodeURIComponent(
                                                book.title
                                            )
                                            img.src = `https://via.placeholder.com/256x384/374151/9ca3af?text=${text}`
                                        }}
                                    />
                                ) : (
                                    <div className="h-96 w-78 rounded shadow-lg bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                                        <Book className="w-20 h-20 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex space-x-3">
                                    <Link
                                        href={`/books/edit/${book.id}`}
                                        className="py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded font-medium w-fit"
                                    >
                                        Edit
                                    </Link>
                                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium">
                                        Delete
                                    </button>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center space-y-4">
                                <h2 className="text-3xl font-bold">{book.title}</h2>                                <p>
                                    <strong>Author:</strong>{" "}
                                    <span className="text-blue-400">
                                        {book.authorNames && book.authorNames.length > 0 && book.authorIds && book.authorIds.length > 0
                                            ? book.authorNames.map((authorName, index) => (
                                                <span key={index}>
                                                    <Link 
                                                        href={`/authors/details/${book.authorIds![index]}`}
                                                        className="hover:text-blue-300 underline"
                                                    >
                                                        {authorName}
                                                    </Link>
                                                    {index < book.authorNames.length - 1 && ", "}
                                                </span>
                                            ))
                                            : "Unknown"
                                        }
                                    </span>
                                </p>
                                <p>
                                    <strong>Publisher:</strong>{" "}
                                    {book.publisherId || "N/A"}
                                </p>
                                <p>
                                    <strong>Publication date:</strong>{" "}
                                    {book.publishedDate || "N/A"}
                                </p>
                                <p>
                                    <strong>ISBN:</strong> {book.isbn || "N/A"}
                                </p>
                                <p>
                                    <strong>Categories:</strong>{" "}
                                    {(book.categoryNames || []).join(", ") ||
                                        "Uncategorized"}
                                </p>
                                <p>
                                    <strong>Status:</strong>{" "}
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
                                </p>
                                <div>
                                    <strong>Rating:</strong>
                                    <div className="inline-flex items-center ml-2">
                                        {renderStars(averageRating || 0)}
                                        <span className="ml-2">
                                            ({reviews.length || 0})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>                    {/* Sidebar - Availability Status block */}
                    <aside className="space-y-6">
                        <div className="p-6 bg-gray-800 rounded-lg shadow">
                            <p className="text-sm text-gray-400 mb-2">
                                Availability Status
                            </p>
                            <hr className="border-gray-700" />
                            <p className="mt-3 text-lg font-semibold text-blue-400">
                                {book.canBorrow ? "Available" : "Unavailable"}
                            </p>
                            <div className="mt-2 flex justify-between text-sm text-gray-300">
                                <span>Book Information</span>
                            </div>
                            <hr className="my-4 border-gray-700" />                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex justify-between">
                                    <span>Total copies:</span>
                                    <span className="text-white font-medium">
                                        {book.canBorrow ? "15" : "15"} available
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Online reservations:</span>
                                    <span className="text-white font-medium">
                                        {book.canBorrow ? "3" : "0"} of 5 slots
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Your reservations:</span>
                                    <span className="text-yellow-400 font-medium">
                                        2 of 5 max
                                    </span>
                                </div>
                            </div>                            <button className="w-full py-2 mt-4 rounded-lg font-medium transition bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {book.canBorrow ? "Reserve Book" : "Join Waitlist"}
                            </button>
                            <p className="mt-4 text-sm text-gray-400">
                                Contact library for availability
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                                Book details may change until reservation is complete.
                            </p>
                        </div>
                    </aside>
                </div>

                {/* Reviews section - FULL WIDTH outside the grid */}
                <div className="w-full">
                    <h3 className="mt-5 mb-6 text-2xl font-bold flex items-center">
                        <MessageSquare className="w-6 h-6 mr-2" />
                        Reviews ({reviews.length || 0})
                    </h3>
                    
                    {/* Add review form */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-semibold mb-4">Write a Review</h4>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Your Rating:
                            </label>
                            <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <button
                                        key={i}
                                        title={`${i + 1} star`}
                                        className="text-2xl text-gray-400 hover:text-yellow-400 transition-colors"
                                        onClick={() => setNewRating(i + 1)}
                                    >
                                        {i < newRating ? "★" : "☆"}
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-400">
                                    {newRating > 0 ? `${newRating} star${newRating > 1 ? 's' : ''}` : 'No rating'}
                                </span>
                            </div>
                        </div>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full rounded border border-gray-700 bg-gray-900 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            placeholder="Share your thoughts about this book..."
                        />
                        <div className="flex justify-end mt-4">
                            <button 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                disabled={!newComment.trim() || newRating === 0}
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>

                    {/* Existing reviews */}
                    <div className="space-y-4">
                        {reviews && reviews.length > 0 ? (
                            reviews.map((review, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gray-800 rounded-lg p-6"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-300" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-semibold text-blue-300">
                                                    User {review.userId}
                                                </h5>
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex">
                                                        {renderStars(review.star)}
                                                    </div>
                                                    <span className="text-sm text-gray-400">
                                                        {new Date().toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 leading-relaxed">
                                                {review.comment}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-gray-800 rounded-lg p-8 text-center">
                                <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400 text-lg">
                                    No reviews yet. Be the first to review this book!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
