"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  StarHalf,
  ArrowLeft,
  Book,
  Building,
  MessageSquare,
  User,
} from "lucide-react";
import { BookTitle, Reservation, Review } from "@/lib/api/types";
import { getBookById, deleteBook } from "@/app/actions/bookActions";
import {
  createReservation,
  getReservationsByUserId,
} from "@/app/actions/reservationActions";
import { createReview } from "@/app/actions/reviewActions";
import { useAuth } from "@/lib/AuthContext";

export default function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAdmin, isLibrarian } = useAuth();

  const [book, setBook] = useState<BookTitle | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  // state for submitting review
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reserving, setReserving] = useState(false);

  const [myReservations, setMyReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    async function fetchReservations() {
      if (!user?.id) return;
      const res = await getReservationsByUserId(user.id);
      setMyReservations(res);
    }
    fetchReservations();
  }, [user?.id]);

  const totalDistinctBooksReserved = new Set(
    myReservations.map((r) => r.bookTitleId)
  ).size;

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        setError(null); // Fetch book title details (which includes reviews)
        const bookData = await getBookById(id);
        if (!bookData) {
          throw new Error("Book not found");
        }
        setBook(bookData);

        // Reviews are now included in the book response
        setReviews(bookData.reviews || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load book details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookData();
    }
  }, [id]);

  const handleReservation = async () => {
    if (!user || !book) return;

    // Check if user can make more reservations
    const totalUserRes = book?.totalUserActiveReservations || 0;
    const maxGlobal = book?.maxGlobalUserReservations ?? 5;
    if (totalUserRes >= maxGlobal) {
      alert(
        `You can only have up to ${maxGlobal} active reservations in total.`
      );
      return;
    }

    // Check if user can reserve this book
    const userResForThisBook = book.userReservationsForThisBook || 0;
    if (userResForThisBook > 0) {
      alert("You have already reserved this book.");
      return;
    }

    // Check if there are available slots
    const onlineReservations = book.onlineReservations || 0;
    const maxOnlineReservations = book.maxOnlineReservations || 0;

    if (onlineReservations >= maxOnlineReservations) {
      alert("No online reservation slots available for this book.");
      return;
    }

    try {
      setReserving(true);

      const reservationData = {
        bookTitleId: book.id,
        bookCopyId: "", // Will be assigned by backend
      };

      const result = await createReservation(reservationData);

      if (result) {
        alert("Book reserved successfully!");
        // Refresh the book data to get updated reservation counts
        window.location.reload();
      } else {
        alert("Failed to reserve book. Please try again.");
      }
    } catch (error) {
      console.error("Error reserving book:", error);
      alert("An error occurred while reserving the book.");
    } finally {
      setReserving(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.star, 0);
    return sum / reviews.length;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="w-5 h-5 fill-yellow-400 text-yellow-400"
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-600" />);
    }

    return stars;
  };

  const handleSubmitReview = async () => {
    if (!book) return;

    setSubmittingReview(true);
    try {
      const reviewData = {
        bookTitleId: book.id,
        star: newRating,
        comment: newComment.trim(),
        date: new Date().toISOString(),
      };
      const newReview = await createReview(reviewData);
      if (newReview) {
        // Add new review on top
        setReviews([newReview, ...reviews]);
        // Reset form
        setNewRating(0);
        setNewComment("");
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("An error occurred while submitting your review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!book) return;

    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the book "${book.title}"? This action cannot be undone and will also delete all related book copies, reservations, and reviews.`
    );

    if (!confirmDelete) return;

    try {
      const success = await deleteBook(book.id);

      if (success) {
        alert("Book deleted successfully!");
        router.push("/books"); // Redirect to books list
      } else {
        alert("Failed to delete book. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting book:", error);
      alert("An error occurred while deleting the book.");
    }
  };

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
    );
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
    );
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
            <div className="text-gray-300 text-lg">Book not found</div>
          </div>
        </div>
      </div>
    );
  }
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
                {/* Box for missing image placeholder */}
                <div className="w-78 min-h-96 rounded shadow-lg bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center m-0">
                  {book.imageUrl ? (
                    <img
                      className="w-full h-auto object-contain text-center"
                      src={book.imageUrl}
                      alt={book.title + " cover image"}
                    />
                  ) : (
                    <Book className="w-20 h-20 text-gray-400" />
                  )}
                </div>
                <div className="flex space-x-3 mt-5">
                  {(isAdmin() || isLibrarian()) && (
                    <>
                      <Link
                        href={`/books/edit/${book.id}`}
                        className="py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded font-medium w-fit"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={handleDeleteBook}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-top mt-4 space-y-4">
                <h2 className="text-3xl font-bold">{book.title}</h2>{" "}
                <p>
                  <strong>Author:</strong>{" "}
                  <span className="text-blue-400">
                    {book.authorNames &&
                    book.authorNames.length > 0 &&
                    book.authorIds &&
                    book.authorIds.length > 0
                      ? book.authorNames.map((authorName, index) => (
                          <span key={index}>
                            <Link
                              href={`/authors/details/${
                                book.authorIds![index]
                              }`}
                              className="hover:text-blue-300 underline"
                            >
                              {authorName}
                            </Link>
                            {index < book.authorNames.length - 1 && ", "}
                          </span>
                        ))
                      : "Unknown"}
                  </span>
                </p>
                <p>
                  <strong>Publisher:</strong> {book.publisherId || "N/A"}
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
                  {(book.categoryNames || []).join(", ") || "Uncategorized"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      book.canBorrow ? "text-green-400" : "text-red-400"
                    }
                  >
                    {book.canBorrow ? "Available" : "Unavailable"}
                  </span>
                </p>
                <div>
                  <strong>Rating:</strong>
                  <div className="inline-flex items-center ml-2">
                    {renderStars(averageRating || 0)}
                    <span className="ml-2">({reviews.length || 0})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* Sidebar - Availability Status block */}
          <aside className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow">
              <p className="text-sm text-gray-400 mb-2">Availability Status</p>
              <hr className="border-gray-700" />
              <p className="mt-3 text-lg font-semibold text-blue-400">
                {book.canBorrow ? "Available" : "Unavailable"}
              </p>
              <div className="mt-2 flex justify-between text-sm text-gray-300">
                <span>Book Information</span>
              </div>
              <hr className="my-4 border-gray-700" />{" "}
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Total copies:</span>
                  <span className="text-white font-medium">
                    {book.totalCopies || 0} total ({book.availableCopies || 0}{" "}
                    available)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Online reservations:</span>
                  <span className="text-white font-medium">
                    {book.onlineReservations || 0} of{" "}
                    {book.maxOnlineReservations || 0} slots
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Your reservations:</span>
                  <span className="text-yellow-400 font-medium">
                    {totalDistinctBooksReserved || 0} of{" "}
                    {book.maxUserReservations || 0} max
                  </span>
                </div>
              </div>{" "}
              {!user ? (
                <button
                  onClick={() => router.push("/login")}
                  className="w-full py-2 mt-4 rounded-lg font-medium transition bg-blue-600 hover:bg-blue-500"
                >
                  Login to Reserve
                </button>
              ) : isAdmin() || isLibrarian() ? (
                <div className="w-full py-2 mt-4 rounded-lg font-medium bg-gray-600 text-center text-gray-300">
                  Staff View - Users Can Reserve
                </div>
              ) : (book?.userReservationsForThisBook || 0) > 0 ? (
                <div className="w-full py-2 mt-4 rounded-lg font-medium bg-gray-600 text-center text-gray-300">
                  Already Reserved
                </div>
              ) : (book?.userReservationsForThisBook || 0) >=
                (book?.maxUserReservations || 0) ? (
                <div className="w-full py-2 mt-4 rounded-lg font-medium bg-gray-600 text-center text-gray-300">
                  Max Reservations Reached
                </div>
              ) : (
                <button
                  onClick={handleReservation}
                  disabled={
                    reserving ||
                    !book?.canBorrow ||
                    (book.userReservationsForThisBook || 0) > 0 ||
                    (book.totalUserActiveReservations || 0) >=
                      (book.maxGlobalUserReservations || 5)
                  }
                  className="w-full py-2 mt-4 rounded-lg font-medium transition bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {reserving
                    ? "Reserving..."
                    : (book.userReservationsForThisBook || 0) > 0
                    ? "Already Reserved"
                    : (book.totalUserActiveReservations || 0) >=
                      (book.maxGlobalUserReservations || 5)
                    ? `Limit of 5 Reached`
                    : book.canBorrow
                    ? "Reserve Book"
                    : "Join Waitlist"}
                </button>
              )}
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
                  {newRating > 0
                    ? `${newRating} star${newRating > 1 ? "s" : ""}`
                    : "No rating"}
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
                type="button"
                onClick={handleSubmitReview}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                disabled={
                  !newComment.trim() || newRating === 0 || submittingReview
                }
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>

          {/* Existing reviews */}
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-6">
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
                          <div className="flex">{renderStars(review.star)}</div>
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
  );
}
