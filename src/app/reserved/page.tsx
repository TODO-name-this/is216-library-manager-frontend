"use client";

import React, { useState, useEffect } from "react";
import { Reservation, User } from "@/lib/api/types";
import { usePageTitle } from "@/lib/usePageTitle";
import {
    deleteReservation,
  getAllReservations,
  getMyReservations,
} from "@/app/actions/reservationActions";
import { getAllUsers } from "@/app/actions/userActions";
import { createTransactionFromReservation } from "@/app/actions/transactionActions";
import { useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface ReservedBookData {
  reservation: Reservation;
  user?: User;
}

function ReservedBooks() {
  usePageTitle("Reserved Books - Scam Library");
  const { user, isAdmin, isLibrarian } = useAuth();
  const [reservedBooks, setReservedBooks] = useState<ReservedBookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);

  const isStaff = isAdmin() || isLibrarian();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);

        let reservations: Reservation[] = [];
        let users: User[] = [];

        if (isStaff) {
          // Staff can see all reservations
          reservations = await getAllReservations();
          users = await getAllUsers();
        } else {
          // Regular users see only their reservations
          reservations = await getMyReservations();
        }

        console.log("Fetched reservations:", reservations);
        const reservedBooksData: ReservedBookData[] = [];

        // Process reservations - no need to fetch book data separately as it's included
        for (const reservation of reservations) {
          let reservedBookItem: ReservedBookData = {
            reservation,
          }; // Only fetch user data if we're staff (for display purposes)
          if (isStaff) {
            const userForReservation = users.find(
              (u) => u.id === reservation.userId
            );
            reservedBookItem.user = userForReservation;
          }

          // Add to list (book data is already in reservation object)
          reservedBooksData.push(reservedBookItem);
        }

        setReservedBooks(reservedBooksData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load reservations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isStaff]);

  const handleCreateTransaction = async (
    userId: string,
    reservationId: string
  ) => {
    if (!confirm("Create transaction for this reservation?")) {
      return;
    }

    try {
      // Find the reservation to get the bookCopyId
      const reservation = reservedBooks.find(
        (item) => item.reservation.id === reservationId
      )?.reservation;

      if (!reservation) {
        alert("Reservation not found");
        return;
      }

      if (!reservation.bookCopyId) {
        alert(
          "No book copy assigned to this reservation yet. Please assign a book copy first."
        );
        return;
      }

      // Create transaction from reservation using the new API
      const transaction = await createTransactionFromReservation({
        reservationId: reservationId,
        bookCopyId: reservation.bookCopyId,
      });

      if (transaction) {
        alert("Transaction created successfully!");
        // Remove the reservation from the list since it's now converted to a transaction
        setReservedBooks((prev) =>
          prev.filter((item) => item.reservation.id !== reservationId)
        );
      } else {
        alert("Failed to create transaction");
      }
    } catch (err) {
      console.error("Error creating transaction:", err);
      alert("Failed to create transaction");
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      setReserving(true);

      const success = await deleteReservation(reservationId);
      if (success) {
        // Xóa khỏi UI
        setReservedBooks((prev) =>
          prev.filter((item) => item.reservation.id !== reservationId)
        );
        alert("Reservation cancelled successfully.");
      } else {
        alert("Failed to cancel reservation. Please try again.");
      }
    } catch (err) {
      console.error("Error canceling reservation:", err);
      alert("An error occurred while cancelling the reservation.");
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
        <p className="font-bold">Error loading reservations:</p>
        <p>{error}</p>
      </div>
    );
  }

  if (reservedBooks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No reserved books.</p>
        <p className="text-gray-500 mt-2">
          Books you reserve will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Reserved Books</h1>
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-left text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Author</th>
              {isStaff && <th className="px-4 py-3">User</th>}
              <th className="px-4 py-3">Expiration</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservedBooks.map((item, idx) => (
              <tr
                key={item.reservation.id}
                className="border-t border-gray-700 hover:bg-gray-750"
              >
                <td className="px-4 py-3 w-12">{idx + 1}</td>
                <td className="px-4 py-3 w-16">
                  <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-400"
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
                </td>
                <td className="px-4 py-3 text-blue-300 font-medium">
                  {item.reservation.bookTitle || "Unknown Title"}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {item.reservation.bookAuthors?.join(", ") || "Unknown"}
                </td>
                {isStaff && (
                  <td className="px-4 py-3 text-gray-400">
                    {item.user?.name || "Unknown User"}
                  </td>
                )}
                <td className="px-4 py-3 text-gray-400">
                  {new Date(
                    item.reservation.expirationDate
                  ).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {isStaff && (
                      <button
                        onClick={() =>
                          handleCreateTransaction(
                            item.reservation.userId,
                            item.reservation.id
                          )
                        }
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                      >
                        Create Transaction
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleCancelReservation(item.reservation.id)
                      }
                      disabled={reserving}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                    >
                      {reserving ? "Cancelling…" : "Cancel"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReservedBooksPage() {
  return (
    <ProtectedRoute>
      <ReservedBooks />
    </ProtectedRoute>
  );
}
